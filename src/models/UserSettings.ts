import { model, Schema } from "mongoose";

const UserSettings = new Schema({
  userId: { type: String, required: true },
  messageTranslateLang: String,
  temporaryVoiceChannel: {
    type: new Schema({
      channelName: String,
      limitUser: Number,
      blockedUsers: [String],
    }),
    default: {},
  },
});

export default model("UserSettings", UserSettings);
