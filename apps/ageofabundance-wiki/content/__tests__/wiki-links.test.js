import { describe, it, expect } from 'vitest';
import {
  normalizeWikiSlug,
  parseWikiLinks,
  resolveWikiLinks,
  segmentWikiContent,
  buildWikiLinkGraph,
  buildSlugSet,
} from '../wiki-links.js';

// ---------------------------------------------------------------------------
// normalizeWikiSlug
// ---------------------------------------------------------------------------

describe('normalizeWikiSlug', () => {
  it('lowercases and replaces spaces with hyphens', () => {
    expect(normalizeWikiSlug('Age of Abundance')).toBe('age-of-abundance');
  });

  it('strips non-alphanumeric characters', () => {
    expect(normalizeWikiSlug('Compute & AI!')).toBe('compute-ai');
  });

  it('collapses consecutive hyphens', () => {
    expect(normalizeWikiSlug('a  --  b')).toBe('a-b');
  });

  it('trims leading/trailing whitespace and hyphens', () => {
    expect(normalizeWikiSlug('  -hello-  ')).toBe('hello');
  });

  it('returns empty string for empty or whitespace input', () => {
    expect(normalizeWikiSlug('')).toBe('');
    expect(normalizeWikiSlug('   ')).toBe('');
  });

  it('handles already-slugified input', () => {
    expect(normalizeWikiSlug('energy-abundance')).toBe('energy-abundance');
  });

  it('returns empty string for non-string input', () => {
    // @ts-expect-error — runtime guard
    expect(normalizeWikiSlug(null)).toBe('');
    // @ts-expect-error — runtime guard
    expect(normalizeWikiSlug(42)).toBe('');
  });
});

// ---------------------------------------------------------------------------
// parseWikiLinks
// ---------------------------------------------------------------------------

describe('parseWikiLinks', () => {
  it('parses a basic [[Page Name]] link', () => {
    const links = parseWikiLinks('See [[Energy Abundance]] for details.');
    expect(links).toHaveLength(1);
    expect(links[0]).toMatchObject({
      raw: '[[Energy Abundance]]',
      target: 'Energy Abundance',
      slug: 'energy-abundance',
      display: 'Energy Abundance',
    });
    expect(links[0].index).toBe(4);
  });

  it('parses a piped [[slug|Display Text]] link', () => {
    const links = parseWikiLinks('the [[energy-abundance|first pillar]] is key');
    expect(links).toHaveLength(1);
    expect(links[0]).toMatchObject({
      target: 'energy-abundance',
      slug: 'energy-abundance',
      display: 'first pillar',
    });
  });

  it('parses multiple links in one string', () => {
    const text = '[[Age of Abundance]] bridges [[Energy Abundance]] and [[Coordination Abundance]]';
    const links = parseWikiLinks(text);
    expect(links).toHaveLength(3);
    expect(links.map((l) => l.slug)).toEqual([
      'age-of-abundance',
      'energy-abundance',
      'coordination-abundance',
    ]);
  });

  it('returns empty array for text without wiki-links', () => {
    expect(parseWikiLinks('No links here.')).toEqual([]);
  });

  it('returns empty array for non-string input', () => {
    // @ts-expect-error — runtime guard
    expect(parseWikiLinks(null)).toEqual([]);
    // @ts-expect-error — runtime guard
    expect(parseWikiLinks(42)).toEqual([]);
  });

  it('skips degenerate links that normalize to empty slug', () => {
    expect(parseWikiLinks('See [[!!!]] here.')).toEqual([]);
  });

  it('does not match nested brackets', () => {
    // [[outer [[inner]]]] should not produce valid links
    const links = parseWikiLinks('[[outer [[inner]]]]');
    // The regex will match [[inner]] only
    expect(links).toHaveLength(1);
    expect(links[0].target).toBe('inner');
  });

  it('trims whitespace inside brackets', () => {
    const links = parseWikiLinks('[[  Energy Abundance  ]]');
    expect(links[0].target).toBe('Energy Abundance');
    expect(links[0].slug).toBe('energy-abundance');
  });

  it('trims whitespace in piped display text', () => {
    const links = parseWikiLinks('[[slug |  Display  ]]');
    expect(links[0].display).toBe('Display');
  });

  it('does not match across newlines', () => {
    const links = parseWikiLinks('[[broken\nlink]]');
    expect(links).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// resolveWikiLinks
// ---------------------------------------------------------------------------

describe('resolveWikiLinks', () => {
  const knownSlugs = new Set(['age-of-abundance', 'energy-abundance']);

  it('marks existing links with exists=true and href', () => {
    const links = resolveWikiLinks('See [[Energy Abundance]].', knownSlugs);
    expect(links).toHaveLength(1);
    expect(links[0].exists).toBe(true);
    expect(links[0].href).toBe('/a/energy-abundance');
  });

  it('marks missing links with exists=false and empty href', () => {
    const links = resolveWikiLinks('See [[Missing Page]].', knownSlugs);
    expect(links).toHaveLength(1);
    expect(links[0].exists).toBe(false);
    expect(links[0].href).toBe('');
  });

  it('resolves mixed existing and broken links', () => {
    const text = '[[Age of Abundance]] and [[Nonexistent]]';
    const links = resolveWikiLinks(text, knownSlugs);
    expect(links).toHaveLength(2);
    expect(links[0].exists).toBe(true);
    expect(links[1].exists).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// segmentWikiContent
// ---------------------------------------------------------------------------

describe('segmentWikiContent', () => {
  const knownSlugs = new Set(['age-of-abundance', 'energy-abundance']);

  it('returns the original string in an array if no links', () => {
    const segments = segmentWikiContent('No links here.', knownSlugs);
    expect(segments).toEqual(['No links here.']);
  });

  it('splits text around a single link', () => {
    const segments = segmentWikiContent('before [[Energy Abundance]] after', knownSlugs);
    expect(segments).toHaveLength(3);
    expect(segments[0]).toBe('before ');
    expect(typeof segments[1]).toBe('object');
    expect(segments[1].slug).toBe('energy-abundance');
    expect(segments[2]).toBe(' after');
  });

  it('handles links at start and end of string', () => {
    const segments = segmentWikiContent('[[Age of Abundance]] is great', knownSlugs);
    expect(typeof segments[0]).toBe('object');
    expect(segments[0].slug).toBe('age-of-abundance');
    expect(segments[1]).toBe(' is great');
  });

  it('handles adjacent links with no gap', () => {
    const segments = segmentWikiContent('[[Age of Abundance]][[Energy Abundance]]', knownSlugs);
    expect(segments).toHaveLength(2);
    expect(segments[0].slug).toBe('age-of-abundance');
    expect(segments[1].slug).toBe('energy-abundance');
  });

  it('returns [""] for empty string', () => {
    expect(segmentWikiContent('', knownSlugs)).toEqual(['']);
  });

  it('returns [""] for non-string input', () => {
    // @ts-expect-error — runtime guard
    expect(segmentWikiContent(null, knownSlugs)).toEqual(['']);
  });
});

// ---------------------------------------------------------------------------
// buildSlugSet
// ---------------------------------------------------------------------------

describe('buildSlugSet', () => {
  it('builds a Set from article ids', () => {
    const articles = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
    const set = buildSlugSet(articles);
    expect(set).toBeInstanceOf(Set);
    expect(set.size).toBe(3);
    expect(set.has('a')).toBe(true);
    expect(set.has('b')).toBe(true);
    expect(set.has('c')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// buildWikiLinkGraph
// ---------------------------------------------------------------------------

describe('buildWikiLinkGraph', () => {
  const articles = [
    {
      id: 'alpha',
      content: {
        body: 'Links to [[Beta]] and [[gamma|Gamma page]].',
        paragraphs: [
          { subtitle: 'Sub', description: 'Also links to [[Beta]].' },
        ],
      },
    },
    {
      id: 'beta',
      content: {
        body: 'Links back to [[Alpha]].',
        paragraphs: [],
      },
    },
  ];
  const knownSlugs = new Set(['alpha', 'beta']);

  it('builds a map from article slug to outgoing links', () => {
    const graph = buildWikiLinkGraph(articles, knownSlugs);
    expect(graph.size).toBe(2);

    const alphaLinks = graph.get('alpha');
    expect(alphaLinks.length).toBe(3); // [[Beta]] twice + [[gamma|Gamma page]]
    expect(alphaLinks[0].slug).toBe('beta');

    const betaLinks = graph.get('beta');
    expect(betaLinks.length).toBe(1);
    expect(betaLinks[0].slug).toBe('alpha');
  });

  it('marks broken links correctly in the graph', () => {
    const graph = buildWikiLinkGraph(articles, knownSlugs);
    const gammaLink = graph.get('alpha').find((l) => l.slug === 'gamma');
    expect(gammaLink).toBeDefined();
    expect(gammaLink.exists).toBe(false);
  });
});
