import { model, Schema, InferSchemaType } from "mongoose";

const guessBoxEnum = ["🟩", "🟨", "⬜", "⬛"] as const;
const statusEnum = ["playing", "won", "lost"] as const;

const userDataSchema = new Schema({
  userId: { type: String, required: true, unique: true },
  balance: { type: Number, default: 0 },
  bank: {
    type: {
      balance: { type: Number, default: 0 },
      capacity: { type: Number, default: 1000 },
      interestRate: { type: Number, default: 0.01 },
    },
    default: {},
  },
  dailyStreak: { type: Number, default: 0 },
  lastDaily: { type: Date },
  longestStreak: { type: Number, default: 0 },
  inventory: { type: [String], default: [] },
  wordleGame: {
    type: {
      date: { type: Date },
      word: { type: String },
      board: {
        type: [[{ type: String, enum: guessBoxEnum }]],
        default: () =>
          Array(6)
            .fill(null)
            .map(() => Array(5).fill("⬛")),
      },
      guessedWords: { type: [String], default: [] },
      wrongChars: { type: [String], default: [] },
      status: { type: String, enum: statusEnum, default: "playing" },
    },
  },
});

type UserDataType = InferSchemaType<typeof userDataSchema>;
export default model<UserDataType>("MiniGameUserData", userDataSchema);
