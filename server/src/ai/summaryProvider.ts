export interface SummaryRequest {
  readonly title: string;
  readonly content: string;
  readonly maxChars: number;
}

/**
 * The seam the excerpt feature is built on. Anything that can turn a post into
 * a short standfirst can be registered here — the service layer never learns
 * which one it got.
 */
export interface SummaryProvider {
  readonly name: string;
  summarise(request: SummaryRequest): Promise<string>;
}
