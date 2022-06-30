import { CommandInt } from "../interfaces/CommandInt";
import { errorHandler } from "../utils/errorHandler";
import {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ColorResolvable,
    Message,
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    ComponentType,
    ButtonStyle,
} from "discord.js";
import ReminderModel from "../database/models/ReminderModel";
import { parseDuration, parseReminderDate } from "../utils/dateHelpers";
import UserModel from "../database/models/UserModel";
import { IANAZone } from "luxon";

export const remind: CommandInt = {
    data: new SlashCommandBuilder()
        .setName("remind")
        .setDescription("Sets a reminder.")
        .addStringOption((o) =>
            o
                .setName("reminder")
                .setDescription("What you'd like to be reminded of.")
                .setRequired(true)
        )
        .addStringOption((o) =>
            o
                .setName("datetime")
                .setDescription(
                    "The date/time for the reminder. Examples include: 1 min, 2h, 8/12/22 8:00:00 PM."
                )
                .setRequired(true)
        )
        .addStringOption((o) =>
            o
                .setName("timezone")
                .setDescription(
                    "The timezone for this event. If you input a timezone it will override the timezone in your settings."
                )
                .setRequired(false)
        ) as SlashCommandBuilder,
    run: async (interaction, client, successColor, errorColor) => {
        try {
            const targetUserData = await UserModel.findOne({
                id: interaction.user.id,
            });
            const timezoneInput = (
                interaction as ChatInputCommandInteraction
            ).options.getString("timezone") as string;

            const timezone = new IANAZone(timezoneInput).isValid
                ? timezoneInput
                : (targetUserData?.timezone as string);

            if (!new IANAZone(timezone).isValid) {
                interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(
                                "Invalid timezone. Find your timezone [here](https://kevinnovak.github.io/Time-Zone-Picker/). Ex: America/New_York"
                            )
                            .setColor(errorColor),
                    ],
                    ephemeral: true,
                });
                return;
            }

            const dateTime = (
                interaction as ChatInputCommandInteraction
            ).options.getString("datetime") as string;

            if (parseReminderDate(dateTime, false, timezone) === -1) {
                interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(
                                "Invalid time argument. Problems may be the date may have already passed or your timezone is incorrect.\nExamples: 2 days, 1d, 10h, 1m, 5 seconds"
                            )
                            .setColor(errorColor),
                    ],
                    ephemeral: true,
                });
                return;
            }

            const prevMsg = await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("🕒 Reminder")
                        .setDescription("Loading...")
                        .setColor(successColor)
                        .setFooter({ text: "Press ❌ to cancel" })
                        .setTimestamp(),
                ],
                components: [
                    new ActionRowBuilder<ButtonBuilder>().addComponents([
                        new ButtonBuilder()
                            .setCustomId("cancel_reminder")
                            .setEmoji("❌")
                            .setStyle(ButtonStyle.Secondary),
                    ]),
                ],
                fetchReply: true,
            });

            const msg = (await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("🕒 Reminder")
                        .setDescription(
                            `${
                                (
                                    interaction as ChatInputCommandInteraction
                                ).options.getString("reminder") as string
                            }\n> ID: \`${
                                prevMsg.id
                            }\`\n> Ends <t:${parseReminderDate(
                                dateTime,
                                true,
                                timezone
                            )}:R>`
                        )
                        .setColor(successColor)
                        .setFooter({ text: "Press ❌ to cancel" })
                        .setTimestamp(),
                ],
                components: [
                    new ActionRowBuilder<ButtonBuilder>().addComponents([
                        new ButtonBuilder()
                            .setCustomId("cancel_reminder")
                            .setEmoji("❌")
                            .setStyle(ButtonStyle.Secondary),
                    ]),
                ],
            })) as Message;

            const newReminderData = await ReminderModel.create({
                userId: interaction.user.id,
                messageId: msg.id,
                reminder: (
                    interaction as ChatInputCommandInteraction
                ).options.getString("reminder"),
                duration: parseDuration(dateTime, timezone),
                endTime: parseReminderDate(dateTime, false, timezone),
                messageLink: interaction.guild
                    ? `https://discord.com/channels/${interaction.guild?.id}/${interaction.channel?.id}/${msg.id}`
                    : `https://discord.com/channels/@me/973378093874024498/${msg.id}`,
            });
            await newReminderData.save();

            const collector = msg.createMessageComponentCollector({
                componentType: ComponentType.Button,
                max: 1,
                time: newReminderData.duration,
            });

            collector.on("collect", async (i) => {
                if (i.user.id === interaction.user.id) {
                    await newReminderData.remove().then(() => {
                        interaction.editReply({
                            embeds: [
                                new EmbedBuilder()
                                    .setDescription(
                                        "Successfully deleted reminder!"
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

            collector.on("end", async () => {
                const embed = new EmbedBuilder()
                    .setTitle(msg.embeds[0].title as string)
                    .setDescription(
                        (msg.embeds[0]?.description as string).replace(
                            "Ends",
                            "Ended"
                        )
                    )
                    .setColor(msg.embeds[0].color as ColorResolvable)
                    .setFooter({ text: msg.embeds[0].footer?.text as string })
                    .setTimestamp(
                        parseInt(msg.embeds[0].timestamp as string) as number
                    );
                interaction.editReply({
                    embeds: [embed],
                    components: [
                        new ActionRowBuilder<ButtonBuilder>().addComponents([
                            new ButtonBuilder()
                                .setCustomId("cancel_reminder")
                                .setEmoji("❌")
                                .setStyle(ButtonStyle.Secondary)
                                .setDisabled(true),
                        ]),
                    ],
                });
            });
            return;
        } catch (err) {
            errorHandler("remind command", err, client);
        }
    },
};
