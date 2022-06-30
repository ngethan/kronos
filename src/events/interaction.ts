import {
    Interaction,
    Client,
    EmbedBuilder,
    ColorResolvable,
    TextChannel,
    APIEmbedField,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ModalActionRowComponentBuilder,
    ActionRowBuilder,
} from "discord.js";
import { CommandList } from "../commands/_CommandList";
import { errorHandler } from "../utils/errorHandler";
import EventModel from "../database/models/EventModel";
import DiscordUserModel from "../database/models/UserModel";
import { IANAZone } from "luxon";
import GuildModel from "../database/models/GuildModel";

export const interaction = async (
    interaction: Interaction,
    client: Client
): Promise<void> => {
    try {
        const targetUserData = await DiscordUserModel.findOne({
            id: interaction.user.id,
        });
        if (!targetUserData) {
            await DiscordUserModel.create({
                id: interaction.user.id,
                timezone: "America/New_York",
                reminderCount: 0,
            });
        }

        if (interaction.isChatInputCommand()) {
            const guild = await GuildModel.findOne({
                id: interaction.guild?.id,
            });
            const successColor =
                (guild?.embedColor as ColorResolvable) ||
                (process.env.SUCCESS_COLOR as ColorResolvable);
            const errorColor = process.env.ERROR_COLOR as ColorResolvable;

            for (const Command of CommandList) {
                if (interaction.commandName === Command.data.name) {
                    await Command.run(
                        interaction,
                        client,
                        successColor,
                        errorColor
                    ).then(() => {
                        client.channels
                            .fetch("979504392346685450")
                            .then((c) => {
                                (c as TextChannel).send({
                                    embeds: [
                                        new EmbedBuilder()
                                            .addFields([
                                                {
                                                    name: "Command",
                                                    value: interaction.commandName,
                                                    inline: true,
                                                },
                                                {
                                                    name: "User",
                                                    value: interaction.user.tag,
                                                    inline: true,
                                                },
                                                {
                                                    name: "Guild",
                                                    value: interaction.guild
                                                        ?.name
                                                        ? interaction.guild.name
                                                        : "N/A",
                                                    inline: true,
                                                },
                                                {
                                                    name: "Channel",
                                                    value:
                                                        interaction.channel?.isText() &&
                                                        (
                                                            interaction.channel as TextChannel
                                                        ).name
                                                            ? interaction
                                                                  .channel.name
                                                            : "N/A",
                                                    inline: true,
                                                },
                                            ])
                                            .setColor(
                                                process.env
                                                    .SUCCESS_COLOR as ColorResolvable
                                            )
                                            .setThumbnail(
                                                interaction.user.displayAvatarURL()
                                            )
                                            .setFooter({
                                                text: `User ID: ${
                                                    interaction.user.id
                                                } • Guild ID: ${
                                                    interaction.guild?.id
                                                        ? interaction.guild.id
                                                        : "N/A"
                                                } • Channel ID: ${
                                                    interaction.channel?.isText() &&
                                                    (
                                                        interaction.channel as TextChannel
                                                    ).id
                                                        ? interaction.channel.id
                                                        : "N/A"
                                                }`,
                                            }),
                                    ],
                                });
                            });
                    });
                    break;
                }
            }
        }

        if (interaction.isSelectMenu()) {
            if (interaction.customId === "settings") {
                if (interaction.values[0] === "timezoneSetting") {
                    const modal = new ModalBuilder()
                        .setCustomId("timezoneSetting")
                        .setTitle("Timezone Setting");

                    const setting = new TextInputBuilder()
                        .setCustomId("timezoneInput")
                        .setLabel(`What's your timezone? Ex: America/New_York`)
                        .setStyle(TextInputStyle.Short);

                    const firstActionRow =
                        new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
                            [setting]
                        );

                    modal.addComponents([firstActionRow]);

                    await interaction.showModal(modal);
                } else if (interaction.values[0] === "embedColorSetting") {
                    if (!interaction.guild) {
                        interaction.reply({
                            embeds: [
                                new EmbedBuilder()
                                    .setDescription(
                                        "You can only set the embed color in a guild."
                                    )
                                    .setColor(
                                        process.env
                                            .ERROR_COLOR as ColorResolvable
                                    ),
                            ],
                        });
                        return;
                    }

                    const modal = new ModalBuilder()
                        .setCustomId("embedColorSetting")
                        .setTitle("Embed Color Setting");

                    const setting = new TextInputBuilder()
                        .setCustomId("embedColorInput")
                        .setLabel(`Input a hex code. Ex: #0000FF or default`)
                        .setStyle(TextInputStyle.Short);

                    const firstActionRow =
                        new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
                            [setting]
                        );

                    modal.addComponents([firstActionRow]);

                    await interaction.showModal(modal);
                }
            }
        }

        if (interaction.isModalSubmit()) {
            const guild = await GuildModel.findOne({
                id: interaction.guild?.id,
            });
            const successColor =
                (guild?.embedColor as ColorResolvable) ||
                (process.env.SUCCESS_COLOR as ColorResolvable);

            if (interaction.customId === "timezoneSetting") {
                const input =
                    interaction.fields.getTextInputValue("timezoneInput");
                if (!new IANAZone(input).isValid) {
                    interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setDescription(
                                    `Invalid timezone. Find your timezone [here](https://kevinnovak.github.io/Time-Zone-Picker/). Ex: America/New_York`
                                )
                                .setColor(
                                    process.env.ERROR_COLOR as ColorResolvable
                                ),
                        ],
                        ephemeral: true,
                    });
                    return;
                }

                const targetUserData = await DiscordUserModel.findOne({
                    id: interaction.user.id,
                });
                if (!targetUserData) {
                    await DiscordUserModel.create({
                        timezone: input,
                        reminderCount: 0,
                    });
                } else {
                    targetUserData.timezone = input.toLowerCase();
                    await targetUserData.save().then(() => {
                        interaction.reply({
                            embeds: [
                                new EmbedBuilder()
                                    .setDescription(
                                        `Successfully set your timezone set to **${targetUserData.timezone}**!`
                                    )
                                    .setColor(successColor),
                            ],
                            ephemeral: true,
                        });
                    });
                }
            } else if (interaction.customId === "embedColorSetting") {
                const input =
                    interaction.fields.getTextInputValue("embedColorInput");

                const reg = /^#([0-9a-f]{3}){1,2}$/i;
                if (!reg.test(input) && input.toLowerCase() !== "default") {
                    interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setDescription(
                                    `Invalid hex code. Find hex codes [here](https://www.color-hex.com/). Ex: #0000FF or default`
                                )
                                .setColor(
                                    process.env.ERROR_COLOR as ColorResolvable
                                ),
                        ],
                        ephemeral: true,
                    });
                    return;
                }

                const targetGuildData = await GuildModel.findOne({
                    id: interaction.guild?.id,
                });

                if (!targetGuildData) {
                    await GuildModel.create({
                        id: interaction.guild?.id,
                        embedColor:
                            input.toLowerCase() === "default"
                                ? "ea4553"
                                : input.substring(1),
                    });
                } else {
                    (targetGuildData.embedColor =
                        input.toLowerCase() === "default"
                            ? "ea4553"
                            : input.substring(1)),
                        await targetGuildData.save().then(() => {
                            interaction.reply({
                                embeds: [
                                    new EmbedBuilder()
                                        .setDescription(
                                            `Successfully set guild embed color to **#${targetGuildData.embedColor}**!`
                                        )
                                        .setColor(
                                            input.toLowerCase() === "default"
                                                ? ("ea4553" as ColorResolvable)
                                                : (input.substring(
                                                      1
                                                  ) as ColorResolvable)
                                        ),
                                ],
                                ephemeral: true,
                            });
                        });
                }
            }

            if (interaction.customId === "feedback") {
                client.channels
                    .fetch("974154706047864832")
                    .then(async (channel) => {
                        (channel as TextChannel).send(
                            `**Feedback**\n${interaction.user.toString()}`
                        );
                        (channel as TextChannel).send(
                            interaction.fields.getTextInputValue(
                                "feedbackInput"
                            )
                        );
                    })
                    .then(() => {
                        interaction.reply({
                            embeds: [
                                new EmbedBuilder()
                                    .setDescription("Thanks for your feedback!")
                                    .setColor(successColor),
                            ],
                            ephemeral: true,
                        });
                    });

                client.channels
                    .fetch("974154706047864832")
                    .then(async (channel) => {
                        (channel as TextChannel).send(
                            `**Feedback**\n${interaction.user.toString()}`
                        );
                        (channel as TextChannel).send(
                            interaction.fields.getTextInputValue(
                                "feedbackInput"
                            )
                        );
                    })
                    .then(() => {
                        interaction.reply({
                            embeds: [
                                new EmbedBuilder()
                                    .setDescription("Thanks for your feedback!")
                                    .setColor(successColor),
                            ],
                            ephemeral: true,
                        });
                    });
            }
        }

        if (interaction.isButton()) {
            const guild = await GuildModel.findOne({
                id: interaction.guild?.id,
            });
            const successColor =
                (guild?.embedColor as ColorResolvable) ||
                (process.env.SUCCESS_COLOR as ColorResolvable);

            if (interaction.customId === "sign_up") {
                const targetEventData = await EventModel.find({
                    messageId: interaction.message.id,
                });
                if (targetEventData.length === 0) {
                    interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setDescription(
                                    "Cannot interact with an event that has already ended."
                                )
                                .setColor(successColor),
                        ],
                        ephemeral: true,
                    });
                    return;
                } else if (targetEventData[0].started) {
                    interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setDescription(
                                    "Cannot interact with an event that has already started."
                                )
                                .setColor(successColor),
                        ],
                        ephemeral: true,
                    });
                    return;
                }
                if (
                    !targetEventData[0].participants.includes(
                        interaction.user.id
                    )
                ) {
                    await targetEventData[0].participants.push(
                        interaction.user.id
                    );
                    interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setDescription("Successfully signed up!")
                                .setColor(successColor),
                        ],
                        ephemeral: true,
                    });
                    await targetEventData[0].save().then(async () => {
                        await client.channels
                            .fetch(targetEventData[0].channelId)
                            .then(async (channel) => {
                                (channel as TextChannel)?.messages
                                    .fetch(targetEventData[0].messageId)
                                    .then((msg) => {
                                        const embed = msg.embeds[0];
                                        (
                                            embed?.fields as APIEmbedField[]
                                        )[2].name = `Participants (${targetEventData[0].participants.length.toString()})`;
                                        (
                                            embed?.fields as APIEmbedField[]
                                        )[2].value = targetEventData[0].participants
                                            .map((i) => `> <@${i}>`)
                                            .join("\n");

                                        if (msg.content) {
                                            msg.edit({
                                                content: msg.content,
                                                embeds: [embed],
                                                components: msg.components,
                                            });
                                        } else {
                                            msg.edit({
                                                embeds: [embed],
                                                components: msg.components,
                                            });
                                        }
                                    });
                            });
                    });
                } else {
                    await targetEventData[0].participants.splice(
                        targetEventData[0].participants.indexOf(
                            interaction.user.id
                        ),
                        1
                    );
                    interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setDescription(
                                    "Successfully removed you as a participant!"
                                )
                                .setColor(successColor),
                        ],
                        ephemeral: true,
                    });
                    await targetEventData[0].save().then(async () => {
                        await client.channels
                            .fetch(targetEventData[0].channelId)
                            .then(async (channel) => {
                                (channel as TextChannel)?.messages
                                    .fetch(targetEventData[0].messageId)
                                    .then((msg) => {
                                        const embed = msg.embeds[0];
                                        (
                                            embed?.fields as APIEmbedField[]
                                        )[2].name = `Participants (${targetEventData[0].participants.length.toString()})`;
                                        (
                                            embed.fields as APIEmbedField[]
                                        )[2].value =
                                            targetEventData[0].participants
                                                .length === 0
                                                ? "> -"
                                                : targetEventData[0].participants
                                                      .map((i) => `> <@${i}>`)
                                                      .join("\n");

                                        if (msg.content) {
                                            msg.edit({
                                                content: msg.content,
                                                embeds: [embed],
                                                components: msg.components,
                                            });
                                        } else {
                                            msg.edit({
                                                embeds: [embed],
                                                components: msg.components,
                                            });
                                        }
                                    });
                            });
                    });
                }
            }
        }
    } catch (err) {
        errorHandler("interaction event", err, client);
    }
};
