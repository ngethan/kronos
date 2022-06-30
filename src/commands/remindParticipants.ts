import { CommandInt } from "../interfaces/CommandInt";
import { errorHandler } from "../utils/errorHandler";
import {
    EmbedBuilder,
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    ColorResolvable,
} from "discord.js";
import EventModel from "../database/models/EventModel";

export const remindParticipants: CommandInt = {
    data: new SlashCommandBuilder()
        .setName("remindparticipants")
        .setDescription("Sends a reminder to all event participants.")
        .addStringOption((o) =>
            o.setName("id").setDescription("ID of the event.").setRequired(true)
        ) as SlashCommandBuilder,
    run: async (interaction, client, successColor, errorColor) => {
        try {
            const targetEventData = await EventModel.find({
                creatorId: interaction.user.id,
                messageId: (
                    interaction as ChatInputCommandInteraction
                ).options.getString("id"),
            });

            if (targetEventData[0]) {
                if (targetEventData[0].started) {
                    interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setDescription(`This event already started.`)
                                .setColor(errorColor),
                        ],
                        ephemeral: true,
                    });
                }
                if (targetEventData[0].participants.length === 0) {
                    interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setDescription(
                                    `No one has signed up for this event.`
                                )
                                .setColor(errorColor),
                        ],
                        ephemeral: true,
                    });
                }
                for (const userId of targetEventData[0].participants) {
                    client.users.fetch(userId).then((u) => {
                        u.send({
                            embeds: [
                                new EmbedBuilder()
                                    .setTitle(`📅 ${targetEventData[0].title}`)
                                    .setDescription(
                                        `Hey! Just reminding you that [this event](${
                                            targetEventData[0].messageLink
                                        }) will start <t:${Math.floor(
                                            targetEventData[0].endTime / 1000
                                        )}:R>!`
                                    )
                                    .setColor(
                                        process.env
                                            .SUCCESS_COLOR as ColorResolvable
                                    ),
                            ],
                        }).catch((err: unknown) => {
                            errorHandler(
                                "remindParticipants command",
                                err,
                                client
                            );
                        });
                    });
                }
                interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(
                                "Successfully reminded participants."
                            )
                            .setColor(successColor),
                    ],
                    ephemeral: true,
                });
            } else {
                interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(
                                `Couldn't find ongoing event with id \`${(
                                    interaction as ChatInputCommandInteraction
                                ).options.getString("id")}\`.`
                            )
                            .setColor(errorColor),
                    ],
                    ephemeral: true,
                });
            }
            return;
        } catch (err) {
            errorHandler("remindParticipants command", err, client);
        }
    },
};
