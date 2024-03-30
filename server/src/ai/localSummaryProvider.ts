import { extractExcerpt } from '../domain/excerpt';
import { SummaryProvider, SummaryRequest } from './summaryProvider';

/**
 * Offline default. No network, no key, same answer every time — which is also
 * what makes it usable as the fallback for every other provider.
 */
export class LocalSummaryProvider implements SummaryProvider {
  readonly name = 'local';

  async summarise({ content, maxChars }: SummaryRequest): Promise<string> {
    return extractExcerpt(content, maxChars);
  }
}
