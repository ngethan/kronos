import { errorHandler } from "../utils/errorHandler";
import {
    Client,
    ColorResolvable,
    EmbedBuilder,
    Guild,
    TextChannel,
} from "discord.js";

export const guildCreate = async (g: Guild, client: Client): Promise<void> => {
    try {
        client.channels.fetch("974523400930336808").then(async (channel) => {
            (channel as TextChannel).send(
                `Joined **${g.name}** \`(${g.id})\`!`
            );
        });
        const embed = new EmbedBuilder()
            .setAuthor({
                name: client.user?.username as string,
                iconURL: client.user?.displayAvatarURL(),
            })
            .setDescription(
                "Thanks for inviting Kronos!\n\nKronos allows you to create server-wide events and personalized reminders with ease. Engage your server with events, stay on track with reminders, and more!\n\n**Important** Configure slash command permissions by going to server settings > integrations > Kronos. Then, you can click on any command and limit it to a permission/role/user.\n\nIf you need help, you can use the /help command or join the [support server](https://discord.gg/vhmPdcKwm8)."
            )
            .setColor(process.env.SUCCESS_COLOR as ColorResolvable);

        client.users
            .fetch(
                await g.fetchAuditLogs({ type: 28 }).then(async (a) => {
                    return a.entries.first()?.executor?.id as string;
                })
            )
            .then((user) => {
                user.send({
                    embeds: [embed],
                });
            })
            .catch((err: unknown) => {
                errorHandler("guildCreate event", err, client);
            });
    } catch (err) {
        errorHandler("guildCreate event", err, client);
    }
};
