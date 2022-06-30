import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { CommandInt } from "../interfaces/CommandInt";
import { errorHandler } from "../utils/errorHandler";

export const invite: CommandInt = {
    data: new SlashCommandBuilder()
        .setName("invite")
        .setDescription("Sends an invite link for Kronos."),
    run: async (interaction, client, successColor) => {
        try {
            const embed = new EmbedBuilder()
                .setTitle("Invite Kronos!")
                .setDescription(
                    "[Click here!](https://discord.com/api/oauth2/authorize?client_id=972953087306240041&permissions=2147683456&scope=bot%20applications.commands)"
                )
                .setColor(successColor);
            await interaction.reply({ embeds: [embed] });
            return;
        } catch (err) {
            errorHandler("invite command", err, client);
        }
    },
};
