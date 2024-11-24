import { model, Schema } from "mongoose";

const TranslateMessage = new Schema({
  userId: { type: String, required: true },
  language: String,
});

export default model("TranslateMessage", TranslateMessage);