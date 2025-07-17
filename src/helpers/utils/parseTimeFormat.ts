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