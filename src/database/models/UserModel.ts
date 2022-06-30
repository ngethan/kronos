import { Document, model, Schema } from "mongoose";

export interface DiscordUserInt extends Document {
    id: string;
    timezone: string;
    reminderCount: number;
}

export const DiscordUser = new Schema({
    id: String,
    timezone: String,
    reminderCount: Number,
});

export default model<DiscordUserInt>("Discord User", DiscordUser);
