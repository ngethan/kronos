import { errorHandler } from "../utils/errorHandler";
import EventModel from "../database/models/EventModel";
import { Client, EmbedBuilder, TextChannel, ColorResolvable } from "discord.js";
import GuildModel from "../database/models/GuildModel";

export const handleEvents = async (client: Client) => {
    try {
        const targetEventData = await EventModel.find();

        for (const event of targetEventData) {
            if (event.startTime <= Date.now() && !event.started) {
                const guild = await GuildModel.findOne({ id: event.guildId });
                const color =
                    (guild?.embedColor as ColorResolvable) ||
                    (process.env.SUCCESS_COLOR as ColorResolvable);

                const embed = new EmbedBuilder()
                    .setTitle(`📅 ${event.title}`)
                    .setDescription(
                        `[This event](${event.messageLink}) is starting!`
                    )
                    .setColor(color);
                try {
                    if (event.roleStart !== null) {
                        await client.channels
                            .fetch(event.channelId)
                            .then(async (channel) => {
                                (channel as TextChannel)
                                    ?.send({
                                        content: `<@&${event.roleStart}>`,
                                        embeds: [embed],
                                    })
                                    .catch((err: unknown) => {
                                        errorHandler(
                                            "handleEvents module",
                                            err,
                                            client
                                        );
                                    });
                                event.started = true;
                                await event.save();
                            });
                    } else {
                        await client.channels
                            .fetch(event.channelId)
                            .then(async (channel) => {
                                (channel as TextChannel)
                                    ?.send({
                                        embeds: [embed],
                                    })
                                    .catch((err: unknown) => {
                                        errorHandler(
                                            "handleEvents module",
                                            err,
                                            client
                                        );
                                    });
                                event.started = true;
                                await event.save();
                            });
                    }
                } catch (err) {
                    errorHandler("handleEvents module", err, client);
                }

                for (const participants of event.participants) {
                    client.users.fetch(participants).then((user) => {
                        user.send({
                            embeds: [embed],
                        }).catch((err: unknown) => {
                            errorHandler("handleEvents module", err, client);
                        });
                    });
                }
            } else if (event.started && Date.now() >= event.endTime) {
                const guild = await GuildModel.findOne({ id: event.guildId });
                const color =
                    (guild?.embedColor as ColorResolvable) ||
                    (process.env.SUCCESS_COLOR as ColorResolvable);

                const embed = new EmbedBuilder()
                    .setTitle(`📅 ${event.title}`)
                    .setDescription(
                        `[This event](${event.messageLink}) has ended!`
                    )
                    .setColor(color);
                try {
                    await client.channels
                        .fetch(event.channelId)
                        .then(async (channel) => {
                            (channel as TextChannel)
                                ?.send({
                                    embeds: [embed],
                                })
                                .catch((error: unknown) => {
                                    console.log(error);
                                });
                            await event.remove();
                        });
                } catch (err) {
                    errorHandler("handleEvents module", err, client);
                }

                for (const participants of event.participants) {
                    client.users.fetch(participants).then((user) => {
                        user.send({
                            embeds: [embed],
                        }).catch((err: unknown) => {
                            errorHandler("handleEvents module", err, client);
                        });
                    });
                }
            }
        }
    } catch (err) {
        errorHandler("handleEvents module", err, client);
    }
};
