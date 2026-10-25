import { z } from 'zod';
export const loginSchema=z.object({email:z.string().email().max(254),password:z.string().min(8).max(128)});
export const createTicketSchema=z.object({bookId:z.string().max(30).nullable().optional(),subject:z.string().trim().min(4).max(160),description:z.string().trim().min(10).max(10000)});
export const replySchema=z.object({body:z.string().trim().min(1).max(10000)});
export const updateTicketSchema=z.object({status:z.enum(['Open','In Progress','Resolved','Closed']).optional(),category:z.enum(['Royalty & Payments','ISBN & Metadata Issues','Printing & Quality','Distribution & Availability','Book Status & Production Updates','General Inquiry']).optional(),priority:z.enum(['Critical','High','Medium','Low']).optional()}).refine(v=>Object.keys(v).length>0,{message:'At least one field is required'});
export const noteSchema=z.object({body:z.string().trim().min(1).max(5000)});
