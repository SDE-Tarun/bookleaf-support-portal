import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const bookSchema = new mongoose.Schema({
  bookId: { type: String, required: true }, title: { type: String, required: true }, isbn: String,
  genre: String, publicationDate: { type: Date, default: null }, status: { type: String, required: true },
  mrp: { type: Number, default: null }, authorRoyaltyPerCopy: { type: Number, default: null },
  totalCopiesSold: { type: Number, default: 0 }, totalRoyaltyEarned: { type: Number, default: 0 },
  royaltyPaid: { type: Number, default: 0 }, royaltyPending: { type: Number, default: 0 },
  lastRoyaltyPayoutDate: { type: Date, default: null }, printPartner: { type: String, default: null },
  availableOn: { type: [String], default: [] }
}, { _id: false });

const authorSchema = new mongoose.Schema({
  authorId: { type: String, unique: true, sparse: true }, name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true }, phone: String,
  city: String, joinedDate: Date, books: { type: [bookSchema], default: [] },
  passwordHash: { type: String, required: true }, role: { type: String, enum: ['author','admin'], default: 'author' }
}, { timestamps: true, toJSON: { transform(_doc, ret) { delete ret.passwordHash; delete ret.__v; return ret; } } });

authorSchema.methods.comparePassword = function(password) { return bcrypt.compare(password, this.passwordHash); };
export default mongoose.model('Author', authorSchema);
