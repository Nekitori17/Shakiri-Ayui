import { model, Schema } from "mongoose";

const UserSettings = new Schema({
  userId: { type: String, required: true },
  messageTranslateLang: String,
  temporaryVoiceChannel: {
    channelName: String,
    limitUser: Number,
    blockedUsers: [String],
  }
});

export default model("UserSettings", UserSettings);