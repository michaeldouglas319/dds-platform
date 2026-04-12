import { describe, it, expect } from 'vitest';
import {
  slugify,
  parseWikiLinks,
  resolveWikiLink,
  extractLinksFromArticle,
  buildLinkGraph,
  invertLinkGraph,
} from '../wiki-links.js';

/* ─── slugify ──────────────────────────────────────────────────── */

describe('slugify', () => {
  it('lowercases and replaces spaces with hyphens', () => {
    expect(slugify('Energy Abundance')).toBe('energy-abundance');
  });

  it('strips non-alphanumeric characters', () => {
    expect(slugify("It's a Test!")).toBe('its-a-test');
  });

  it('collapses multiple hyphens', () => {
    expect(slugify('foo  --  bar')).toBe('foo-bar');
  });

  it('trims leading/trailing hyphens', () => {
    expect(slugify(' -hello- ')).toBe('hello');
  });

  it('returns empty string for empty input', () => {
    expect(slugify('')).toBe('');
    expect(slugify('   ')).toBe('');
  });

  it('preserves numbers', () => {
    expect(slugify('Web 3.0 Protocols')).toBe('web-30-protocols');
  });
});

/* ─── parseWikiLinks ───────────────────────────────────────────── */

describe('parseWikiLinks', () => {
  it('returns single text segment for plain text', () => {
    const result = parseWikiLinks('No links here.');
    expect(result).toEqual([{ type: 'text', value: 'No links here.' }]);
  });

  it('parses a basic [[Target]] link', () => {
    const result = parseWikiLinks('See [[Energy Abundance]] for details.');
    expect(result).toEqual([
      { type: 'text', value: 'See ' },
      { type: 'wikilink', target: 'Energy Abundance', display: 'Energy Abundance' },
      { type: 'text', value: ' for details.' },
    ]);
  });

  it('parses [[target|Display Text]] syntax', () => {
    const result = parseWikiLinks('The [[energy-abundance|energy pillar]] matters.');
    expect(result).toEqual([
      { type: 'text', value: 'The ' },
      { type: 'wikilink', target: 'energy-abundance', display: 'energy pillar' },
      { type: 'text', value: ' matters.' },
    ]);
  });

  it('handles multiple wiki-links in one string', () => {
    const result = parseWikiLinks('Both [[Energy Abundance]] and [[Coordination Abundance]] are pillars.');
    expect(result).toHaveLength(5);
    expect(result[1]).toEqual({ type: 'wikilink', target: 'Energy Abundance', display: 'Energy Abundance' });
    expect(result[3]).toEqual({ type: 'wikilink', target: 'Coordination Abundance', display: 'Coordination Abundance' });
  });

  it('handles adjacent wiki-links', () => {
    const result = parseWikiLinks('[[A]][[B]]');
    expect(result).toEqual([
      { type: 'wikilink', target: 'A', display: 'A' },
      { type: 'wikilink', target: 'B', display: 'B' },
    ]);
  });

  it('trims whitespace from target and display', () => {
    const result = parseWikiLinks('See [[ Energy Abundance | the energy page ]].');
    expect(result[1]).toEqual({
      type: 'wikilink',
      target: 'Energy Abundance',
      display: 'the energy page',
    });
  });

  it('handles wiki-link at start of string', () => {
    const result = parseWikiLinks('[[Energy Abundance]] is key.');
    expect(result[0]).toEqual({ type: 'wikilink', target: 'Energy Abundance', display: 'Energy Abundance' });
    expect(result[1]).toEqual({ type: 'text', value: ' is key.' });
  });

  it('handles wiki-link at end of string', () => {
    const result = parseWikiLinks('See [[Energy Abundance]]');
    expect(result[0]).toEqual({ type: 'text', value: 'See ' });
    expect(result[1]).toEqual({ type: 'wikilink', target: 'Energy Abundance', display: 'Energy Abundance' });
  });

  it('returns text segment for null/undefined input', () => {
    expect(parseWikiLinks(null)).toEqual([{ type: 'text', value: '' }]);
    expect(parseWikiLinks(undefined)).toEqual([{ type: 'text', value: '' }]);
  });

  it('returns text segment for empty string', () => {
    expect(parseWikiLinks('')).toEqual([{ type: 'text', value: '' }]);
  });

  it('does not match single brackets', () => {
    const result = parseWikiLinks('This [is not] a link.');
    expect(result).toEqual([{ type: 'text', value: 'This [is not] a link.' }]);
  });

  it('does not match unclosed double brackets', () => {
    const result = parseWikiLinks('This [[is not a link.');
    expect(result).toEqual([{ type: 'text', value: 'This [[is not a link.' }]);
  });
});

/* ─── resolveWikiLink ──────────────────────────────────────────── */

describe('resolveWikiLink', () => {
  const slugs = ['age-of-abundance', 'energy-abundance', 'coordination-abundance'];

  it('resolves exact slug match', () => {
    expect(resolveWikiLink('energy-abundance', slugs)).toEqual({
      slug: 'energy-abundance',
      exists: true,
    });
  });

  it('resolves via slugification', () => {
    expect(resolveWikiLink('Energy Abundance', slugs)).toEqual({
      slug: 'energy-abundance',
      exists: true,
    });
  });

  it('returns exists: false for unknown target', () => {
    const result = resolveWikiLink('Compute Abundance', slugs);
    expect(result).toEqual({
      slug: 'compute-abundance',
      exists: false,
    });
  });

  it('handles case insensitivity via slugify', () => {
    expect(resolveWikiLink('AGE OF ABUNDANCE', slugs)).toEqual({
      slug: 'age-of-abundance',
      exists: true,
    });
  });

  it('handles target that is already a slug', () => {
    expect(resolveWikiLink('age-of-abundance', slugs)).toEqual({
      slug: 'age-of-abundance',
      exists: true,
    });
  });
});

/* ─── extractLinksFromArticle ──────────────────────────────────── */

describe('extractLinksFromArticle', () => {
  it('extracts links from body and paragraphs', () => {
    const article = {
      content: {
        body: 'See [[Energy Abundance]] and [[Compute Abundance]].',
        paragraphs: [
          { description: 'Related to [[Age of Abundance]].' },
          { description: 'No links here.' },
        ],
      },
    };
    const links = extractLinksFromArticle(article);
    expect(links).toEqual([
      { target: 'Energy Abundance', display: 'Energy Abundance' },
      { target: 'Compute Abundance', display: 'Compute Abundance' },
      { target: 'Age of Abundance', display: 'Age of Abundance' },
    ]);
  });

  it('handles article with no content', () => {
    expect(extractLinksFromArticle({})).toEqual([]);
    expect(extractLinksFromArticle({ content: {} })).toEqual([]);
  });

  it('handles article with no wiki-links', () => {
    const article = { content: { body: 'Plain text only.' } };
    expect(extractLinksFromArticle(article)).toEqual([]);
  });

  it('extracts piped display text', () => {
    const article = {
      content: {
        body: 'The [[energy-abundance|energy pillar]] is key.',
        paragraphs: [],
      },
    };
    const links = extractLinksFromArticle(article);
    expect(links).toEqual([
      { target: 'energy-abundance', display: 'energy pillar' },
    ]);
  });
});

/* ─── buildLinkGraph + invertLinkGraph ─────────────────────────── */

describe('link graph', () => {
  const articles = [
    {
      id: 'a',
      content: {
        body: 'Links to [[b]] and [[c]].',
        paragraphs: [],
      },
    },
    {
      id: 'b',
      content: {
        body: 'Links back to [[a]].',
        paragraphs: [],
      },
    },
    {
      id: 'c',
      content: {
        body: 'No outbound links.',
        paragraphs: [],
      },
    },
  ];
  const slugs = ['a', 'b', 'c'];

  it('buildLinkGraph returns forward edges', () => {
    const graph = buildLinkGraph(articles, slugs);
    expect(graph.get('a')).toEqual([
      { slug: 'b', exists: true },
      { slug: 'c', exists: true },
    ]);
    expect(graph.get('b')).toEqual([{ slug: 'a', exists: true }]);
    expect(graph.get('c')).toEqual([]);
  });

  it('invertLinkGraph returns backlinks', () => {
    const forward = buildLinkGraph(articles, slugs);
    const backlinks = invertLinkGraph(forward);
    expect(backlinks.get('a')).toEqual(['b']); // b links to a
    expect(backlinks.get('b')).toEqual(['a']); // a links to b
    expect(backlinks.get('c')).toEqual(['a']); // a links to c
  });

  it('broken links are excluded from backlinks', () => {
    const articlesWithBroken = [
      {
        id: 'x',
        content: { body: 'Links to [[nonexistent]].', paragraphs: [] },
      },
    ];
    const forward = buildLinkGraph(articlesWithBroken, ['x']);
    const backlinks = invertLinkGraph(forward);
    expect(backlinks.has('nonexistent')).toBe(false);
  });
});
