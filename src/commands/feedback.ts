import {
    SlashCommandBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder,
    ModalActionRowComponentBuilder,
} from "discord.js";
import { CommandInt } from "../interfaces/CommandInt";
import { errorHandler } from "../utils/errorHandler";

export const feedback: CommandInt = {
    data: new SlashCommandBuilder()
        .setName("feedback")
        .setDescription(
            "Provide feedback or ideas, report bugs, make suggestions, or request features."
        ),
    run: async (interaction, client) => {
        try {
            const modal = new ModalBuilder()
                .setCustomId("feedback")
                .setTitle("Feedback");

            const feedback = new TextInputBuilder()
                .setCustomId("feedbackInput")
                .setLabel("Feedback")
                .setStyle(TextInputStyle.Paragraph);

            const firstActionRow =
                new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
                    [feedback]
                );

            modal.addComponents([firstActionRow]);

            await interaction.showModal(modal);
            return;
        } catch (err) {
            errorHandler("feedback command", err, client);
        }
    },
};
