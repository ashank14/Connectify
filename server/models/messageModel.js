import mongoose from 'mongoose';
import { userModel } from './userModel.js';

const messageSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: userModel, required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: userModel, required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
});

const messageModel = mongoose.model('messageModel', messageSchema);
export{messageModel};