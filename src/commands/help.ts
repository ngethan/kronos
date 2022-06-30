import {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    Message,
    ButtonStyle,
    SlashCommandBuilder,
    ComponentType,
} from "discord.js";
import { CommandInt } from "../interfaces/CommandInt";
import { errorHandler } from "../utils/errorHandler";

export const help: CommandInt = {
    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("Displays Kronos' commands and usage."),
    run: async (interaction, client, successColor) => {
        try {
            const embed = new EmbedBuilder()
                .setAuthor({
                    name: client.user?.username as string,
                    iconURL: client.user?.displayAvatarURL(),
                })
                .setDescription(
                    "Kronos allows you to create server-wide events and personalized reminders with ease. Engage your server with events, stay on track with reminders, and more!\n\nClick on the buttons below to view more information about commands."
                )
                .setColor(successColor);
            const components =
                new ActionRowBuilder<ButtonBuilder>().addComponents([
                    new ButtonBuilder()
                        .setLabel("Support Server")
                        .setURL("https://discord.gg/vhmPdcKwm8")
                        .setStyle(ButtonStyle.Link),
                    new ButtonBuilder()
                        .setCustomId("events_info")
                        .setLabel("Events")
                        .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId("reminders_info")
                        .setLabel("Reminders")
                        .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId("settings_info")
                        .setLabel("Settings")
                        .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId("commands")
                        .setLabel("All Commands")
                        .setStyle(ButtonStyle.Danger),
                ]);

            await interaction
                .reply({
                    embeds: [embed],
                    components: [components],
                    fetchReply: true,
                })
                .then((msg) => {
                    const collector = (
                        msg as Message
                    ).createMessageComponentCollector({
                        componentType: ComponentType.Button,
                        time: 300000,
                    });

                    collector.on("collect", async (i) => {
                        if (i.user.id !== interaction.user.id) {
                            return;
                        }
                        const components =
                            new ActionRowBuilder<ButtonBuilder>().addComponents(
                                [
                                    new ButtonBuilder()
                                        .setLabel("Support Server")
                                        .setURL("https://discord.gg/vhmPdcKwm8")
                                        .setStyle(ButtonStyle.Link),
                                    new ButtonBuilder()
                                        .setCustomId("events_info")
                                        .setLabel("Events")
                                        .setStyle(ButtonStyle.Secondary),
                                    new ButtonBuilder()
                                        .setCustomId("reminders_info")
                                        .setLabel("Reminders")
                                        .setStyle(ButtonStyle.Secondary),
                                    new ButtonBuilder()
                                        .setCustomId("settings_info")
                                        .setLabel("Settings")
                                        .setStyle(ButtonStyle.Secondary),
                                    new ButtonBuilder()
                                        .setCustomId("commands")
                                        .setLabel("All Commands")
                                        .setStyle(ButtonStyle.Danger),
                                ]
                            );

                        if (i.customId === "events_info") {
                            const embed = new EmbedBuilder()
                                .setTitle("📅 Events")
                                .setDescription(
                                    `Events are server-wide and will last for a certain amount of time.\n\n**Command Usage:** /event \`title\` \`start_time\` \`duration\` \`description (optional) channel (optional)\` \`create_role (optional)\` \`start_role (optional)\`\nStart time ex: 1 min, 2h, 12/24/2022 5 PM\nDuration ex: 1 min, 2h`
                                )
                                .setColor(successColor)
                                .setFooter({
                                    text: `/events to view your ongoing events`,
                                });
                            i.update({
                                embeds: [embed],
                                components: [components],
                            });
                        } else if (i.customId === "reminders_info") {
                            const embed = new EmbedBuilder()
                                .setTitle("🕒 Reminders")
                                .setDescription(
                                    `Reminders are personalized events that are sent to you at a specific time.\n\n**Command Usage:** /remind \`reminder\` \`datetime\`\nDatetime ex: 1 min, 2h, 12/24/2022 5 PM`
                                )
                                .setColor(successColor)
                                .setFooter({
                                    text: `/reminders to view your ongoing reminders`,
                                });
                            i.update({
                                embeds: [embed],
                                components: [components],
                            });
                        } else if (i.customId === "settings_info") {
                            const embed = new EmbedBuilder()
                                .setTitle("⚙️ Settings")
                                .setDescription("Coming soon!")
                                .setColor(successColor);
                            i.update({
                                embeds: [embed],
                                components: [components],
                            });
                        } else if (i.customId === "commands") {
                            const embed = new EmbedBuilder()
                                .setTitle("All Commands")
                                .setDescription(
                                    "`/help` ・ Displays Kronos' commands and usage\n`/info` ・ Displays information about Kronos\n`/event` ・ Creates an event\n`/remind` ・ Sets a reminder\n`/events` ・ Lists the server's ongoing events\n`/reminders` ・ Lists your ongoing reminders\n`/remindParticipants` ・ Sends a reminder to all event participants.\n`/delete` ・ Deletes an event/reminder\n`/feedback` ・ Provide feedback or ideas, report bugs, make suggestions, or request features.\n`/invite` ・ Sends an invite link for Kronos."
                                )
                                .setColor(successColor);
                            i.update({
                                embeds: [embed],
                                components: [components],
                            });
                        }
                    });
                    collector.on("end", () => {
                        const disabledComponents =
                            new ActionRowBuilder<ButtonBuilder>().addComponents(
                                [
                                    new ButtonBuilder()
                                        .setLabel("Support Server")
                                        .setURL("https://discord.gg/vhmPdcKwm8")
                                        .setStyle(ButtonStyle.Link),
                                    new ButtonBuilder()
                                        .setCustomId("events_info")
                                        .setLabel("Events")
                                        .setStyle(ButtonStyle.Secondary)
                                        .setDisabled(true),
                                    new ButtonBuilder()
                                        .setCustomId("reminders_info")
                                        .setLabel("Reminders")
                                        .setStyle(ButtonStyle.Secondary)
                                        .setDisabled(true),
                                    new ButtonBuilder()
                                        .setCustomId("settings_info")
                                        .setLabel("Settings")
                                        .setStyle(ButtonStyle.Secondary)
                                        .setDisabled(true),
                                    new ButtonBuilder()
                                        .setCustomId("commands")
                                        .setLabel("All Commands")
                                        .setStyle(ButtonStyle.Danger)
                                        .setDisabled(true),
                                ]
                            );
                        interaction.editReply({
                            embeds: [msg.embeds[0]],
                            components: [disabledComponents],
                        });
                    });
                });
            return;
        } catch (err) {
            errorHandler("help command", err, client);
        }
    },
};
