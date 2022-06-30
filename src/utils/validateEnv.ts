import { logHandler } from "./logHandler";

export const validateEnv = (): void => {
    if (!process.env.TOKEN) {
        logHandler.log("warn", "Missing Discord bot token.");
        process.exit(1);
    }

    if (!process.env.MONGO_URI) {
        logHandler.log("warn", "Missing MongoDB connection.");
        process.exit(1);
    }
};
