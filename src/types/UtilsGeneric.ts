type Enumerate<
  N extends number,
  Acc extends number[] = []
> = Acc["length"] extends N
  ? Acc[number]
  : Enumerate<N, [...Acc, Acc["length"]]>;

/**
 *  * Creates a union type of numbers within a specified range (inclusive).
 *
 * @template F - The lower bound of the range (inclusive).
 * @template T - The upper bound of the range (inclusive).
 * @example
 * type MyRange = IntRange<1, 5>; // MyRange will be 1 | 2 | 3 | 4 | 5
 */
export type IntRange<F extends number, T extends number> =
  | Exclude<Enumerate<T>, Enumerate<F>>
  | T;
