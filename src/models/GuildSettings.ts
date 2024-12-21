import { model, Schema } from "mongoose";

const guildSettingSchema = new Schema({
  guildId: { type: String, required: true },
  music: {
    volume: { type: Number, default: 75 },
    leaveOnEmpty: { type: Boolean, default: true },
    leaveOnEmptyCooldown: { type: Number, default: 60000 },
    leaveOnEnd: { type: Boolean, default: true },
    leaveOnEndCooldown: { type: Number, default: 60000 },
  },
  moderator: {
    logging: { type: Boolean, default: false },
    loggingChannel: String,
  },
  geminiAI: {
    enabled: { type: Boolean, default: false },
    ignorePrefix: { type: String, default: "!" },
    channelSet: String,
  },
  welcomer: {
    enabled: { type: Boolean, default: false },
    customMessage: String,
    channelSend: String,
    backgroundImage: String,
    imageTitle: String,
    imageBody: String,
    imageFooter: String
  },
  countingGame: {
    enabled: { type: Boolean, default: false },
    channelSet: String,
    startNumber: { type: Number, default: 1 }
  },
  temporaryVoiceChannel: {
    enabled: { type: Boolean, default: false },
    nameChannelSyntax: { type: String, default: "{username}'s Voice" },
    channelSet: String,
    categorySet: String
  },
  connectWordGame: {
    enabled: { type: Boolean, default: false },
    channelSet: String
  }
})

export default model("GuildSettings", guildSettingSchema);