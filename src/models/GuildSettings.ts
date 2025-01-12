import { prop, getModelForClass } from "@typegoose/typegoose";
import { CountingGame } from "./GuildSettings/CountingGame";
import { GeminiAI } from "./GuildSettings/GeminiAI";
import { Moderator } from "./GuildSettings/Moderator";
import { Music } from "./GuildSettings/Music";
import { TemporaryVoiceChannel } from "./GuildSettings/TempVoiceChannel";
import { Welcomer } from "./GuildSettings/Welcomer";

class GuildSettings {
  @prop({ required: true })
  guildId!: string;

  @prop({ _id: false, default: {} })
  countingGame!: CountingGame;

  @prop({ _id: false, default: {} })
  geminiAI!: GeminiAI;

  @prop({ _id: false, default: {} })
  moderator!: Moderator;

  @prop({ _id: false, default: {} })
  music!: Music;

  @prop({ _id: false, default: {} })
  temporaryVoiceChannel!: TemporaryVoiceChannel;

  @prop({ _id: false, default: {} })
  welcomer!: Welcomer;
}

export default getModelForClass(GuildSettings);

