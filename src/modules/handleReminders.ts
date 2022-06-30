import { errorHandler } from "../utils/errorHandler";
import ReminderModel from "../database/models/ReminderModel";
import { Client, EmbedBuilder, ColorResolvable } from "discord.js";

export const handleReminders = async (client: Client) => {
    try {
        const targetReminderData = await ReminderModel.find();

        for (const r of targetReminderData) {
            if (r.endTime <= Date.now()) {
                try {
                    client.users.fetch(r.userId).then(async (user) => {
                        user.send({
                            embeds: [
                                new EmbedBuilder()
                                    .setTitle("🕒 Reminder")
                                    .setDescription(
                                        `${r.reminder}\n\n[This reminder](${
                                            r.messageLink
                                        }) was set <t:${Math.floor(
                                            Date.now() / 1000 -
                                                r.duration / 1000
                                        )}:R>`
                                    )
                                    .setColor(
                                        process.env
                                            .SUCCESS_COLOR as ColorResolvable
                                    ),
                            ],
                        }).catch((err: unknown) => {
                            errorHandler("handleReminders module", err, client);
                        });
                        await r.remove();
                    });
                } catch (err) {
                    errorHandler("handleReminders module", err, client);
                }
            }
        }
    } catch (err) {
        errorHandler("handleReminders module", err, client);
    }
};
