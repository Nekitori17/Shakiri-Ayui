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
export default (seed: number) => {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};