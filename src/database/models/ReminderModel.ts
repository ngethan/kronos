import { Document, model, Schema } from "mongoose";

export interface ReminderInt extends Document {
    userId: string;
    messageId: string;
    reminder: string;
    duration: number;
    endTime: number;
    messageLink: string;
}

export const Reminder = new Schema({
    userId: String,
    messageId: String,
    reminder: String,
    duration: Number,
    endTime: Number,
    messageLink: String,
});

export default model<ReminderInt>("Reminder", Reminder);
