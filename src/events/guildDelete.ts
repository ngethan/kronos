import { errorHandler } from "../utils/errorHandler";
import { Client, Guild, TextChannel } from "discord.js";

export const guildDelete = async (g: Guild, client: Client): Promise<void> => {
    try {
        if (g.available) {
            client.channels
                .fetch("974523400930336808")
                .then(async (channel) => {
                    (channel as TextChannel).send(
                        `Left **${g.name}** \`(${g.id})\`.`
                    );
                });
        }
    } catch (err) {
        errorHandler("guildDelete event", err, client);
    }
};
