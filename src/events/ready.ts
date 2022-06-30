import { errorHandler } from "../utils/errorHandler";
import { logHandler } from "../utils/logHandler";
import { REST } from "@discordjs/rest";
import { APIApplicationCommandOption, Routes } from "discord-api-types/v10";
import { CommandList } from "../commands/_CommandList";
import { Client, ActivityType, TextChannel } from "discord.js";

export const ready = async (client: Client): Promise<void> => {
    try {
        const rest = new REST({ version: "10" }).setToken(
            process.env.TOKEN as string
        );

        const commandData: {
            name: string;
            description?: string;
            type?: number;
            options?: APIApplicationCommandOption[];
        }[] = [];

        CommandList.forEach((command) =>
            commandData.push(
                command.data.toJSON() as {
                    name: string;
                    description?: string;
                    type?: number;
                    options?: APIApplicationCommandOption[];
                }
            )
        );

        if (process.env.DEPLOYMENT === "true") {
            await rest.put(
                Routes.applicationCommands(client.user?.id || "missing token"),
                {
                    body: commandData,
                }
            );
            client.channels
                .fetch("973949792629710851")
                .then(async (channel) =>
                    (channel as TextChannel).send(
                        `Connected as ${client.user?.tag}!`
                    )
                );
        } else {
            await rest.put(
                Routes.applicationGuildCommands(
                    client.user?.id || "missing token",
                    process.env.GUILD_ID as string
                ),
                { body: commandData }
            );
        }

        client.user?.setPresence({
            activities: [
                {
                    name: "the time 🕒",
                    type: ActivityType.Watching,
                },
            ],
            status: "online",
        });
        logHandler.log("info", `Connected as ${client.user?.tag}!`);
    } catch (err) {
        errorHandler("ready event", err, client);
    }
};
