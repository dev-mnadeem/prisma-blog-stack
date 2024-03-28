import { describe, expect, it } from 'vitest';
import { formatDate, formatReadingTime } from '../formatting';

describe('formatting', () => {
  it('renders an ISO date as a readable day', () => {
    expect(formatDate('2024-04-01T09:00:00.000Z')).toBe('1 April 2024');
  });

  it('labels reading time', () => {
    expect(formatReadingTime(1)).toBe('1 min read');
    expect(formatReadingTime(7)).toBe('7 min read');
  });
});
