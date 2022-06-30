import { connect } from "mongoose";
import { errorHandler } from "../utils/errorHandler";
import { logHandler } from "../utils/logHandler";
import { Client } from "discord.js";

export const connectDatabase = async (client: Client): Promise<void> => {
    try {
        await connect(process.env.MONGO_URI as string);

        logHandler.log("info", "Connected to MongoDB.");
    } catch (err) {
        errorHandler("database connection", err, client);
    }
};
