import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { CommandInt } from "../interfaces/CommandInt";
import { errorHandler } from "../utils/errorHandler";
import EventModel from "../database/models/EventModel";
import ReminderModel from "../database/models/ReminderModel";

export const calendar: CommandInt = {
    data: new SlashCommandBuilder()
        .setName("calendar")
        .setDescription("Displays information about Kronos."),
    run: async (interaction, client, successColor, errorColor) => {
        try {
            const events = [];
            const targetEventData = await EventModel.find({
                guildId: interaction.guild?.id,
            });
            const targetReminderData = await ReminderModel.find({
                id: interaction.user.id,
            });
            for (let i = 0; i < targetEventData.length; i++) {
                if (
                    targetEventData[i].participants.includes(
                        interaction?.user.id
                    )
                ) {
                    events.push(targetEventData[i]);
                }
            }

            const embed = new EmbedBuilder()
                .setTitle("📅 Calendar")
                .setDescription(
                    events
                        .map(
                            (i) =>
                                `**${i.title}** \`${i.id}\`\n> ${
                                    i.description
                                }\n> Creator: <@${
                                    i.creatorId
                                }>\n> Set <t:${Math.floor(
                                    i.endTime - i.duration
                                )}>\n> Starts <t:${Math.floor(
                                    i.startTime
                                )}>\n> Ends <t:${Math.floor(i.endTime)}>`
                        )
                        .join("\n")
                )
                .setColor(successColor);

            interaction.reply({ embeds: [embed] });

            return;
        } catch (err) {
            errorHandler("calendar command", err, client);
        }
    },
};
