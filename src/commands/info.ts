import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { CommandInt } from "../interfaces/CommandInt";
import { errorHandler } from "../utils/errorHandler";

const formatDuration = (duration: number) => {
    const seconds: number = Math.floor((duration / 1000) % 60),
        minutes: number = Math.floor((duration / (1000 * 60)) % 60),
        hours: number = Math.floor((duration / (1000 * 60 * 60)) % 24);

    if (minutes === 0) {
        return `${seconds} secs`;
    }
    if (hours === 0) {
        return `${minutes} mins, ${seconds} secs`;
    }
    return `${hours} hrs, ${minutes} mins, ${seconds} secs`;
};

export const info: CommandInt = {
    data: new SlashCommandBuilder()
        .setName("info")
        .setDescription("Displays information about Kronos."),
    run: async (interaction, client, successColor) => {
        try {
            const embed = new EmbedBuilder()
                .setTitle("Information")
                .addFields([
                    {
                        name: "Developers",
                        value: `[ethan.#0001](https://ethanng.dev)\nViillager#0001`,
                        inline: true,
                    },
                    { name: "Version", value: "0.0.1", inline: true },
                    {
                        name: "Library",
                        value: "discord.js",
                        inline: true,
                    },
                    {
                        name: "Servers",
                        value: client.guilds.cache.size.toString(),
                        inline: true,
                    },
                    {
                        name: "Users",
                        value: client.users.cache.size.toString(),
                        inline: true,
                    },
                    {
                        name: "Invite",
                        value: "[Click here!](https://discord.com/api/oauth2/authorize?client_id=972953087306240041&permissions=2147683456&scope=bot%20applications.commands)",
                        inline: true,
                    },
                ])
                .setColor(successColor)
                .setFooter({
                    text: `Uptime: ${formatDuration(client.uptime as number)}`,
                });
            await interaction.reply({ embeds: [embed] });
            return;
        } catch (err) {
            errorHandler("info command", err, client);
        }
    },
};
