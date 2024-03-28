import { expect } from 'chai';
import { createSummaryProvider } from '../../src/ai';
import { LocalSummaryProvider } from '../../src/ai/localSummaryProvider';
import { config } from '../../src/config';

describe('summary provider registry', () => {
  it('defaults to the local provider', () => {
    expect(createSummaryProvider(config).name).to.equal('local');
  });

  it('falls back to local when anthropic is selected with no api key', () => {
    const provider = createSummaryProvider({
      ...config,
      summary: { provider: 'anthropic', anthropicModel: 'claude-opus-5' },
    });
    expect(provider.name).to.equal('local');
  });

  it('produces an excerpt within the requested budget', async () => {
    const provider = new LocalSummaryProvider();
    const excerpt = await provider.summarise({
      title: 'Anything',
      content: 'A sentence that is comfortably longer than the budget it is given here.',
      maxChars: 30,
    });
    expect(excerpt.length).to.be.at.most(30);
  });
});
