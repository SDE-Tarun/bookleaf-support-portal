import jwt from 'jsonwebtoken';
import Author from '../models/Author.js';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
export const login=asyncHandler(async(req,res)=>{const {email,password}=req.validatedBody;const user=await Author.findOne({email:email.toLowerCase()});if(!user||!(await user.comparePassword(password)))throw new AppError(401,'Email or password is incorrect');const token=jwt.sign({sub:user.id,role:user.role},env.jwtSecret,{expiresIn:env.jwtExpiresIn});res.json({success:true,data:{token,user:{id:user.id,name:user.name,email:user.email,role:user.role,city:user.city}}});});
export const me=asyncHandler(async(req,res)=>res.json({success:true,data:{user:{id:req.user.id,name:req.user.name,email:req.user.email,role:req.user.role,city:req.user.city}}}));
