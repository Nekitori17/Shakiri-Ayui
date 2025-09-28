import mongoose from "mongoose";
import { Client, IntentsBitField } from "discord.js";
import { Player } from "discord-player";
import { preload } from "./preloaded";
import musicEventHandler from "./handlers/musicEventHandler";
import discordEventHandler from "./handlers/discordEventHandler";
import registerMusicExtractor from "./handlers/registerMusicExtractor";
import { errorLogger } from "./helpers/utils/handleError";

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildExpressions,
    IntentsBitField.Flags.GuildInvites,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessagePolls,
    IntentsBitField.Flags.GuildMessageReactions,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.GuildModeration,
    IntentsBitField.Flags.GuildVoiceStates,
    IntentsBitField.Flags.GuildWebhooks,
    IntentsBitField.Flags.DirectMessagePolls,
    IntentsBitField.Flags.DirectMessageReactions,
    IntentsBitField.Flags.DirectMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

const player = new Player(client);

async function run(client: Client) {
  try {
    console.log("⭐============Shakiri Ayui============⭐");

    console.log("🔮 | Starting prepare everything");
    preload();
    console.log("🍞 | Loaded all stuffs into RAM");

    await registerMusicExtractor(player);

    console.log("💿 | Connecting to MongoDB...");
    mongoose.set("strictQuery", false);
    await mongoose.connect(process.env.MONGODB_CONNECTION_URI as string);
    console.log("🔑 | Connected to MongoDB");

    discordEventHandler(client);
    musicEventHandler(client, player);

    client.setMaxListeners(100);
    client.login(process.env.BOT_TOKEN as string);
  } catch (error: any) {
    console.log(`\x1b[31m\x1b[1m=> ${error.name}\x1b[0m`);
    console.log(`\x1b[32m${error.message}\x1b[0m`);
    errorLogger(error);
  }
}

run(client);
