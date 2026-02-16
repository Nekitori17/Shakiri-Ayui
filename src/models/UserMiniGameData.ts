import { model, Schema, InferSchemaType } from "mongoose";

const userMiniGameDataSchema = new Schema(
  {
    userId: { type: String, required: true, unique: true },

    balance: { type: Number, default: 0 },

    bank: {
      type: {
        balance: { type: Number, default: 0 },
        capacity: { type: Number, default: 1000 },
        interestRate: { type: Number, default: 0.005 },
      },
      default: {}
    },

    daily: {
      type: {
        streak: { type: Number, default: 0 },
        lastDaily: { type: Date, default: null },
        longestStreak: { type: Number, default: 0 },
      },
      default: {}
    },

    inventory: { type: [String], default: [] },
  },
  { timestamps: true },
);

type UserDataType = InferSchemaType<typeof userMiniGameDataSchema>;

export default model<UserDataType>("UserMiniGameData", userMiniGameDataSchema);
