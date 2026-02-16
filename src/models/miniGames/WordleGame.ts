import { model, Schema, InferSchemaType } from "mongoose";

const guessBoxEnum = ["🟩", "🟨", "⬜", "⬛"];
const statusEnum = ["playing", "won", "lost"];

const wordleGame = new Schema(
  {
    userId: { type: String, required: true, unique: true },
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
    status: { type: String, enum: statusEnum },
  },
  { timestamps: true },
);

type WordleGameType = InferSchemaType<typeof wordleGame>;
export default model<WordleGameType>("WordleGame", wordleGame);
