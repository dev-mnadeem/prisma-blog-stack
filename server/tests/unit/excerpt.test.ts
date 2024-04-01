import { expect } from 'chai';
import { extractExcerpt } from '../../src/domain/excerpt';
import { countWords, readingMinutes } from '../../src/domain/reading';

describe('extractExcerpt', () => {
  it('returns the whole text when it already fits', () => {
    expect(extractExcerpt('Short enough.', 180)).to.equal('Short enough.');
  });

  it('collapses runs of whitespace', () => {
    expect(extractExcerpt('two   lines\n\nof  text', 180)).to.equal('two lines of text');
  });

  it('keeps whole sentences while they fit', () => {
    const text = 'First sentence here. Second sentence here. Third sentence here.';
    expect(extractExcerpt(text, 45)).to.equal('First sentence here. Second sentence here.');
  });

  it('falls back to a word boundary when the first sentence is too long', () => {
    const excerpt = extractExcerpt('alpha beta gamma delta epsilon zeta eta theta', 20);
    expect(excerpt).to.equal('alpha beta gamma…');
    expect(excerpt.length).to.be.at.most(20);
  });

  it('is deterministic', () => {
    const text = 'One. Two. Three. Four. Five. Six. Seven. Eight. Nine. Ten.';
    expect(extractExcerpt(text, 30)).to.equal(extractExcerpt(text, 30));
  });
});

describe('reading time', () => {
  it('counts words across any whitespace', () => {
    expect(countWords(' one  two\nthree\tfour ')).to.equal(4);
  });

  it('never reports less than a minute', () => {
    expect(readingMinutes('hello', 200)).to.equal(1);
  });

  it('rounds partial minutes up', () => {
    const text = Array.from({ length: 201 }, () => 'word').join(' ');
    expect(readingMinutes(text, 200)).to.equal(2);
  });
});
