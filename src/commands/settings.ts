import {
    EmbedBuilder,
    SlashCommandBuilder,
    SelectMenuBuilder,
    ActionRowBuilder,
} from "discord.js";
import { CommandInt } from "../interfaces/CommandInt";
import { errorHandler } from "../utils/errorHandler";

export const settings: CommandInt = {
    data: new SlashCommandBuilder()
        .setName("settings")
        .setDescription("Set your personal preferences."),
    run: async (interaction, client, successColor) => {
        try {
            const row = new ActionRowBuilder<SelectMenuBuilder>().addComponents(
                [
                    new SelectMenuBuilder()
                        .setCustomId("settings")
                        .setPlaceholder("Choose a setting")
                        .addOptions([
                            {
                                label: "Timezone",
                                description: "Set your timezone!",
                                value: "timezoneSetting",
                            },
                            {
                                label: "Embed Color",
                                description:
                                    "Change the color of the embeds sent to this server!",
                                value: "embedColorSetting",
                            },
                        ]),
                ]
            );

            const embed = new EmbedBuilder()
                .setDescription(
                    "Choose which setting you'd like to edit by using the select menu below!"
                )
                .setColor(successColor);
            await interaction.reply({
                embeds: [embed],
                components: [row],
            });
            return;
        } catch (err) {
            errorHandler("settings command", err, client);
        }
    },
};
