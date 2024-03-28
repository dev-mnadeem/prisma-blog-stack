import { AppConfig } from '../config';
import { AnthropicSummaryProvider } from './anthropicSummaryProvider';
import { LocalSummaryProvider } from './localSummaryProvider';
import { SummaryProvider } from './summaryProvider';

export { SummaryProvider, SummaryRequest } from './summaryProvider';
export { LocalSummaryProvider } from './localSummaryProvider';
export { AnthropicSummaryProvider } from './anthropicSummaryProvider';

type ProviderFactory = (config: AppConfig) => SummaryProvider;

/**
 * Strategy registry. Adding a provider means adding a key here and a class
 * next to the other two — nothing else in the codebase changes.
 */
const registry: Record<string, ProviderFactory> = {
  local: () => new LocalSummaryProvider(),
  anthropic: (config) => {
    const key = config.summary.anthropicApiKey;
    if (!key) {
      console.warn('[summary] SUMMARY_PROVIDER=anthropic but ANTHROPIC_API_KEY is unset — using local.');
      return new LocalSummaryProvider();
    }
    return new AnthropicSummaryProvider(key, config.summary.anthropicModel);
  },
};

export function createSummaryProvider(config: AppConfig): SummaryProvider {
  const factory = registry[config.summary.provider];
  if (!factory) {
    return new LocalSummaryProvider();
  }
  return factory(config);
}
