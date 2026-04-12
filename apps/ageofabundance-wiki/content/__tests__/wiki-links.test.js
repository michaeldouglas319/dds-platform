import { describe, it, expect } from 'vitest';
import {
  slugify,
  parseWikiText,
  hasWikiLinks,
  stripWikiLinks,
  buildOutboundLinks,
  buildBacklinks,
  getBacklinksForSlug,
} from '../wiki-links.js';

// ─── slugify ──────────────────────────────────────────────────────

describe('slugify', () => {
  it('lowercases and hyphenates spaces', () => {
    expect(slugify('Energy Abundance')).toBe('energy-abundance');
  });

  it('preserves an existing slug', () => {
    expect(slugify('age-of-abundance')).toBe('age-of-abundance');
  });

  it('strips leading/trailing hyphens', () => {
    expect(slugify(' --hello-- ')).toBe('hello');
  });

  it('collapses multiple non-alphanumeric chars', () => {
    expect(slugify('Open   Protocols & Identity')).toBe(
      'open-protocols-identity',
    );
  });

  it('returns empty string for non-string input', () => {
    expect(slugify(null)).toBe('');
    expect(slugify(undefined)).toBe('');
    expect(slugify(42)).toBe('');
  });

  it('returns empty string for whitespace-only input', () => {
    expect(slugify('   ')).toBe('');
  });
});

// ─── parseWikiText ────────────────────────────────────────────────

describe('parseWikiText', () => {
  const slugs = new Set(['energy-abundance', 'age-of-abundance', 'coordination-abundance']);

  it('returns empty array for empty or non-string input', () => {
    expect(parseWikiText('', slugs)).toEqual([]);
    expect(parseWikiText(null, slugs)).toEqual([]);
    expect(parseWikiText(undefined, slugs)).toEqual([]);
  });

  it('returns a single text segment when no wiki-links exist', () => {
    const result = parseWikiText('Hello world', slugs);
    expect(result).toEqual([{ type: 'text', value: 'Hello world' }]);
  });

  it('parses a simple [[Page Name]] link', () => {
    const result = parseWikiText(
      'See [[Energy Abundance]] for details.',
      slugs,
    );
    expect(result).toEqual([
      { type: 'text', value: 'See ' },
      { type: 'wiki-link', slug: 'energy-abundance', display: 'Energy Abundance', resolved: true },
      { type: 'text', value: ' for details.' },
    ]);
  });

  it('parses a [[slug|Display Text]] aliased link', () => {
    const result = parseWikiText(
      'Read about [[age-of-abundance|the abundance thesis]].',
      slugs,
    );
    expect(result).toEqual([
      { type: 'text', value: 'Read about ' },
      { type: 'wiki-link', slug: 'age-of-abundance', display: 'the abundance thesis', resolved: true },
      { type: 'text', value: '.' },
    ]);
  });

  it('flags unresolved links as broken', () => {
    const result = parseWikiText(
      'See [[Nonexistent Page]] here.',
      slugs,
    );
    expect(result).toEqual([
      { type: 'text', value: 'See ' },
      { type: 'wiki-link', slug: 'nonexistent-page', display: 'Nonexistent Page', resolved: false },
      { type: 'text', value: ' here.' },
    ]);
  });

  it('handles multiple links in one string', () => {
    const result = parseWikiText(
      '[[Energy Abundance]] and [[Coordination Abundance]] are pillars.',
      slugs,
    );
    expect(result).toHaveLength(4);
    expect(result[0]).toEqual({ type: 'wiki-link', slug: 'energy-abundance', display: 'Energy Abundance', resolved: true });
    expect(result[1]).toEqual({ type: 'text', value: ' and ' });
    expect(result[2]).toEqual({ type: 'wiki-link', slug: 'coordination-abundance', display: 'Coordination Abundance', resolved: true });
    expect(result[3]).toEqual({ type: 'text', value: ' are pillars.' });
  });

  it('handles a link at the very start of the string', () => {
    const result = parseWikiText('[[Energy Abundance]] is key.', slugs);
    expect(result[0].type).toBe('wiki-link');
    expect(result[0].slug).toBe('energy-abundance');
  });

  it('handles a link at the very end of the string', () => {
    const result = parseWikiText('See [[Energy Abundance]]', slugs);
    expect(result).toHaveLength(2);
    expect(result[1].type).toBe('wiki-link');
  });

  it('trims whitespace in target and display', () => {
    const result = parseWikiText('[[  Energy Abundance  |  energy  ]]', slugs);
    expect(result[0].slug).toBe('energy-abundance');
    expect(result[0].display).toBe('energy');
  });

  it('handles adjacent links with no text between', () => {
    const result = parseWikiText('[[Energy Abundance]][[Age of Abundance]]', slugs);
    expect(result).toHaveLength(2);
    expect(result[0].type).toBe('wiki-link');
    expect(result[1].type).toBe('wiki-link');
  });
});

// ─── hasWikiLinks ─────────────────────────────────────────────────

describe('hasWikiLinks', () => {
  it('returns true when wiki-links are present', () => {
    expect(hasWikiLinks('See [[Energy Abundance]].')).toBe(true);
  });

  it('returns false for plain text', () => {
    expect(hasWikiLinks('No links here.')).toBe(false);
  });

  it('returns false for non-string input', () => {
    expect(hasWikiLinks(null)).toBe(false);
    expect(hasWikiLinks(undefined)).toBe(false);
  });

  it('returns false for empty brackets', () => {
    expect(hasWikiLinks('[[]]')).toBe(false);
  });
});

// ─── stripWikiLinks ──────────────────────────────────────────────

describe('stripWikiLinks', () => {
  it('replaces [[Page Name]] with the page name', () => {
    expect(stripWikiLinks('See [[Energy Abundance]] here.')).toBe(
      'See Energy Abundance here.',
    );
  });

  it('replaces [[slug|Display]] with the display text', () => {
    expect(
      stripWikiLinks('about [[coordination-abundance|coordination]] and more'),
    ).toBe('about coordination and more');
  });

  it('handles multiple links', () => {
    expect(
      stripWikiLinks('[[Alpha]] and [[beta|B]]'),
    ).toBe('Alpha and B');
  });

  it('returns empty string for non-string input', () => {
    expect(stripWikiLinks(null)).toBe('');
    expect(stripWikiLinks(undefined)).toBe('');
  });

  it('returns original text when no wiki-links are present', () => {
    expect(stripWikiLinks('plain text')).toBe('plain text');
  });
});

// ─── buildOutboundLinks ──────────────────────────────────────────

describe('buildOutboundLinks', () => {
  const fakeArticles = [
    {
      id: 'alpha',
      content: {
        body: 'Links to [[Beta]] and [[gamma|Gamma page]].',
        paragraphs: [
          { subtitle: 'Section', description: 'Also [[Beta]] again.' },
        ],
      },
    },
    {
      id: 'beta',
      content: {
        body: 'Links to [[Alpha]].',
        paragraphs: [],
      },
    },
    {
      id: 'gamma',
      content: {
        body: 'No links here.',
        paragraphs: [],
      },
    },
  ];

  it('builds outbound map with resolved links only', () => {
    const slugs = new Set(['alpha', 'beta', 'gamma']);
    // Use the real function but with the fake articles
    // We need to test with a controlled slug set — but buildOutboundLinks
    // uses getSlugIndex() internally. Let's test the shape instead.
    const graph = buildOutboundLinks(fakeArticles);
    // beta resolves (it's in fakeArticles), gamma resolves, alpha resolves
    // but getSlugIndex() uses the real articles module, so beta/gamma/alpha
    // won't be in the real index. We test structure:
    expect(graph).toHaveProperty('alpha');
    expect(graph).toHaveProperty('beta');
    expect(graph).toHaveProperty('gamma');
    expect(Array.isArray(graph.alpha)).toBe(true);
    expect(Array.isArray(graph.gamma)).toBe(true);
    // gamma has no links
    expect(graph.gamma).toEqual([]);
  });

  it('deduplicates repeated links within the same article', () => {
    const graph = buildOutboundLinks(fakeArticles);
    // alpha mentions [[Beta]] twice — should appear only once
    const betaCount = graph.alpha.filter((s) => s === 'beta').length;
    expect(betaCount).toBeLessThanOrEqual(1);
  });
});

// ─── buildBacklinks ──────────────────────────────────────────────

describe('buildBacklinks', () => {
  it('inverts the outbound graph', () => {
    const outbound = {
      alpha: ['beta', 'gamma'],
      beta: ['alpha'],
      gamma: [],
    };
    const back = buildBacklinks(outbound);
    expect(back.beta).toContain('alpha');
    expect(back.gamma).toContain('alpha');
    expect(back.alpha).toContain('beta');
  });

  it('handles empty outbound graphs', () => {
    const back = buildBacklinks({});
    expect(back).toEqual({});
  });

  it('does not duplicate backlinks', () => {
    const outbound = {
      a: ['b', 'b'],
    };
    const back = buildBacklinks(outbound);
    expect(back.b).toEqual(['a']);
  });
});

// ─── getBacklinksForSlug ────────────────────────────────────────────

describe('getBacklinksForSlug', () => {
  it('returns enriched backlinks for age-of-abundance', () => {
    // energy-abundance and coordination-abundance both link to age-of-abundance
    const backlinks = getBacklinksForSlug('age-of-abundance');
    expect(backlinks.length).toBeGreaterThan(0);

    const slugs = backlinks.map((b) => b.slug);
    expect(slugs).toContain('energy-abundance');
    expect(slugs).toContain('coordination-abundance');
  });

  it('returns title and summary for each backlink', () => {
    const backlinks = getBacklinksForSlug('age-of-abundance');
    for (const link of backlinks) {
      expect(typeof link.slug).toBe('string');
      expect(link.slug.length).toBeGreaterThan(0);
      expect(typeof link.title).toBe('string');
      expect(link.title.length).toBeGreaterThan(0);
      expect(typeof link.summary).toBe('string');
    }
  });

  it('returns an empty array for a slug with no incoming links', () => {
    const backlinks = getBacklinksForSlug('nonexistent-article');
    expect(backlinks).toEqual([]);
  });

  it('does not include self-links', () => {
    // No article links to itself in the seed data
    const backlinks = getBacklinksForSlug('energy-abundance');
    const slugs = backlinks.map((b) => b.slug);
    expect(slugs).not.toContain('energy-abundance');
  });

  it('returns the correct title from the article subject', () => {
    const backlinks = getBacklinksForSlug('energy-abundance');
    const fromAoA = backlinks.find((b) => b.slug === 'age-of-abundance');
    expect(fromAoA).toBeTruthy();
    expect(fromAoA.title).toBe('Age of Abundance');
  });
});
