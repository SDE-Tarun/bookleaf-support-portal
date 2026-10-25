import { ZodError } from 'zod';
import { AppError } from '../utils/AppError.js';
export function notFound(req,_res,next) { next(new AppError(404,`Route not found: ${req.method} ${req.originalUrl}`)); }
export function errorHandler(err,_req,res,_next) {
  if (err?.type === 'entity.parse.failed') return res.status(400).json({success:false,error:{message:'Request body contains invalid JSON'}});
  if (err?.type === 'entity.too.large') return res.status(413).json({success:false,error:{message:'Request body is too large'}});
  if (err instanceof ZodError) return res.status(400).json({success:false,error:{message:'Please check the submitted fields',details:err.issues.map(i=>({field:i.path.join('.'),message:i.message}))}});
  if (err?.code===11000) return res.status(409).json({success:false,error:{message:'A record with this value already exists'}});
  const status=err.statusCode || (err.name==='CastError'?400:500);
  if(status>=500) console.error(err);
  res.status(status).json({success:false,error:{message:status>=500?'Something went wrong. Please try again shortly.':err.message,...(err.details?{details:err.details}:{})}});
}
