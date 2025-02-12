(require("dotenv") as { config: () => void }).config();
import { Client, IntentsBitField } from "discord.js";
import { Player } from "discord-player";
import { DefaultExtractors } from "@discord-player/extractor";
import { YoutubeiExtractor } from "discord-player-youtubei";
import registerCommands from "./handlers/registerCommands";
import discordEventHandler from "./handlers/discordEventHandler";
import musicEventHandler from "./handlers/musicEventHandler";
import mongoose from "mongoose";

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildEmojisAndStickers,
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
    await registerCommands();

    await player.extractors.loadMulti(DefaultExtractors);
    await player.extractors.register(YoutubeiExtractor, {
      streamOptions: {
        highWaterMark: 1 << 25,
        useClient: "TV"
      }
    });

    mongoose.set("strictQuery", false);
    await mongoose.connect(
      `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_CLUSTER}`
    );

    discordEventHandler(client);
    musicEventHandler(client, player);

    client.login(process.env.BOT_TOKEN as string);
  } catch (error: { name: string; message: string } | any) {
    console.log(`\x1b[31m\x1b[1m=> ${error.name}\x1b[0m`);
    console.log(`\x1b[32m${error.message}\x1b[0m`);
    console.log(error)
  }
}

run(client);
