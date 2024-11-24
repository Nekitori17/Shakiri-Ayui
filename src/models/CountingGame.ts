import { model, Schema } from "mongoose";

const countingGameScheme = new Schema({
  guildId: { type: String, required: true },
  latestMessageId: { type: String, required: true },
  latestUserId: { type: String, required: true },
  countingCurrent: { type: Number, required: true},
});

export default model("CountingGame", countingGameScheme);