import { model, Schema } from "mongoose";
import autoSetDefaults from "../helpers/autoSetDefaults";

const musicSchema = new Schema({
  volume: { type: Number, default: 75 },
  leaveOnEmpty: { type: Boolean, default: true },
  leaveOnEmptyCooldown: { type: Number, default: 60000 },
  leaveOnEnd: { type: Boolean, default: true },
  leaveOnEndCooldown: { type: Number, default: 60000 },
});

const moderatorSchema = new Schema({
  logging: { type: Boolean, default: false },
  loggingChannel: String,
});

const geminiAISchema = new Schema({
  enabled: { type: Boolean, default: false },
  ignorePrefix: { type: String, default: "!" },
  channelSet: String,
});

const welcomerSchema = new Schema({
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
});

const countingGameSchema = new Schema({
  enabled: { type: Boolean, default: false },
  startNumber: { type: Number, default: 1 },
  channelSet: String,
});

const temporaryVoiceChannelSchema = new Schema({
  enabled: { type: Boolean, default: false },
  nameChannelSyntax: { type: String, default: "{username}'s Voice" },
  channelSet: String,
  categorySet: String,
});

const connectWordGameSchema = new Schema({
  enabled: { type: Boolean, default: false },
  channelSet: String,
});

//-------------------------------------------------------------------------

const guildSettingSchema = new Schema({
  guildId: { type: String, required: true },
  music: {
    type: musicSchema,
    default: () => autoSetDefaults(musicSchema.obj),
  },
  moderator: {
    type: moderatorSchema,
    default: () => autoSetDefaults(moderatorSchema.obj),
  },
  geminiAI: {
    type: geminiAISchema,
    default: () => autoSetDefaults(geminiAISchema.obj),
  },
  welcomer: {
    type: welcomerSchema,
    default: () => autoSetDefaults(welcomerSchema.obj),
  },
  countingGame: {
    type: countingGameSchema,
    default: () => autoSetDefaults(countingGameSchema.obj),
  },
  temporaryVoiceChannel: {
    type: temporaryVoiceChannelSchema,
    default: () => autoSetDefaults(temporaryVoiceChannelSchema.obj),
  },
  connectWordGame: {
    type: connectWordGameSchema,
    default: () => autoSetDefaults(connectWordGameSchema.obj),
  },
});

export default model("GuildSettings", guildSettingSchema);
