import { describe, it, expect } from 'vitest';
import {
  slugify,
  titleCaseFromSlug,
  parseWikiLinks,
  collectLinksFromArticle,
  buildWikiGraph,
} from '../wiki-links.js';
import { articles } from '../articles.js';

describe('slugify', () => {
  it('lowercases and hyphenates words', () => {
    expect(slugify('Energy Abundance')).toBe('energy-abundance');
    expect(slugify('Coordination Abundance')).toBe('coordination-abundance');
  });

  it('is idempotent on an already-slugified string', () => {
    expect(slugify('energy-abundance')).toBe('energy-abundance');
  });

  it('strips combining diacritics via NFKD fold', () => {
    expect(slugify('Coördination')).toBe('coordination');
    expect(slugify('Café')).toBe('cafe');
  });

  it('collapses runs of punctuation to a single hyphen', () => {
    expect(slugify('Foo — Bar, Baz!')).toBe('foo-bar-baz');
  });

  it('returns empty string for non-strings and whitespace-only', () => {
    expect(slugify('')).toBe('');
    expect(slugify('   ')).toBe('');
    expect(slugify(null)).toBe('');
    expect(slugify(undefined)).toBe('');
    expect(slugify(42)).toBe('');
  });

  it('drops leading and trailing hyphens', () => {
    expect(slugify(' --foo-- ')).toBe('foo');
  });
});

describe('titleCaseFromSlug', () => {
  it('title-cases a kebab-case slug', () => {
    expect(titleCaseFromSlug('energy-abundance')).toBe('Energy Abundance');
    expect(titleCaseFromSlug('coordination-abundance')).toBe('Coordination Abundance');
  });

  it('handles single-word slugs', () => {
    expect(titleCaseFromSlug('energy')).toBe('Energy');
  });

  it('returns empty for empty / non-string input', () => {
    expect(titleCaseFromSlug('')).toBe('');
    expect(titleCaseFromSlug(null)).toBe('');
    expect(titleCaseFromSlug(undefined)).toBe('');
  });
});

describe('parseWikiLinks', () => {
  const known = new Set(['energy-abundance', 'coordination-abundance', 'age-of-abundance']);

  it('returns empty array for empty / non-string input', () => {
    expect(parseWikiLinks('', known)).toEqual([]);
    expect(parseWikiLinks(null, known)).toEqual([]);
    expect(parseWikiLinks(undefined, known)).toEqual([]);
  });

  it('returns a single text segment when there are no wiki-links', () => {
    const out = parseWikiLinks('plain text only', known);
    expect(out).toEqual([{ type: 'text', value: 'plain text only' }]);
  });

  it('parses [[Title Case]] into a resolved link', () => {
    const out = parseWikiLinks('See [[Energy Abundance]] for more.', known);
    expect(out).toHaveLength(3);
    expect(out[0]).toEqual({ type: 'text', value: 'See ' });
    expect(out[1]).toMatchObject({
      type: 'link',
      value: 'Energy Abundance',
      slug: 'energy-abundance',
      broken: false,
    });
    expect(out[2]).toEqual({ type: 'text', value: ' for more.' });
  });

  it('parses a slug-form [[energy-abundance]] and prettifies its label', () => {
    const out = parseWikiLinks('Read [[energy-abundance]].', known);
    expect(out[1]).toMatchObject({
      type: 'link',
      value: 'Energy Abundance',
      slug: 'energy-abundance',
      broken: false,
    });
  });

  it('honors MediaWiki pipe syntax [[target|display]]', () => {
    const out = parseWikiLinks('[[energy-abundance|cheap power]] reshapes it.', known);
    expect(out[0]).toMatchObject({
      type: 'link',
      value: 'cheap power',
      slug: 'energy-abundance',
      broken: false,
    });
  });

  it('flags unknown targets as broken', () => {
    const out = parseWikiLinks('The [[Compute Abundance]] pillar.', known);
    expect(out[1]).toMatchObject({
      type: 'link',
      value: 'Compute Abundance',
      slug: 'compute-abundance',
      broken: true,
    });
  });

  it('handles multiple wiki-links in one string', () => {
    const out = parseWikiLinks(
      '[[Energy Abundance]] and [[Coordination Abundance]] are pillars.',
      known,
    );
    const links = out.filter((s) => s.type === 'link');
    expect(links).toHaveLength(2);
    expect(links.map((l) => l.slug)).toEqual([
      'energy-abundance',
      'coordination-abundance',
    ]);
  });

  it('refuses to match across newlines (guards against runaway pattern)', () => {
    const text = 'open [[line\nbreak]] close';
    const out = parseWikiLinks(text, known);
    // No link produced; the entire input stays as a single text segment.
    expect(out.every((s) => s.type === 'text')).toBe(true);
    expect(out.map((s) => s.value).join('')).toBe(text);
  });

  it('accepts an array of known slugs as well as a Set', () => {
    const out = parseWikiLinks('[[Energy Abundance]]', [
      'energy-abundance',
      'age-of-abundance',
    ]);
    expect(out[0]).toMatchObject({ slug: 'energy-abundance', broken: false });
  });

  it('treats an empty target as broken', () => {
    const out = parseWikiLinks('[[|just alias]]', known);
    expect(out[0]).toMatchObject({
      type: 'link',
      value: 'just alias',
      broken: true,
    });
  });
});

describe('collectLinksFromArticle', () => {
  const known = new Set(['energy-abundance', 'coordination-abundance', 'age-of-abundance']);

  it('harvests links from body + paragraph descriptions', () => {
    const article = {
      id: 'x',
      content: {
        body: 'Intro mentions [[Energy Abundance]].',
        paragraphs: [
          { subtitle: 's', description: 'See also [[Coordination Abundance]].' },
          { description: 'Broken: [[Unknown Topic]]' },
        ],
      },
    };
    const links = collectLinksFromArticle(article, known);
    expect(links).toHaveLength(3);
    expect(links.map((l) => l.slug)).toEqual([
      'energy-abundance',
      'coordination-abundance',
      'unknown-topic',
    ]);
    expect(links[2].broken).toBe(true);
  });

  it('returns empty for malformed article shapes', () => {
    expect(collectLinksFromArticle(null, known)).toEqual([]);
    expect(collectLinksFromArticle({}, known)).toEqual([]);
    expect(collectLinksFromArticle({ content: {} }, known)).toEqual([]);
  });
});

describe('buildWikiGraph', () => {
  const sample = [
    {
      id: 'age-of-abundance',
      content: {
        body: 'Intro',
        paragraphs: [
          {
            description:
              '(1) [[Energy Abundance]], (2) [[Compute Abundance]], (3) [[Coordination Abundance]].',
          },
        ],
      },
    },
    {
      id: 'energy-abundance',
      content: {
        body: 'First pillar of the [[Age of Abundance]].',
        paragraphs: [],
      },
    },
    {
      id: 'coordination-abundance',
      content: {
        body: 'See [[Age of Abundance]] and [[Energy Abundance]].',
        paragraphs: [],
      },
    },
  ];

  it('produces forward edges per article in source order', () => {
    const g = buildWikiGraph(sample);
    expect(g.forward['age-of-abundance']).toEqual([
      'energy-abundance',
      'coordination-abundance',
    ]);
    expect(g.forward['energy-abundance']).toEqual(['age-of-abundance']);
    expect(g.forward['coordination-abundance']).toEqual([
      'age-of-abundance',
      'energy-abundance',
    ]);
  });

  it('inverts the forward graph into backlinks', () => {
    const g = buildWikiGraph(sample);
    expect(g.backlinks['energy-abundance']).toEqual([
      'age-of-abundance',
      'coordination-abundance',
    ]);
    expect(g.backlinks['coordination-abundance']).toEqual(['age-of-abundance']);
    expect(g.backlinks['age-of-abundance']).toEqual([
      'coordination-abundance',
      'energy-abundance',
    ]);
  });

  it('records broken links tagged with their source article', () => {
    const g = buildWikiGraph(sample);
    expect(g.broken).toEqual(
      expect.arrayContaining([
        { from: 'age-of-abundance', raw: 'Compute Abundance' },
      ]),
    );
    expect(g.broken).toHaveLength(1);
  });

  it('drops self-links from forward + backlinks', () => {
    const selfLinker = [
      {
        id: 'foo',
        content: {
          body: 'Talking about [[Foo]] itself.',
          paragraphs: [],
        },
      },
    ];
    const g = buildWikiGraph(selfLinker);
    expect(g.forward.foo).toEqual([]);
    expect(g.backlinks.foo).toBeUndefined();
  });

  it('deduplicates repeated forward edges', () => {
    const dup = [
      {
        id: 'a',
        content: {
          body: '[[B]] and [[B]] again.',
          paragraphs: [{ description: '[[B]]' }],
        },
      },
      { id: 'b', content: { body: '', paragraphs: [] } },
    ];
    const g = buildWikiGraph(dup);
    expect(g.forward.a).toEqual(['b']);
  });

  it('returns empty structures for non-array input', () => {
    expect(buildWikiGraph(null)).toEqual({ forward: {}, backlinks: {}, broken: [] });
    expect(buildWikiGraph(undefined)).toEqual({ forward: {}, backlinks: {}, broken: [] });
  });

  it('works on the live seed dataset without crashing and finds real cross-links', () => {
    const g = buildWikiGraph(articles);
    // Every seed article id should appear as a key in forward.
    for (const a of articles) {
      expect(g.forward).toHaveProperty(a.id);
    }
    // Energy Abundance is referenced from age-of-abundance and coordination-abundance.
    expect(g.backlinks['energy-abundance']).toContain('age-of-abundance');
    expect(g.backlinks['energy-abundance']).toContain('coordination-abundance');
    // Age of Abundance is referenced from the pillar articles.
    expect(g.backlinks['age-of-abundance']).toContain('energy-abundance');
    expect(g.backlinks['age-of-abundance']).toContain('coordination-abundance');
    // Coordination Abundance is referenced from the hub article.
    expect(g.backlinks['coordination-abundance']).toContain('age-of-abundance');
    // At least one broken link is seeded (Compute Abundance / Atoms Abundance)
    // so the broken-link visual state is exercised in production.
    expect(g.broken.length).toBeGreaterThan(0);
  });
});
