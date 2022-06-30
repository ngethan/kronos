import {
    SlashCommandBuilder,
    SlashCommandSubcommandsOnlyBuilder,
    Client,
    CommandInteraction,
    ColorResolvable,
} from "discord.js";

export interface CommandInt {
    data: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder;
    run: (
        interaction: CommandInteraction,
        client: Client,
        successColor: ColorResolvable,
        errorColor: ColorResolvable
    ) => Promise<void>;
}
