/** Splits on any run of whitespace and ignores empty fragments. */
export function countWords(text: string): number {
  return text.split(/\s+/).filter((word) => word.length > 0).length;
}

/** Whole minutes, never zero — a one-line post still reads as "1 min read". */
export function readingMinutes(text: string, wordsPerMinute: number): number {
  return Math.max(1, Math.ceil(countWords(text) / wordsPerMinute));
}
