import { CommandInt } from "../interfaces/CommandInt";
import { errorHandler } from "../utils/errorHandler";
import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import EventModel from "../database/models/EventModel";

export const events: CommandInt = {
    data: new SlashCommandBuilder()
        .setName("events")
        .setDescription("Lists the server's ongoing events."),
    run: async (interaction, client, successColor, errorColor) => {
        try {
            if (!interaction.guild) {
                interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription("Events are a guild-only command!")
                            .setColor(errorColor),
                    ],
                    ephemeral: true,
                });
                return;
            }

            const targetEventData = await EventModel.find({
                guildId: interaction.guild?.id,
            });

            if (targetEventData.length === 0) {
                interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(
                                "This server has no ongoing events."
                            )
                            .setColor(errorColor),
                    ],
                    ephemeral: true,
                });
                return;
            }

            interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("📝 Event List")
                        .setDescription(
                            targetEventData
                                .map(
                                    (e) =>
                                        `**[${e.title}](${
                                            e.messageLink
                                        })** \`(${e.messageId})\`${
                                            e.description !== null
                                                ? "\n" + e.description
                                                : ""
                                        }\n> Creator: <@${
                                            e.creatorId
                                        }>\n> Set <t:${Math.floor(
                                            e.startTime / 1000 -
                                                e.duration / 1000
                                        )}:R>, starts <t:${Math.floor(
                                            e.startTime / 1000
                                        )}:R>, ends <t:${Math.floor(
                                            e.endTime / 1000
                                        )}:R>\n> [Google calendar link](${
                                            e.googleCalendarLink
                                        })`
                                )
                                .join("\n\n")
                        )
                        .setColor(successColor),
                ],
            });

            return;
        } catch (err) {
            errorHandler("events command", err, client);
        }
    },
};
