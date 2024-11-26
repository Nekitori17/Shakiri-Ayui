import { model, Schema } from "mongoose";

const UserSettings = new Schema({
  userId: { type: String, required: true },
  messageTranslateLang: String,
  temporaryVoiceChannelName: String
});

export default model("UserSettings", UserSettings);