import { model, Schema, InferSchemaType } from "mongoose";

const countingGameScheme = new Schema(
  {
    guildId: { type: String, required: true, unique: true },
    latestMessageId: { type: String, required: true },
    latestUserId: { type: String, required: true },
    countingCurrentNumber: { type: Number, required: true },
  },
  { timestamps: true },
);

type CountingGameType = InferSchemaType<typeof countingGameScheme>;
export default model<CountingGameType>("CountingGame", countingGameScheme);
