import { validateEnv } from "./utils/validateEnv";
import { Client, Partials, IntentsBitField } from "discord.js";
import { ready } from "./events/ready";
import { interaction } from "./events/interaction";
import { CronJob } from "cron";
import { handleReminders } from "./modules/handleReminders";
import { handleEvents } from "./modules/handleEvents";
import { connectDatabase } from "./database/connectDatabase";
import { guildCreate } from "./events/guildCreate";
import { guildDelete } from "./events/guildDelete";

(async () => {
    validateEnv();

    const client = new Client({
        intents: [
            new IntentsBitField([
                IntentsBitField.Flags.GuildMessages,
                IntentsBitField.Flags.DirectMessages,
                IntentsBitField.Flags.Guilds,
            ]),
        ],
        partials: [
            Partials.Message,
            Partials.Channel,
            Partials.GuildMember,
            Partials.Reaction,
            Partials.User,
        ],
    });

    client.on("ready", async () => await ready(client));
    client.on("interactionCreate", async (i) => await interaction(i, client));
    client.on("guildCreate", async (g) => await guildCreate(g, client));
    client.on("guildDelete", async (g) => await guildDelete(g, client));

    await connectDatabase(client);

    await client.login(process.env.TOKEN as string);

    const job = new CronJob("*/30 * * * * *", () => {
        handleReminders(client);
        handleEvents(client);
    });
    job.start();
})();
