export namespace FnUtils {
  /**
   * Pauses the execution for a specified number of milliseconds.
   * @param ms The number of milliseconds to sleep.
   * @returns A Promise that resolves after the specified time.
   */
  export async function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Checks if a given value is a number or a string representation of a number.
   * It handles both numeric types and string types that can be parsed as numbers,
   * including negative numbers and decimals.
   * @param val The value to check.
   * @returns True if the value is a number or a string representing a number, false otherwise.
   */
  export function isNumber(val: any) {
    if (typeof val === "number" && !isNaN(val)) return true;
    if (typeof val === "string") {
      return /^-?\d+(\.\d+)?$/.test(val.trim());
    }
    return false;
  }

  /**
   * Parses a time string in colon-separated format (e.g., "3:20", "1:02:33", or "35") into milliseconds.
   * @param input The time string to parse.
   * @returns The time in milliseconds, or `null` if the input format is invalid.
   */
  export function parseColonTimeFormat(input: string): number | null {
    const parts = input.split(":").map(Number);

    if (parts.some(isNaN)) return null;
    // Convert time parts to milliseconds

    if (parts.length === 1) {
      return parts[0] * 1000;
    } else if (parts.length === 2) {
      const [min, sec] = parts;
      return (min * 60 + sec) * 1000;
    } else if (parts.length === 3) {
      const [hour, min, sec] = parts;
      return (hour * 3600 + min * 60 + sec) * 1000;
    } else {
      return null;
    }
  }

  /**
   *  * Generate a pseudo-random number based on a seed.
   *
   * This is a simple, fast, and deterministic pseudo-random number generator (PRNG)
   * based on the Mulberry32 algorithm. It's useful for scenarios where you need
   * reproducible random sequences given the same initial seed.
   *
   * @param seed The initial seed for the random number generator.
   * @returns A function that, when called, returns a pseudo-random number between 0 (inclusive) and 1 (exclusive).
   * @example
   * const seededRandom = randomSeed(123);
   * console.log(seededRandom()); // Will always output the same sequence for seed 123
   * console.log(seededRandom());
   */
  export function randomSeed(seed: number) {
    return function () {
      let t = (seed += 0x6d2b79f5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
}
