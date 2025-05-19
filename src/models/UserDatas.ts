import { model, Schema, InferSchemaType } from "mongoose";

const userDatasSchema = new Schema({
  userId: { type: String, required: true },
  balance: { type: Number, default: 0 },
  dailyStreak: { type: Number, default: 0 },
  lastDailyTimestamp: Number
});

type UserDatasType = InferSchemaType<typeof userDatasSchema>;
export default model<UserDatasType>("UserDatas", userDatasSchema);
