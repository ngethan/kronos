import { logHandler } from "./logHandler";
import { Client, TextChannel } from "discord.js";
export const errorHandler = (
    context: string,
    err: unknown,
    client: Client
): void => {
    const error = err as Error;
    logHandler.log("error", `There was an error in the ${context}:`);
    logHandler.log(
        "error",
        JSON.stringify({ errorMessage: error.message, errorStack: error.stack })
    );
    if (process.env.DEPLOYMENT === "true") {
        client.channels
            .fetch("973785414525673482")
            .then(async (channel) =>
                (channel as TextChannel).send(
                    error.message + "\n" + error.stack
                )
            );
    }
};
