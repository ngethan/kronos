import { Document, model, Schema } from "mongoose";

export interface GuildInt extends Document {
    id: string;
    embedColor: string;
    premium: boolean;
    eventCount: number;
}

export const Guild = new Schema({
    id: String,
    embedColor: String,
    premium: Boolean,
    eventCount: Number,
});

export default model<GuildInt>("Guild", Guild);
