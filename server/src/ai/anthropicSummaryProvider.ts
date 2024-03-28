import Anthropic from '@anthropic-ai/sdk';
import { extractExcerpt } from '../domain/excerpt';
import { SummaryProvider, SummaryRequest } from './summaryProvider';

const MAX_TOKENS = 300;

const SYSTEM_PROMPT = [
  'You write the standfirst that sits under a blog post title in a list view.',
  'Reply with one sentence of plain prose and nothing else.',
  'No quotation marks, no markdown, no preamble.',
].join(' ');

/**
 * Writes an abstractive excerpt with Claude. Any failure — no key, rate limit,
 * network, an empty reply — degrades to the deterministic extractive excerpt
 * rather than failing the write that triggered it.
 */
export class AnthropicSummaryProvider implements SummaryProvider {
  readonly name = 'anthropic';

  private readonly client: Anthropic;

  constructor(
    apiKey: string,
    private readonly model: string
  ) {
    this.client = new Anthropic({ apiKey });
  }

  async summarise({ title, content, maxChars }: SummaryRequest): Promise<string> {
    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: MAX_TOKENS,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: `Title: ${title}\n\nPost:\n${content}\n\nSummarise it in at most ${maxChars} characters.`,
          },
        ],
      });

      const parts: string[] = [];
      for (const block of response.content) {
        if (block.type === 'text') {
          parts.push(block.text);
        }
      }
      const text = parts.join(' ').trim();

      if (text.length === 0) {
        return extractExcerpt(content, maxChars);
      }
      return text.length > maxChars ? extractExcerpt(text, maxChars) : text;
    } catch (error) {
      console.warn('[summary] Anthropic provider failed, using extractive excerpt:', error);
      return extractExcerpt(content, maxChars);
    }
  }
}
