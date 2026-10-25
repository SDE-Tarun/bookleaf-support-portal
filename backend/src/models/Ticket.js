import mongoose from 'mongoose';
const messageSchema = new mongoose.Schema({ senderRole: {type:String, enum:['author','admin'], required:true}, senderName:String, body:{type:String,required:true,maxlength:10000}, createdAt:{type:Date,default:Date.now} }, {_id:true});
const noteSchema = new mongoose.Schema({ adminId:{type:mongoose.Schema.Types.ObjectId,ref:'Author'}, adminName:String, body:{type:String,required:true,maxlength:5000}, createdAt:{type:Date,default:Date.now} }, {_id:true});
const ticketSchema = new mongoose.Schema({
  ticketNumber:{type:String,unique:true,index:true}, author:{type:mongoose.Schema.Types.ObjectId,ref:'Author',required:true,index:true}, authorName:String,
  bookId:{type:String,default:null}, bookTitle:{type:String,default:'General / Account Level'}, subject:{type:String,required:true,trim:true,maxlength:160}, description:{type:String,required:true,trim:true,maxlength:10000},
  category:{type:String,enum:['Royalty & Payments','ISBN & Metadata Issues','Printing & Quality','Distribution & Availability','Book Status & Production Updates','General Inquiry'],default:'General Inquiry'},
  priority:{type:String,enum:['Critical','High','Medium','Low'],default:'Medium'}, status:{type:String,enum:['Open','In Progress','Resolved','Closed'],default:'Open',index:true},
  assignedTo:{type:mongoose.Schema.Types.ObjectId,ref:'Author',default:null}, assignedName:{type:String,default:null}, messages:{type:[messageSchema],default:[]}, internalNotes:{type:[noteSchema],default:[]}, ai:{type:Object,default:{classificationSource:'rules',draftSource:'unavailable'}}, lastActivityAt:{type:Date,default:Date.now,index:true}
}, {timestamps:true});
ticketSchema.index({status:1,priority:1,createdAt:1});
ticketSchema.index({subject:'text',description:'text',ticketNumber:'text'});
export default mongoose.model('Ticket',ticketSchema);
