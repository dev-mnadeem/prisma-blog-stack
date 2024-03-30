const ELLIPSIS = '…';

/**
 * Deterministic extractive excerpt: keep whole sentences while they fit, and
 * fall back to a word-boundary truncation when the first sentence is already
 * longer than the budget. Used directly by the local summary provider and as
 * the fallback whenever a remote provider fails.
 */
export function extractExcerpt(content: string, maxChars: number): string {
  const normalised = content.replace(/\s+/g, ' ').trim();
  if (normalised.length <= maxChars) {
    return normalised;
  }

  const sentences = normalised.match(/[^.!?]+[.!?]*/g) ?? [];
  let excerpt = '';
  for (const sentence of sentences) {
    const candidate = (excerpt + sentence).trim();
    if (candidate.length > maxChars) {
      break;
    }
    excerpt = candidate;
  }

  if (excerpt.length > 0) {
    return excerpt;
  }

  const clipped = normalised.slice(0, maxChars);
  const lastSpace = clipped.lastIndexOf(' ');
  const body = lastSpace > 0 ? clipped.slice(0, lastSpace) : clipped;
  return `${body.trimEnd()}${ELLIPSIS}`;
}
