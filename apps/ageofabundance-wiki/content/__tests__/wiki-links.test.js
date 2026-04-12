import { describe, it, expect } from 'vitest';
import {
  titleToSlug,
  parseWikiLinks,
  hasWikiLinks,
  findBrokenLinks,
} from '../wiki-links.js';

// ── titleToSlug ──────────────────────────────────────────────────

describe('titleToSlug', () => {
  it('converts a title to kebab-case', () => {
    expect(titleToSlug('Energy Abundance')).toBe('energy-abundance');
  });

  it('collapses multiple spaces and underscores', () => {
    expect(titleToSlug('some_thing  weird')).toBe('some-thing-weird');
  });

  it('strips diacritics', () => {
    expect(titleToSlug('Énergie Abondancé')).toBe('energie-abondance');
  });

  it('trims whitespace', () => {
    expect(titleToSlug('  foo bar  ')).toBe('foo-bar');
  });

  it('drops non-word characters', () => {
    expect(titleToSlug("it's a test!")).toBe('its-a-test');
  });

  it('returns empty string for empty input', () => {
    expect(titleToSlug('')).toBe('');
  });

  it('passes through already-slugified input unchanged', () => {
    expect(titleToSlug('age-of-abundance')).toBe('age-of-abundance');
  });
});

// ── parseWikiLinks ───────────────────────────────────────────────

describe('parseWikiLinks', () => {
  const known = new Set(['energy-abundance', 'age-of-abundance']);

  it('returns a single text segment when no wiki-links are present', () => {
    const result = parseWikiLinks('plain text', known);
    expect(result).toEqual([{ type: 'text', value: 'plain text' }]);
  });

  it('returns empty array for empty string', () => {
    expect(parseWikiLinks('', known)).toEqual([]);
  });

  it('returns empty array for null/undefined', () => {
    expect(parseWikiLinks(null, known)).toEqual([]);
    expect(parseWikiLinks(undefined, known)).toEqual([]);
  });

  it('parses [[Title]] syntax into a wiki-link segment', () => {
    const result = parseWikiLinks('see [[Energy Abundance]] here', known);
    expect(result).toEqual([
      { type: 'text', value: 'see ' },
      {
        type: 'wiki-link',
        slug: 'energy-abundance',
        display: 'Energy Abundance',
        exists: true,
        href: '/a/energy-abundance',
      },
      { type: 'text', value: ' here' },
    ]);
  });

  it('parses [[slug|Display Text]] syntax with pipe', () => {
    const result = parseWikiLinks('[[energy-abundance|cheap energy]]', known);
    expect(result).toEqual([
      {
        type: 'wiki-link',
        slug: 'energy-abundance',
        display: 'cheap energy',
        exists: true,
        href: '/a/energy-abundance',
      },
    ]);
  });

  it('only splits on the first pipe', () => {
    const result = parseWikiLinks('[[energy-abundance|a|b]]', known);
    expect(result[0].display).toBe('a|b');
  });

  it('marks broken links as exists: false', () => {
    const result = parseWikiLinks('[[Nonexistent Page]]', known);
    expect(result).toEqual([
      {
        type: 'wiki-link',
        slug: 'nonexistent-page',
        display: 'Nonexistent Page',
        exists: false,
        href: '/a/nonexistent-page',
      },
    ]);
  });

  it('handles multiple wiki-links in a single string', () => {
    const result = parseWikiLinks(
      'See [[Energy Abundance]] and [[Age of Abundance]].',
      known,
    );
    expect(result).toHaveLength(5);
    expect(result[0]).toEqual({ type: 'text', value: 'See ' });
    expect(result[1].type).toBe('wiki-link');
    expect(result[1].slug).toBe('energy-abundance');
    expect(result[2]).toEqual({ type: 'text', value: ' and ' });
    expect(result[3].type).toBe('wiki-link');
    expect(result[3].slug).toBe('age-of-abundance');
    expect(result[4]).toEqual({ type: 'text', value: '.' });
  });

  it('treats empty brackets [[]] as literal text', () => {
    const result = parseWikiLinks('empty [[]] brackets', known);
    // The regex won't match [[]] because [^\]]+ requires at least one char
    expect(result).toEqual([{ type: 'text', value: 'empty [[]] brackets' }]);
  });

  it('treats [[|display]] (empty slug) as literal text', () => {
    const result = parseWikiLinks('bad [[|display]] link', known);
    expect(result).toEqual([
      { type: 'text', value: 'bad ' },
      { type: 'text', value: '[[|display]]' },
      { type: 'text', value: ' link' },
    ]);
  });

  it('handles wiki-link at start and end of string', () => {
    const result = parseWikiLinks('[[Energy Abundance]]', known);
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('wiki-link');
  });

  it('handles adjacent wiki-links', () => {
    const result = parseWikiLinks('[[Energy Abundance]][[Age of Abundance]]', known);
    expect(result).toHaveLength(2);
    expect(result[0].slug).toBe('energy-abundance');
    expect(result[1].slug).toBe('age-of-abundance');
  });
});

// ── hasWikiLinks ─────────────────────────────────────────────────

describe('hasWikiLinks', () => {
  it('returns true for strings containing [[…]]', () => {
    expect(hasWikiLinks('see [[Energy Abundance]]')).toBe(true);
  });

  it('returns false for plain text', () => {
    expect(hasWikiLinks('no links here')).toBe(false);
  });

  it('returns false for empty or null input', () => {
    expect(hasWikiLinks('')).toBe(false);
    expect(hasWikiLinks(null)).toBe(false);
  });
});

// ── findBrokenLinks ─────────────────────────────────────────────

describe('findBrokenLinks', () => {
  const known = new Set(['energy-abundance']);

  it('returns only unresolved links', () => {
    const broken = findBrokenLinks(
      '[[Energy Abundance]] and [[Missing Page]]',
      known,
    );
    expect(broken).toEqual([
      { slug: 'missing-page', display: 'Missing Page' },
    ]);
  });

  it('returns empty array when all links resolve', () => {
    expect(findBrokenLinks('[[Energy Abundance]]', known)).toEqual([]);
  });

  it('returns empty array for text without wiki-links', () => {
    expect(findBrokenLinks('just text', known)).toEqual([]);
  });
});
