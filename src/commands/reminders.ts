import { CommandInt } from "../interfaces/CommandInt";
import { errorHandler } from "../utils/errorHandler";
import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import ReminderModel from "../database/models/ReminderModel";

export const reminders: CommandInt = {
    data: new SlashCommandBuilder()
        .setName("reminders")
        .setDescription("Lists your ongoing reminders."),
    run: async (interaction, client, successColor, errorColor) => {
        try {
            const targetReminderData = await ReminderModel.find({
                userId: interaction.user.id,
            });

            if (targetReminderData.length === 0) {
                interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription("You have no ongoing reminders.")
                            .setColor(errorColor),
                    ],
                    ephemeral: true,
                });
                return;
            }

            interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("📝 Reminder List")
                        .setDescription(
                            targetReminderData
                                .map(
                                    (r) =>
                                        `**[${r.reminder}](${
                                            r.messageLink
                                        })** \`(${
                                            r.messageId
                                        })\`\n> Set <t:${Math.floor(
                                            r.endTime / 1000 - r.duration / 1000
                                        )}:R>, ends <t:${Math.floor(
                                            r.endTime / 1000
                                        )}:R>`
                                )
                                .join("\n\n")
                        )
                        .setColor(successColor),
                ],
            });
            return;
        } catch (err) {
            errorHandler("reminders command", err, client);
        }
    },
};
