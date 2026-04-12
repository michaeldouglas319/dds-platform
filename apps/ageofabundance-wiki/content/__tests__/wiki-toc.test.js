import { describe, it, expect } from 'vitest';
import { slugifyHeading, buildTocEntries } from '../wiki-toc.js';

describe('slugifyHeading', () => {
  it('lowercases and hyphenates spaces', () => {
    expect(slugifyHeading('Origins of the term')).toBe('origins-of-the-term');
  });

  it('strips non-word characters', () => {
    expect(slugifyHeading("What's next?")).toBe('whats-next');
  });

  it('collapses multiple hyphens', () => {
    expect(slugifyHeading('A   B---C')).toBe('a-b-c');
  });

  it('trims leading/trailing hyphens', () => {
    expect(slugifyHeading(' -Hello- ')).toBe('hello');
  });

  it('handles empty string', () => {
    expect(slugifyHeading('')).toBe('');
  });

  it('handles whitespace-only string', () => {
    expect(slugifyHeading('   ')).toBe('');
  });

  it('preserves numbers', () => {
    expect(slugifyHeading('Step 3: Deploy')).toBe('step-3-deploy');
  });

  it('handles unicode dashes and underscores', () => {
    expect(slugifyHeading('open_protocols as infra')).toBe('open-protocols-as-infra');
  });
});

describe('buildTocEntries', () => {
  it('extracts entries from paragraphs with subtitles', () => {
    const paragraphs = [
      { subtitle: 'Origins of the term', description: 'text' },
      { subtitle: 'Core pillars', description: 'text' },
      { subtitle: 'Critiques and open questions', description: 'text' },
    ];
    const entries = buildTocEntries(paragraphs);
    expect(entries).toEqual([
      { id: 'origins-of-the-term', text: 'Origins of the term' },
      { id: 'core-pillars', text: 'Core pillars' },
      { id: 'critiques-and-open-questions', text: 'Critiques and open questions' },
    ]);
  });

  it('skips paragraphs without subtitle', () => {
    const paragraphs = [
      { subtitle: 'Section A', description: 'text' },
      { description: 'no subtitle here' },
      { subtitle: 'Section B', description: 'text' },
    ];
    const entries = buildTocEntries(paragraphs);
    expect(entries).toHaveLength(2);
    expect(entries[0].text).toBe('Section A');
    expect(entries[1].text).toBe('Section B');
  });

  it('skips null and undefined entries', () => {
    const paragraphs = [null, undefined, { subtitle: 'Valid' }];
    const entries = buildTocEntries(paragraphs);
    expect(entries).toHaveLength(1);
    expect(entries[0].text).toBe('Valid');
  });

  it('deduplicates heading IDs with numeric suffix', () => {
    const paragraphs = [
      { subtitle: 'Overview' },
      { subtitle: 'Overview' },
      { subtitle: 'Overview' },
    ];
    const entries = buildTocEntries(paragraphs);
    expect(entries).toEqual([
      { id: 'overview', text: 'Overview' },
      { id: 'overview-1', text: 'Overview' },
      { id: 'overview-2', text: 'Overview' },
    ]);
  });

  it('returns empty array for null/undefined input', () => {
    expect(buildTocEntries(null)).toEqual([]);
    expect(buildTocEntries(undefined)).toEqual([]);
  });

  it('returns empty array for empty paragraphs', () => {
    expect(buildTocEntries([])).toEqual([]);
  });

  it('trims whitespace from subtitle text', () => {
    const paragraphs = [{ subtitle: '  Spaced out  ' }];
    const entries = buildTocEntries(paragraphs);
    expect(entries[0].text).toBe('Spaced out');
    expect(entries[0].id).toBe('spaced-out');
  });

  it('skips empty or whitespace-only subtitles', () => {
    const paragraphs = [
      { subtitle: '' },
      { subtitle: '   ' },
      { subtitle: 'Valid heading' },
    ];
    const entries = buildTocEntries(paragraphs);
    expect(entries).toHaveLength(1);
    expect(entries[0].text).toBe('Valid heading');
  });
});
