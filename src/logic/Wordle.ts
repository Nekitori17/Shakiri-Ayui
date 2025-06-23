import fs from "fs";
import path from "path";

class WordleGameExeption extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WordleGameExeption";
  }
}

const validWordList = fs
  .readFileSync(path.join(__dirname, "../../assets/5-char-valid.txt"), "utf-8")
  .trim()
  .split("\n");

function checkValidWord(word: string) {
  return validWordList.includes(word.toLowerCase());
}

function getRandomWord() {
  const wordleFilePath = path.join(
    __dirname,
    "../../assets/wordle-word-list.txt"
  );

  const seed = Math.floor(Date.now() / (1000 * 60 * 60 * 24));

  const wordleFileContent = fs.readFileSync(wordleFilePath, "utf-8");
  const wordleList = wordleFileContent.trim().split("\n");

  const index = Math.floor(Math.random() * wordleList.length);
  return wordleList[index];
}

type GuessCheckBox = "🟩" | "🟨" | "⬜" | "⬛";
type WordleGameStatus = "playing" | "won" | "lost";

class WordleGame {
  public word: string;
  public board: GuessCheckBox[][];
  public guessed: string[];
  public maxGuesses: number;
  public wrongChars: string[];
  public status: WordleGameStatus;

  constructor() {
    this.word = getRandomWord().toUpperCase();
    this.guessed = [];
    this.board = Array.from(
      { length: 6 },
      () => Array(5).fill("⬛") as GuessCheckBox[]
    );
    this.maxGuesses = 6;
    this.wrongChars = [];
    this.status = "playing";
  }

  public guess(guessInput: string): GuessCheckBox[] {
    if (this.status !== "playing")
      throw new WordleGameExeption("🎮 Game is already over.");

    const guess = guessInput.toUpperCase();

    if (guess.length !== 5)
      throw new WordleGameExeption("5️⃣ Guess must be 5 letters long.");
    if (!checkValidWord(guess))
      throw new WordleGameExeption("❌ Invalid word.");
    if (this.guessed.includes(guess))
      throw new WordleGameExeption("➰ Word already guessed.");
    if (this.guessed.length >= this.maxGuesses)
      throw new WordleGameExeption("🔚 Maximum guesses reached.");

    this.guessed.push(guess);

    const result: GuessCheckBox[] = Array(5).fill("⬜");
    const wordChars = this.word.split("");
    const guessChars = guess.split("");

    const wordCharsForYellow = [...wordChars];
    const matched = Array(5).fill(false);

    for (let i = 0; i < 5; i++) {
      if (guessChars[i] === wordChars[i]) {
        result[i] = "🟩";
        matched[i] = true;
        wordCharsForYellow[i] = "";
      }
    }

    for (let i = 0; i < 5; i++) {
      if (result[i] === "🟩") continue;

      const charToFind = guessChars[i];
      const idx = wordCharsForYellow.findIndex(
        (ch) => ch === charToFind && ch !== ""
      );

      if (idx !== -1) {
        result[i] = "🟨";
        wordCharsForYellow[idx] = "";
      } else {
        if (
          charToFind &&
          !wordChars.includes(charToFind) &&
          !this.wrongChars.includes(charToFind)
        ) {
          this.wrongChars.push(charToFind);
        }
      }
    }

    const currentGuessIndex = this.guessed.length - 1;
    this.board[currentGuessIndex] = result;

    if (guess === this.word) {
      this.status = "won";
    } else if (this.guessed.length >= this.maxGuesses) {
      this.status = "lost";
    }

    return result;
  }

  public getBoard(): GuessCheckBox[][] {
    return this.board;
  }

  public getGuesses(): string[] {
    return this.guessed;
  }

  public getWrongChars(): string[] {
    return this.wrongChars;
  }

  public getStatus(): WordleGameStatus {
    return this.status;
  }

  public getWord(): string {
    return this.word;
  }

  public getCurrentGuessCount(): number {
    return this.guessed.length;
  }
}

export { WordleGameExeption };
export type { GuessCheckBox, WordleGameStatus };
export { getRandomWord, checkValidWord };
export default WordleGame;
