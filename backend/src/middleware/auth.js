import jwt from 'jsonwebtoken';
import Author from '../models/Author.js';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
export const authenticate = asyncHandler(async (req,_res,next) => {
  const token = req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7) : null;
  if (!token) throw new AppError(401,'Authentication required');
  let payload; try { payload=jwt.verify(token,env.jwtSecret); } catch { throw new AppError(401,'Session is invalid or expired. Please sign in again.'); }
  const user=await Author.findById(payload.sub).select('-passwordHash');
  if(!user) throw new AppError(401,'Account not found');
  req.user=user; next();
});
export const requireRole = (...roles) => (req,_res,next) => { if(!req.user || !roles.includes(req.user.role)) return next(new AppError(403,'You do not have permission to perform this action')); next(); };
