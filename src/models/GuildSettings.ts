import { model, Schema, InferSchemaType } from "mongoose";

const guildSettingSchema = new Schema(
  {
    guildId: { type: String, required: true, unique: true },
    prefix: { type: String, default: "a." },
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
        loggingEnabled: { type: Boolean, default: false },
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
        message: {
          type: String,
          default: "> Welcome {user} to __{guild.name}__.",
        },
        channelSend: String,
        imageTitle: { type: String, default: "Welcome #{guild.count}" },
        imageBody: { type: String, default: "{user.displayName}" },
        imageFooter: { type: String, default: "To {guild.name}" },
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
        nameChannelSyntax: {
          type: String,
          default: "{user.displayName}'s Voice",
        },
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
  },
  { timestamps: true },
);

type GuildSettingsType = InferSchemaType<typeof guildSettingSchema>;
export default model<GuildSettingsType>("GuildSettings", guildSettingSchema);
