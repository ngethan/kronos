import { CommandInt } from "../interfaces/CommandInt";
import { errorHandler } from "../utils/errorHandler";
import {
    EmbedBuilder,
    SlashCommandBuilder,
    ChatInputCommandInteraction,
} from "discord.js";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const embed = new EmbedBuilder();

export const evaluate: CommandInt = {
    data: new SlashCommandBuilder()
        .setName("eval")
        .setDescription("Evaluates code.")
        .addStringOption((o) =>
            o
                .setName("code")
                .setDescription("Code you want to evaluate.")
                .setRequired(true)
        ) as SlashCommandBuilder,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    run: async (interaction, client, successColor) => {
        try {
            if (
                interaction.user.id === "494941605157928960" ||
                interaction.user.id === "460702471359299584"
            ) {
                await interaction.deferReply();
                const command = (
                    interaction as ChatInputCommandInteraction
                ).options.getString("code");
                await eval(command as string).catch((err: unknown) => {
                    errorHandler("eval command", err, client);
                });
            } else {
                interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(
                                "Sorry, this is for the owner of this bot only."
                            )
                            .setColor(successColor),
                    ],
                });
            }
            return;
        } catch (err) {
            errorHandler("eval command", err, client);
        }
    },
};
