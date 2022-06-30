import { CommandInt } from "../interfaces/CommandInt";
import { errorHandler } from "../utils/errorHandler";
import {
    EmbedBuilder,
    ColorResolvable,
    Message,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    SlashCommandBuilder,
    ComponentType,
    ChatInputCommandInteraction,
} from "discord.js";
import ReminderModel from "../database/models/ReminderModel";
import EventModel from "../database/models/EventModel";

export const del: CommandInt = {
    data: new SlashCommandBuilder()
        .setName("delete")
        .setDescription("Deletes a reminder or event.")
        .addStringOption((o) =>
            o
                .setName("id")
                .setDescription("The reminder or event id.")
                .setRequired(true)
        ) as SlashCommandBuilder,
    run: async (interaction, client, successColor, errorColor) => {
        try {
            const targetReminderData = await ReminderModel.find({
                userId: interaction.user.id,
                messageId: (
                    interaction as ChatInputCommandInteraction
                ).options.getString("id"),
            });

            const targetEventData = await EventModel.find({
                creatorId: interaction.user.id,
                messageId: (
                    interaction as ChatInputCommandInteraction
                ).options.getString("id"),
            });

            if (
                targetReminderData.length === 0 &&
                targetEventData.length === 0
            ) {
                interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(
                                `Couldn't find ongoing reminder or event with id \`${(
                                    interaction as ChatInputCommandInteraction
                                ).options.getString("id")}\`.`
                            )
                            .setColor(errorColor),
                    ],
                    ephemeral: true,
                });
                return;
            }

            const targetData =
                targetReminderData.length === 0
                    ? targetEventData[0]
                    : targetReminderData[0];

            const msg = (await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(
                            targetReminderData.length === 0
                                ? `Are you sure you want to delete [this event](${targetEventData[0].messageLink})?`
                                : `Are you sure you want to delete [this reminder](${targetReminderData[0].messageLink})?`
                        )
                        .setColor(successColor),
                ],
                components: [
                    new ActionRowBuilder<ButtonBuilder>().addComponents([
                        new ButtonBuilder()
                            .setCustomId("delete_reminder")
                            .setLabel("Confirm Deletion")
                            .setStyle(ButtonStyle.Danger),
                    ]),
                ],
                ephemeral: true,
                fetchReply: true,
            })) as Message;

            const collector = msg.createMessageComponentCollector({
                componentType: ComponentType.Button,
                max: 1,
                time: 30000,
            });

            collector.on("collect", async (i) => {
                if (i.user.id === interaction.user.id) {
                    await targetData.remove().then(() => {
                        interaction.editReply({
                            embeds: [
                                new EmbedBuilder()
                                    .setDescription(
                                        targetReminderData.length === 0
                                            ? `Successfully deleted event!`
                                            : `Successfully deleted reminder!`
                                    )
                                    .setColor(
                                        process.env
                                            .SUCCESS_COLOR as ColorResolvable
                                    ),
                            ],
                            components: [],
                        });
                    });
                } else {
                    i.reply({
                        content: `I'm not asking you!`,
                        ephemeral: true,
                    });
                }
            });
            return;
        } catch (err) {
            errorHandler("delete command", err, client);
        }
    },
};
