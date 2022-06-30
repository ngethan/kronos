import { CommandInt } from "../interfaces/CommandInt";
import { errorHandler } from "../utils/errorHandler";
import {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    TextChannel,
    ButtonStyle,
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    Channel,
} from "discord.js";
import EventModel from "../database/models/EventModel";
import { createCalendarLink } from "../modules/createCalendarLink";
import UserModel from "../database/models/UserModel";
import { parseDuration, parseEventDate } from "../utils/dateHelpers";
import { IANAZone } from "luxon";

export const event: CommandInt = {
    data: new SlashCommandBuilder()
        .setName("event")
        .setDescription("Creates an event.")
        .addStringOption((o) =>
            o
                .setName("title")
                .setDescription("Title of the event.")
                .setRequired(true)
        )
        .addStringOption((o) =>
            o
                .setName("description")
                .setDescription("Description of the event.")
                .setRequired(true)
        )
        .addStringOption((o) =>
            o
                .setName("start_time")
                .setDescription(
                    "The date/time for the event. Examples include: 1 min, 2h, 8/12/22 8:00:00 PM."
                )
                .setRequired(true)
        )
        .addStringOption((o) =>
            o
                .setName("duration")
                .setDescription(
                    "How long the event will last. Examples include: 1 min, 2h."
                )
                .setRequired(true)
        )
        .addChannelOption((o) =>
            o
                .setName("channel")
                .setDescription(
                    "Channel to send the event to (defaults to the channel the command is sent to)."
                )
                .setRequired(false)
        )
        .addStringOption((o) =>
            o
                .setName("timezone")
                .setDescription(
                    "The timezone for this event. If you input a timezone it will override the timezone in your settings."
                )
                .setRequired(false)
        )
        .addRoleOption((o) =>
            o
                .setName("create_role")
                .setDescription("Role to mention when the event is created.")
                .setRequired(false)
        )
        .addRoleOption((o) =>
            o
                .setName("start_role")
                .setDescription("Role to mention when the event starts.")
                .setRequired(false)
        ) as SlashCommandBuilder,
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
            const startTime = (
                interaction as ChatInputCommandInteraction
            ).options.getString("start_time") as string;
            const duration = (
                interaction as ChatInputCommandInteraction
            ).options.getString("duration") as string;

            if (parseEventDate(startTime, duration, false, timezone) === -1) {
                interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(
                                "Invalid time argument. Problems may be the date may have already passed or your timezone is incorrect.\nExamples: 2 days, 1d, 3 mins, 12/24/2022 5 PM."
                            )
                            .setColor(errorColor)
                            .setFooter({
                                text: "Tip: make sure you set your timezone with /settings!",
                            }),
                    ],
                    ephemeral: true,
                });
                return;
            }

            if (
                (
                    interaction as ChatInputCommandInteraction
                ).options?.getChannel("channel") &&
                !(
                    (
                        interaction as ChatInputCommandInteraction
                    ).options?.getChannel("channel") as Channel
                ).isText()
            ) {
                interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(
                                "Channel argument must be a text channel."
                            )
                            .setColor(errorColor),
                    ],
                    ephemeral: true,
                });
                return;
            }

            const channel =
                ((
                    interaction as ChatInputCommandInteraction
                ).options.getChannel("channel") as TextChannel) ||
                interaction.channel;

            const embed = new EmbedBuilder()
                .setTitle(
                    `📅 ${
                        (
                            interaction as ChatInputCommandInteraction
                        ).options.getString("title") as string
                    }`
                )
                .setDescription(
                    (
                        interaction as ChatInputCommandInteraction
                    ).options.getString("description")
                )
                .addFields([
                    {
                        name: "Start Time",
                        value: `<t:${parseEventDate(
                            startTime,
                            "0",
                            true,
                            timezone
                        )}:F>`,
                        inline: true,
                    },
                    {
                        name: "End Time",
                        value: `<t:${parseEventDate(
                            startTime,
                            duration,
                            true,
                            timezone
                        )}:F>`,
                        inline: true,
                    },
                    {
                        name: "Participants (0)",
                        value: "> -",
                    },
                ])
                .setColor(successColor)
                .setFooter({ text: "📝 Sign up" })
                .setTimestamp();
            const component =
                new ActionRowBuilder<ButtonBuilder>().addComponents([
                    new ButtonBuilder()
                        .setCustomId("sign_up")
                        .setEmoji("📝")
                        .setStyle(ButtonStyle.Secondary),
                ]);
            let toSend;
            if (
                (interaction as ChatInputCommandInteraction).options.getRole(
                    "create_role"
                )
            ) {
                toSend = {
                    content: (
                        interaction as ChatInputCommandInteraction
                    ).options
                        .getRole("create_role")
                        ?.toString(),
                    embeds: [embed],
                    components: [component],
                };
            } else {
                toSend = { embeds: [embed], components: [component] };
            }
            await channel
                .send(toSend)
                .then(async (msg) => {
                    interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setDescription("Successfully created event!")
                                .setColor(successColor),
                        ],
                        ephemeral: true,
                    });
                    if (msg.content) {
                        await msg.edit({
                            content: msg.content,
                            embeds: [
                                embed.setDescription(
                                    (
                                        interaction as ChatInputCommandInteraction
                                    ).options.getString("description") +
                                        `\n> ID: \`${
                                            msg.id
                                        }\`\n> [Google calendar link](${createCalendarLink(
                                            (
                                                interaction as ChatInputCommandInteraction
                                            ).options.getString(
                                                "title"
                                            ) as string,
                                            (
                                                interaction as ChatInputCommandInteraction
                                            ).options.getString(
                                                "description"
                                            ) as string,
                                            parseEventDate(
                                                startTime,
                                                "0",
                                                false,
                                                timezone
                                            ),
                                            parseEventDate(
                                                startTime,
                                                duration,
                                                false,
                                                timezone
                                            )
                                        )})`
                                ),
                            ],
                            components: [component],
                        });
                    } else {
                        await msg.edit({
                            embeds: [
                                embed.setDescription(
                                    (
                                        interaction as ChatInputCommandInteraction
                                    ).options.getString("description") +
                                        `\n> ID: \`${
                                            msg.id
                                        }\`\n> [Google calendar link](${createCalendarLink(
                                            (
                                                interaction as ChatInputCommandInteraction
                                            ).options.getString(
                                                "title"
                                            ) as string,
                                            (
                                                interaction as ChatInputCommandInteraction
                                            ).options.getString(
                                                "description"
                                            ) as string,
                                            parseEventDate(
                                                startTime,
                                                "0",
                                                false,
                                                timezone
                                            ),
                                            parseEventDate(
                                                startTime,
                                                duration,
                                                false,
                                                timezone
                                            )
                                        )})`
                                ),
                            ],
                            components: [component],
                        });
                    }

                    const newEventData = await EventModel.create({
                        creatorId: interaction.user.id,
                        guildId: interaction.guild?.id,
                        channelId: channel.id,
                        messageId: msg.id,
                        participants: [],
                        title: (
                            interaction as ChatInputCommandInteraction
                        ).options.getString("title"),
                        description: (
                            interaction as ChatInputCommandInteraction
                        ).options.getString("description"),
                        roleStart:
                            (
                                interaction as ChatInputCommandInteraction
                            ).options.getRole("start_role")?.id || null,
                        duration: parseDuration(duration, timezone),
                        startTime: parseEventDate(
                            startTime,
                            "0",
                            false,
                            timezone
                        ),
                        endTime: parseEventDate(
                            startTime,
                            duration,
                            false,
                            timezone
                        ),
                        messageLink: `https://discord.com/channels/${interaction.guild?.id}/${interaction.channel?.id}/${msg.id}`,
                        googleCalendarLink: createCalendarLink(
                            (
                                interaction as ChatInputCommandInteraction
                            ).options.getString("title") as string,
                            (
                                interaction as ChatInputCommandInteraction
                            ).options.getString("description") as string,
                            parseEventDate(startTime, "0", false, timezone),
                            parseEventDate(startTime, duration, false, timezone)
                        ),
                    });
                    await newEventData.save();
                })
                .catch((err: unknown) => {
                    errorHandler("event command", err, client);
                });

            return;
        } catch (err) {
            errorHandler("event command", err, client);
        }
    },
};
