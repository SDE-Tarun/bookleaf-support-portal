import { asyncHandler } from '../utils/asyncHandler.js';
import Author from '../models/Author.js';
export const myBooks=asyncHandler(async(req,res)=>{const author=await Author.findById(req.user.id).select('books');res.json({success:true,data:{books:author.books}})});
