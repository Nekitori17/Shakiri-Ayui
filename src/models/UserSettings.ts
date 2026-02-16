import { model, Schema, InferSchemaType } from "mongoose";

const userSettingsSchema = new Schema(
  {
    userId: { type: String, required: true, unique: true },
    messageTranslateLang: String,
    temporaryVoiceChannel: {
      type: {
        channelName: { type: String, default: null },
        limitUser: { type: Number, default: 0 },
        blockedUsers: { type: [String], default: [] },
      },
      default: {},
    },
  },
  { timestamps: true },
);

type UserSettingsType = InferSchemaType<typeof userSettingsSchema>;
export default model<UserSettingsType>("UserSettings", userSettingsSchema);
