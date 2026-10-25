
import { randomBytes } from 'node:crypto';
import mongoose from 'mongoose';

import Ticket from '../models/Ticket.js';
import Author from '../models/Author.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';
import {
    classifyTicket,
    draftResponse,
} from '../services/ai/assistant.js';

const populated = 'author assignedTo';

// Validate MongoDB ObjectId before querying a ticket.
function validateTicketId(id) {
    if (!mongoose.isValidObjectId(id)) {
        throw new AppError(400, 'Invalid ticket ID');
    }
}

function escapeRegex(value) {
    return String(value)
        .slice(0, 100)
        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function priorityRank(priority) {
    return (
        {
            Critical: 0,
            High: 1,
            Medium: 2,
            Low: 3,
        }[priority] ?? 4
    );
}

// Create a ticket as an author.
export const createTicket = asyncHandler(async (req, res) => {
    const { bookId = null, subject, description } = req.validatedBody;

    const author = await Author.findById(req.user.id).select('name books');

    if (!author) {
        throw new AppError(404, 'Author not found');
    }

    const book = bookId
        ? author.books.find((item) => item.bookId === bookId)
        : null;

    if (bookId && !book) {
        throw new AppError(
            400,
            'Selected book does not belong to this account'
        );
    }

    const classification = await classifyTicket(
        `${subject}\n${description}`
    );

    const ticket = await Ticket.create({
        ticketNumber: `BL-${Date.now()
            .toString()
            .slice(-8)}-${randomBytes(2).toString('hex').toUpperCase()}`,
        author: author._id,
        authorName: author.name,
        bookId: book?.bookId || null,
        bookTitle: book?.title || 'General / Account Level',
        subject,
        description,
        category: classification.category,
        priority: classification.priority,
        ai: {
            classificationSource: classification.source,
            confidence: classification.confidence,
        },
    });

    res.status(201).json({
        success: true,
        data: { ticket },
    });
});

// Return only the authenticated author's tickets.
export const myTickets = asyncHandler(async (req, res) => {
    const tickets = await Ticket.find({ author: req.user.id })
        .select('-internalNotes -ai')
        .sort({ lastActivityAt: -1 })
        .limit(100)
        .lean();

    res.json({
        success: true,
        data: { tickets },
    });
});

// Return the admin ticket queue with filtering and pagination.
export const adminTickets = asyncHandler(async (req, res) => {
    const {
        status,
        category,
        priority,
        from,
        to,
        search,
        page = '1',
        limit = '20',
    } = req.query;

    const filter = {};

    if (status) filter.status = status;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;

    if (from || to) {
        filter.createdAt = {
            ...(from ? { $gte: new Date(from) } : {}),
            ...(to
                ? { $lte: new Date(`${to}T23:59:59.999Z`) }
                : {}),
        };
    }

    if (search) {
        const safeSearch = escapeRegex(search);

        filter.$or = [
            { subject: { $regex: safeSearch, $options: 'i' } },
            { description: { $regex: safeSearch, $options: 'i' } },
            { ticketNumber: { $regex: safeSearch, $options: 'i' } },
            { authorName: { $regex: safeSearch, $options: 'i' } },
        ];
    }

    const currentPage = Math.max(1, Number(page) || 1);
    const pageLimit = Math.min(100, Math.max(1, Number(limit) || 20));

    const [tickets, total] = await Promise.all([
        Ticket.aggregate([
            { $match: filter },
            {
                $addFields: {
                    priorityOrder: {
                        $switch: {
                            branches: [
                                {
                                    case: { $eq: ['$priority', 'Critical'] },
                                    then: 0,
                                },
                                {
                                    case: { $eq: ['$priority', 'High'] },
                                    then: 1,
                                },
                                {
                                    case: { $eq: ['$priority', 'Medium'] },
                                    then: 2,
                                },
                                {
                                    case: { $eq: ['$priority', 'Low'] },
                                    then: 3,
                                },
                            ],
                            default: 4,
                        },
                    },
                },
            },
            { $sort: { priorityOrder: 1, createdAt: 1 } },
            { $skip: (currentPage - 1) * pageLimit },
            { $limit: pageLimit },
            { $project: { priorityOrder: 0 } },
        ]),
        Ticket.countDocuments(filter),
    ]);

    res.json({
        success: true,
        data: {
            tickets,
            pagination: {
                page: currentPage,
                limit: pageLimit,
                total,
                pages: Math.ceil(total / pageLimit),
            },
        },
    });
});

// Get a ticket. Authors may access only their own tickets.
export const getTicket = asyncHandler(async (req, res) => {
    validateTicketId(req.params.id);

    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
        throw new AppError(404, 'Ticket not found');
    }

    if (
        req.user.role !== 'admin' &&
        String(ticket.author) !== req.user.id
    ) {
        throw new AppError(403, 'You cannot access this ticket');
    }

    // Never expose internal notes to authors.
    if (req.user.role !== 'admin') {
        ticket.internalNotes = [];
    }

    res.json({
        success: true,
        data: { ticket },
    });
});

// Add a public message to a ticket.
export const replyTicket = asyncHandler(async (req, res) => {
    validateTicketId(req.params.id);

    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
        throw new AppError(404, 'Ticket not found');
    }

    if (
        req.user.role !== 'admin' &&
        String(ticket.author) !== req.user.id
    ) {
        throw new AppError(403, 'You cannot access this ticket');
    }

    ticket.messages.push({
        senderRole: req.user.role,
        senderName: req.user.name,
        body: req.validatedBody.body,
    });

    ticket.lastActivityAt = new Date();

    if (req.user.role === 'admin' && ticket.status === 'Open') {
        ticket.status = 'In Progress';
    }

    await ticket.save();

    if (req.user.role !== 'admin') {
        ticket.internalNotes = [];
    }

    res.json({
        success: true,
        data: { ticket },
    });
});

// Update ticket fields. The route must remain admin-only.
export const updateTicket = asyncHandler(async (req, res) => {
    validateTicketId(req.params.id);

    const ticket = await Ticket.findByIdAndUpdate(
        req.params.id,
        {
            $set: {
                ...req.validatedBody,
                lastActivityAt: new Date(),
            },
        },
        {
            new: true,
            runValidators: true,
        }
    );

    if (!ticket) {
        throw new AppError(404, 'Ticket not found');
    }

    res.json({
        success: true,
        data: { ticket },
    });
});

// Add an admin-only internal note.
export const addNote = asyncHandler(async (req, res) => {
    validateTicketId(req.params.id);

    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
        throw new AppError(404, 'Ticket not found');
    }

    ticket.internalNotes.push({
        adminId: req.user._id,
        adminName: req.user.name,
        body: req.validatedBody.body,
    });

    ticket.lastActivityAt = new Date();

    await ticket.save();

    res.status(201).json({
        success: true,
        data: { notes: ticket.internalNotes },
    });
});

// Assign a ticket to the authenticated admin.
export const assignToMe = asyncHandler(async (req, res) => {
    validateTicketId(req.params.id);

    const ticket = await Ticket.findByIdAndUpdate(
        req.params.id,
        {
            $set: {
                assignedTo: req.user._id,
                assignedName: req.user.name,
                lastActivityAt: new Date(),
            },
        },
        { new: true }
    );

    if (!ticket) {
        throw new AppError(404, 'Ticket not found');
    }

    res.json({
        success: true,
        data: { ticket },
    });
});

// Generate an AI-assisted response draft. This does not send the reply.
export const generateDraft = asyncHandler(async (req, res) => {
    validateTicketId(req.params.id);

    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
        throw new AppError(404, 'Ticket not found');
    }

    const result = await draftResponse(ticket);

    ticket.ai = {
        ...(ticket.ai || {}),
        draftSource: result.source,
    };

    await ticket.save();

    res.json({
        success: true,
        data: result,
    });
});

// Return admin dashboard statistics.
export const adminStats = asyncHandler(async (_req, res) => {
    const [
        total,
        open,
        inProgress,
        resolved,
        critical,
        byCategory,
    ] = await Promise.all([
        Ticket.countDocuments(),
        Ticket.countDocuments({ status: 'Open' }),
        Ticket.countDocuments({ status: 'In Progress' }),
        Ticket.countDocuments({
            status: { $in: ['Resolved', 'Closed'] },
        }),
        Ticket.countDocuments({
            priority: 'Critical',
            status: { $nin: ['Resolved', 'Closed'] },
        }),
        Ticket.aggregate([
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 },
                },
            },
            { $sort: { count: -1 } },
        ]),
    ]);

    res.json({
        success: true,
        data: {
            total,
            open,
            inProgress,
            resolved,
            critical,
            byCategory,
        },
    });
});
