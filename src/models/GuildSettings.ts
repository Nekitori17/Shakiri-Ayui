import { model, Schema, InferSchemaType } from "mongoose";

const guildSettingSchema = new Schema({
  guildId: { type: String, required: true },
  music: {
    type: {
      volume: { type: Number, default: 75 },
      leaveOnEmpty: { type: Boolean, default: true },
      leaveOnEmptyCooldown: { type: Number, default: 60000 },
      leaveOnEnd: { type: Boolean, default: true },
      leaveOnEndCooldown: { type: Number, default: 60000 },
    },
    default: {},
  },
  moderator: {
    type: {
      logging: { type: Boolean, default: false },
      loggingChannel: String,
    },
    default: {},
  },
  geminiAI: {
    type: {
      enabled: { type: Boolean, default: false },
      ignorePrefix: { type: String, default: "!" },
      channelSet: String,
    },
    default: {},
  },
  welcomer: {
    type: {
      enabled: { type: Boolean, default: false },
      message: { type: String, default: "> Welcome {user} to __{guild}__." },
      channelSend: String,
      backgroundImage: {
        type: String,
        default: "https://i.ibb.co/BnCqSH0/banner.jpg",
      },
      imageTitle: { type: String, default: "{user_display}" },
      imageBody: { type: String, default: "Welcome to {guild}" },
      imageFooter: { type: String, default: "Member #{member_count}" },
    },
    default: {},
  },
  countingGame: {
    type: {
      enabled: { type: Boolean, default: false },
      startNumber: { type: Number, default: 1 },
      channelSet: String,
    },
    default: {},
  },
  temporaryVoiceChannel: {
    type: {
      enabled: { type: Boolean, default: false },
      nameChannelSyntax: { type: String, default: "{user}'s Voice" },
      channelSet: String,
      categorySet: String,
    },
    default: {},
  },
  connectWordGame: {
    type: {
      enabled: { type: Boolean, default: false },
      channelSet: String,
    },
    default: {},
  },
});

type GuildSettingsType = InferSchemaType<typeof guildSettingSchema>;
export default model<GuildSettingsType>("GuildSettings", guildSettingSchema);