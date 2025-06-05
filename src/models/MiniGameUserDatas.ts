import { model, Schema, InferSchemaType } from "mongoose";

const userDatasSchema = new Schema({
  userId: { type: String, required: true },
  balance: { type: Number, default: 0 },
  bank: {
    type: {
      balance: { type: Number, default: 0 },
      capacity: { type: Number, default: 1000 },
      profit: { type: Number, default: 0.05 },
    },
    default: {},
  },
  dailyStreak: { type: Number, default: 0 },
  lastDaily: { type: Date },
  longestStreak: { type: Number, default: 0 },
  inventory: { type: [String], default: [] },
});

type UserDatasType = InferSchemaType<typeof userDatasSchema>;
export default model<UserDatasType>("MiniGameUserDatas", userDatasSchema);
