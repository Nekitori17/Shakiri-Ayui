import { prop, getModelForClass } from "@typegoose/typegoose";

class Music {
  @prop({ default: 75 })
  volume!: number;

  @prop({ default: true })
  leaveOnEmpty!: boolean;

  @prop({ default: 60000 })
  leaveOnEmptyCooldown!: number;

  @prop({ default: true })
  leaveOnEnd!: boolean;

  @prop({ default: 60000 })
  leaveOnEndCooldown!: number;
}

class Moderator {
  @prop({ default: false })
  logging!: boolean;

  @prop()
  loggingChannel?: string;
}

class GeminiAI {
  @prop({ default: false })
  enabled!: boolean;

  @prop({ default: "!" })
  ignorePrefix!: string;

  @prop()
  channelSet?: string;
}

class Welcomer {
  @prop({ default: false })
  enabled!: boolean;

  @prop({ default: "> Welcome {user} to __{guild}__." })
  message!: string;

  @prop()
  channelSend?: string;

  @prop({ default: "https://i.ibb.co/BnCqSH0/banner.jpg" })
  backgroundImage!: string;

  @prop({ default: "{user_display}" })
  imageTitle!: string;

  @prop({ default: "Welcome to {guild}" })
  imageBody!: string;

  @prop({ default: "Member #{member_count}" })
  imageFooter!: string;
}

class CountingGame {
  @prop({ default: false })
  enabled!: boolean;

  @prop({ default: 1 })
  startNumber!: number;

  @prop()
  channelSet?: string;
}

class TemporaryVoiceChannel {
  @prop({ default: false })
  enabled!: boolean;

  @prop({ default: "{username}'s Voice" })
  nameChannelSyntax!: string;

  @prop()
  channelSet?: string;

  @prop()
  categorySet?: string;
}

class GuildSettings {
  @prop({ required: true })
  guildId!: string;

  @prop({ _id: false, default: {} })
  music!: Music;

  @prop({ _id: false, default: {} })
  moderator!: Moderator;

  @prop({ _id: false, default: {} })
  geminiAI!: GeminiAI;

  @prop({ _id: false, default: {} })
  welcomer!: Welcomer;

  @prop({ _id: false, default: {} })
  countingGame!: CountingGame;

  @prop({ _id: false, default: {} })
  temporaryVoiceChannel!: TemporaryVoiceChannel;
}

export default getModelForClass(GuildSettings);
