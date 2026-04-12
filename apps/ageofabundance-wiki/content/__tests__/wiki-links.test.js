import { describe, it, expect } from 'vitest';
import {
  slugify,
  parseWikiText,
  extractAllWikiLinks,
  buildSlugSet,
} from '../wiki-links.js';

/* ------------------------------------------------------------------ */
/* slugify                                                             */
/* ------------------------------------------------------------------ */
describe('slugify', () => {
  it('lowercases and replaces spaces with hyphens', () => {
    expect(slugify('Age of Abundance')).toBe('age-of-abundance');
  });

  it('strips non-word characters', () => {
    expect(slugify('Energy & Compute')).toBe('energy--compute'.replace(/--/g, '-'));
    // "Energy & Compute" → strip & → "Energy  Compute" → "energy--compute" → collapse → "energy-compute"
    expect(slugify('Energy & Compute')).toBe('energy-compute');
  });

  it('collapses multiple hyphens', () => {
    expect(slugify('hello---world')).toBe('hello-world');
  });

  it('trims leading/trailing hyphens', () => {
    expect(slugify('-hello-')).toBe('hello');
  });

  it('handles already-slugified input', () => {
    expect(slugify('energy-abundance')).toBe('energy-abundance');
  });

  it('handles empty / whitespace', () => {
    expect(slugify('')).toBe('');
    expect(slugify('   ')).toBe('');
  });
});

/* ------------------------------------------------------------------ */
/* parseWikiText                                                       */
/* ------------------------------------------------------------------ */
describe('parseWikiText', () => {
  const knownSlugs = new Set(['age-of-abundance', 'energy-abundance']);

  it('returns a single text segment for plain text', () => {
    const result = parseWikiText('No links here.', knownSlugs);
    expect(result).toEqual([{ type: 'text', value: 'No links here.' }]);
  });

  it('parses [[Page Name]] → slugified link', () => {
    const result = parseWikiText('See [[Age of Abundance]] for details.', knownSlugs);
    expect(result).toEqual([
      { type: 'text', value: 'See ' },
      { type: 'wikilink', slug: 'age-of-abundance', display: 'Age of Abundance', exists: true },
      { type: 'text', value: ' for details.' },
    ]);
  });

  it('parses [[slug|Display Text]] with explicit slug', () => {
    const result = parseWikiText('Read about [[energy-abundance|cheap energy]].', knownSlugs);
    expect(result).toEqual([
      { type: 'text', value: 'Read about ' },
      { type: 'wikilink', slug: 'energy-abundance', display: 'cheap energy', exists: true },
      { type: 'text', value: '.' },
    ]);
  });

  it('marks non-existent slugs as broken (exists: false)', () => {
    const result = parseWikiText('See [[Nonexistent Page]].', knownSlugs);
    expect(result).toEqual([
      { type: 'text', value: 'See ' },
      { type: 'wikilink', slug: 'nonexistent-page', display: 'Nonexistent Page', exists: false },
      { type: 'text', value: '.' },
    ]);
  });

  it('handles multiple wiki-links in one string', () => {
    const text = '[[Age of Abundance]] builds on [[Energy Abundance]].';
    const result = parseWikiText(text, knownSlugs);
    // wikilink, text, wikilink, text → 4 segments
    expect(result).toHaveLength(4);
    expect(result[0]).toMatchObject({ type: 'wikilink', slug: 'age-of-abundance' });
    expect(result[1]).toEqual({ type: 'text', value: ' builds on ' });
    expect(result[2]).toMatchObject({ type: 'wikilink', slug: 'energy-abundance' });
    expect(result[3]).toEqual({ type: 'text', value: '.' });
  });

  it('handles wiki-link at start of string (no leading text)', () => {
    const result = parseWikiText('[[Age of Abundance]] is key.', knownSlugs);
    expect(result[0]).toEqual({
      type: 'wikilink',
      slug: 'age-of-abundance',
      display: 'Age of Abundance',
      exists: true,
    });
    expect(result[1]).toEqual({ type: 'text', value: ' is key.' });
  });

  it('handles wiki-link at end of string (no trailing text)', () => {
    const result = parseWikiText('See [[Age of Abundance]]', knownSlugs);
    expect(result).toHaveLength(2);
    expect(result[1].type).toBe('wikilink');
  });

  it('handles empty/null input gracefully', () => {
    expect(parseWikiText('', knownSlugs)).toEqual([{ type: 'text', value: '' }]);
    expect(parseWikiText(null, knownSlugs)).toEqual([{ type: 'text', value: '' }]);
    expect(parseWikiText(undefined, knownSlugs)).toEqual([{ type: 'text', value: '' }]);
  });

  it('trims whitespace inside brackets', () => {
    const result = parseWikiText('[[ Age of Abundance ]]', knownSlugs);
    expect(result[0]).toMatchObject({
      type: 'wikilink',
      slug: 'age-of-abundance',
      display: 'Age of Abundance',
    });
  });

  it('handles pipe with whitespace', () => {
    const result = parseWikiText('[[ energy-abundance | cheap energy ]]', knownSlugs);
    expect(result[0]).toMatchObject({
      type: 'wikilink',
      slug: 'energy-abundance',
      display: 'cheap energy',
    });
  });

  it('slugifies the left side of pipe when it contains spaces', () => {
    const result = parseWikiText('[[Energy Abundance|energy]]', knownSlugs);
    expect(result[0]).toMatchObject({
      type: 'wikilink',
      slug: 'energy-abundance',
      display: 'energy',
      exists: true,
    });
  });
});

/* ------------------------------------------------------------------ */
/* extractAllWikiLinks                                                 */
/* ------------------------------------------------------------------ */
describe('extractAllWikiLinks', () => {
  it('extracts links from body and paragraphs', () => {
    const articles = [
      {
        id: 'test-article',
        content: {
          body: 'See [[Age of Abundance]].',
          paragraphs: [
            { subtitle: 'Section', description: 'Also [[energy-abundance|energy]].' },
          ],
        },
      },
    ];

    const links = extractAllWikiLinks(articles);
    expect(links).toHaveLength(2);
    expect(links[0]).toMatchObject({ slug: 'age-of-abundance', sourceArticleId: 'test-article' });
    expect(links[1]).toMatchObject({ slug: 'energy-abundance', sourceArticleId: 'test-article' });
  });

  it('returns empty array for articles without wiki-links', () => {
    const articles = [{ id: 'plain', content: { body: 'No links.' } }];
    expect(extractAllWikiLinks(articles)).toEqual([]);
  });

  it('handles articles without content gracefully', () => {
    const articles = [{ id: 'empty' }];
    expect(extractAllWikiLinks(articles)).toEqual([]);
  });
});

/* ------------------------------------------------------------------ */
/* buildSlugSet                                                        */
/* ------------------------------------------------------------------ */
describe('buildSlugSet', () => {
  it('builds a Set of article ids', () => {
    const articles = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
    const set = buildSlugSet(articles);
    expect(set).toBeInstanceOf(Set);
    expect(set.size).toBe(3);
    expect(set.has('a')).toBe(true);
    expect(set.has('d')).toBe(false);
  });
});
