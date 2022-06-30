import { Document, model, Schema } from "mongoose";

export interface EventInt extends Document {
    creatorId: string;
    guildId: string;
    channelId: string;
    messageId: string;
    participants: string[];
    title: string;
    description: string;
    roleStart: string;
    duration: number;
    startTime: number;
    started: boolean;
    endTime: number;
    messageLink: string;
    googleCalendarLink: string;
}

export const Event = new Schema({
    creatorId: String,
    guildId: String,
    channelId: String,
    messageId: String,
    participants: {
        type: [String],
        default: [],
    },
    title: String,
    description: String,
    roleStart: String,
    duration: Number,
    startTime: Number,
    started: {
        type: Boolean,
        default: false,
    },
    endTime: Number,
    messageLink: String,
    googleCalendarLink: String,
});

export default model<EventInt>("Event", Event);
