(require("dotenv") as { config: () => void }).config();
import { Client, IntentsBitField } from "discord.js";
import { Player } from "discord-player";
import { YoutubeiExtractor } from "discord-player-youtubei";
import registerCommands from "./handlers/registerCommands";
import discordEventHandler from "./handlers/discordEventHandler";
import musicEventHandler from "./handlers/musicEventHandler";

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
  await registerCommands();
  await player.extractors.register(YoutubeiExtractor, {
    streamOptions: {
      useClient: "IOS",
    },
  });
  await player.extractors.loadDefault((ext) => ext !== "YouTubeExtractor");
  discordEventHandler(client);
  musicEventHandler(client, player);
  client.login(process.env.BOT_TOKEN as string);
}

run(client);
