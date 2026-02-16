import fs from "fs";
import path from "path";

/**
 *  Custom exception class for Wordle game-related errors.
 */
class WordleGameException extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WordleGameException";
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

  const wordleFileContent = fs.readFileSync(wordleFilePath, "utf-8");
  const wordleList = wordleFileContent.trim().split("\n");

  const index = Math.floor(Math.random() * wordleList.length);
  return wordleList[index];
}

/**
 * Represents the possible states of a single character guess in Wordle.
 * - "🟩": Correct letter and position (Green)
 * - "🟨": Correct letter, wrong position (Yellow)
 * - "⬜": Letter not in the word (White/Grey - default for empty cells)
 * - "⬛": Empty
 */
type GuessCheckBox = "🟩" | "🟨" | "⬜" | "⬛";
type WordleGameStatus = "playing" | "won" | "lost";

class WordleGame {
  public date: Date;
  public word: string;
  /**
   * The game board, represented as a 2D array of `GuessCheckBox` values.
   */
  public board: GuessCheckBox[][];
  public guessed: string[];
  public maxGuesses: number;
  public wrongChars: string[];
  public status: WordleGameStatus;

  constructor() {
    // Initialize game properties
    this.date = new Date();
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

  public guess(guessInput: string) {
    if (this.status !== "playing")
      throw new WordleGameException("🎮 Game is already over.");

    // Validate guess input
    const guess = guessInput.toUpperCase();
    if (guess.length !== 5)
      throw new WordleGameException("5️⃣ Guess must be 5 letters long.");
    if (!checkValidWord(guess))
      throw new WordleGameException("❌ Invalid word.");
    if (this.guessed.includes(guess))
      throw new WordleGameException("➰ Word already guessed.");
    if (this.guessed.length >= this.maxGuesses)
      throw new WordleGameException("🔚 Maximum guesses reached.");

    this.guessed.push(guess);

    // Evaluate the guess
    const result: GuessCheckBox[] = Array(5).fill("⬜");
    const wordChars = this.word.split("");
    const guessChars = guess.split("");

    // Create a mutable copy of wordChars for tracking purposes
    const wordCharsForYellow = [...wordChars];
    const matched = Array(5).fill(false);

    // First pass: Check for correct letters in correct positions (Green 🟩)
    for (let i = 0; i < 5; i++) {
      if (guessChars[i] === wordChars[i]) {
        result[i] = "🟩";
        matched[i] = true;
        wordCharsForYellow[i] = "";
      }
    }

    /* 
    Second pass: Check for correct letters in wrong positions (Yellow 🟨) and wrong letters (White ⬜) */
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

    // Update the board with the result of the current guess
    const currentGuessIndex = this.guessed.length - 1;
    this.board[currentGuessIndex] = result;

    if (guess === this.word) {
      this.status = "won";
    } else if (this.guessed.length >= this.maxGuesses) {
      this.status = "lost";
    }

    return result;
  }
  
  public getBoard() {
    return this.board;
  }

  public getGuesses() {
    return this.guessed;
  }

  public getWrongChars() {
    return this.wrongChars;
  }

  public getStatus() {
    return this.status;
  }

  public getWord() {
    return this.word;
  }

  public getCurrentGuessCount() {
    return this.guessed.length;
  }
}

export { WordleGameException };
export type { GuessCheckBox, WordleGameStatus };
export { getRandomWord, checkValidWord };
export default WordleGame;
