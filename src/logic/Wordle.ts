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

// List of all valid 5-letter words
const validWordList = fs
  .readFileSync(path.join(__dirname, "../../assets/5-char-valid.txt"), "utf-8")
  .trim()
  .split("\n");

/**
 * Checks if a given word is a valid 5-letter word.
 * @param word The word to check.
 * @returns True if the word is valid, false otherwise.
 */
function checkValidWord(word: string) {
  return validWordList.includes(word.toLowerCase());
}

/**
 * Generates a random 5-letter word.
 * @returns A random 5-letter word.
 */
function getRandomWord() {
  // Path to the word list file
  const wordleFilePath = path.join(
    __dirname,
    "../../assets/wordle-word-list.txt"
  );

  // Read the word list file
  const wordleFileContent = fs.readFileSync(wordleFilePath, "utf-8");
  const wordleList = wordleFileContent.trim().split("\n");

  // Select a random word from the list
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

/**
 * Represents the status of the Wordle game.
 * - "playing": The game is currently in progress.
 * - "won": The player has guessed the word correctly.
 * - "lost": The player has run out of guesses.
 */
type WordleGameStatus = "playing" | "won" | "lost";

/**
 * Represents a Wordle game instance.
 */
class WordleGame {
  /**
   * The date and time when the game instance was created.
   */
  public date: Date;

  /**
   * The secret word for the game.
   */
  public word: string;

  /**
   * The game board, represented as a 2D array of `GuessCheckBox` values.
   */
  public board: GuessCheckBox[][];

  /**
   * The list of words already guessed by the player.
   */
  public guessed: string[];

  /**
   * The maximum number of guesses allowed for the game.
   */
  public maxGuesses: number;

  /**
   * The list of characters that are not in the word.
   */
  public wrongChars: string[];

  /**
   * The current status of the game.
   */
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

  /**
   * Performs a guess in the Wordle game.
   * @param guessInput The word to guess.
   * @returns An array of `GuessCheckBox` representing the result of the guess.
   * @throws {WordleGameException} If the guess is invalid or the game is over.
   */
  public guess(guessInput: string) {
    // Check if the game is already over
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

    // Add the guess to the list of guessed words
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

    // Update game status
    if (guess === this.word) {
      this.status = "won";
    } else if (this.guessed.length >= this.maxGuesses) {
      this.status = "lost";
    }

    return result;
  }
  /**
   * Gets the current state of the game board.
   * @returns The game board as a 2D array of `GuessCheckBox` values.
   */
  public getBoard() {
    return this.board;
  }

  /**
   *    Gets the list of words already guessed by the player.
   * @returns An array of guessed words.
   */
  public getGuesses() {
    return this.guessed;
  }

  /**
   * Gets the list of characters that are not in the word.
   * @returns An array of wrong characters.
   */
  public getWrongChars() {
    return this.wrongChars;
  }

  /**
   * Gets the current status of the game.
   * @returns The current status of the game.
   */
  public getStatus() {
    return this.status;
  }

  /**
   * Gets the secret word of the game.
   * @returns The secret word.
   */
  public getWord() {
    return this.word;
  }

  /**
   * Gets the number of guesses already made.
   * @returns The current guess count.
   */
  public getCurrentGuessCount() {
    return this.guessed.length;
  }
}

export { WordleGameException };
export type { GuessCheckBox, WordleGameStatus };
export { getRandomWord, checkValidWord };
export default WordleGame;
