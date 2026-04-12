import { describe, it, expect } from 'vitest';
import {
  toSlug,
  extractWikiLinks,
  buildWikiLinkGraph,
  collectArticleLinks,
} from '../wiki-links.js';

// ─── toSlug ──────────────────────────────────────────────────────────

describe('toSlug', () => {
  it('lowercases and replaces spaces with hyphens', () => {
    expect(toSlug('Age of Abundance')).toBe('age-of-abundance');
  });

  it('trims whitespace', () => {
    expect(toSlug('  Energy Abundance  ')).toBe('energy-abundance');
  });

  it('passes through existing slugs unchanged', () => {
    expect(toSlug('energy-abundance')).toBe('energy-abundance');
  });

  it('collapses multiple spaces into a single hyphen', () => {
    expect(toSlug('lots   of   spaces')).toBe('lots-of-spaces');
  });

  it('strips non-alphanumeric characters', () => {
    expect(toSlug("It's a Test!")).toBe('its-a-test');
  });

  it('collapses consecutive hyphens', () => {
    expect(toSlug('a--b---c')).toBe('a-b-c');
  });

  it('strips leading and trailing hyphens', () => {
    expect(toSlug('-leading-')).toBe('leading');
  });

  it('returns empty string for empty input', () => {
    expect(toSlug('')).toBe('');
    expect(toSlug('   ')).toBe('');
  });
});

// ─── extractWikiLinks ────────────────────────────────────────────────

describe('extractWikiLinks', () => {
  const slugs = new Set(['age-of-abundance', 'energy-abundance', 'coordination-abundance']);

  it('returns empty array for null/undefined/empty text', () => {
    expect(extractWikiLinks('', slugs)).toEqual([]);
    expect(extractWikiLinks(null, slugs)).toEqual([]);
    expect(extractWikiLinks(undefined, slugs)).toEqual([]);
  });

  it('returns empty array when there are no wiki-links', () => {
    expect(extractWikiLinks('Just regular text.', slugs)).toEqual([]);
  });

  it('parses a simple [[Page Name]] link', () => {
    const result = extractWikiLinks('See [[Age of Abundance]] for more.', slugs);
    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe('age-of-abundance');
    expect(result[0].display).toBe('Age of Abundance');
    expect(result[0].exists).toBe(true);
  });

  it('parses a piped [[slug|Display Text]] link', () => {
    const result = extractWikiLinks('This is about [[energy-abundance|cheap energy]].', slugs);
    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe('energy-abundance');
    expect(result[0].display).toBe('cheap energy');
    expect(result[0].exists).toBe(true);
  });

  it('marks non-existent slugs as broken', () => {
    const result = extractWikiLinks('See [[Green Hydrogen]] for details.', slugs);
    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe('green-hydrogen');
    expect(result[0].display).toBe('Green Hydrogen');
    expect(result[0].exists).toBe(false);
  });

  it('handles multiple links in one string', () => {
    const text = '[[Age of Abundance]] depends on [[Energy Abundance]] and [[Coordination Abundance]].';
    const result = extractWikiLinks(text, slugs);
    expect(result).toHaveLength(3);
    expect(result[0].slug).toBe('age-of-abundance');
    expect(result[1].slug).toBe('energy-abundance');
    expect(result[2].slug).toBe('coordination-abundance');
    expect(result.every((l) => l.exists)).toBe(true);
  });

  it('records start and end offsets', () => {
    const text = 'See [[Age of Abundance]] here.';
    const result = extractWikiLinks(text, slugs);
    expect(result[0].start).toBe(4);
    expect(result[0].end).toBe(24);
    expect(text.slice(result[0].start, result[0].end)).toBe('[[Age of Abundance]]');
  });

  it('trims whitespace inside brackets', () => {
    const result = extractWikiLinks('See [[ Age of Abundance ]] ok.', slugs);
    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe('age-of-abundance');
    expect(result[0].display).toBe('Age of Abundance');
  });

  it('trims whitespace on both sides of pipe', () => {
    const result = extractWikiLinks('See [[ energy-abundance | clean power ]] ok.', slugs);
    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe('energy-abundance');
    expect(result[0].display).toBe('clean power');
  });

  it('ignores empty brackets [[]]', () => {
    const result = extractWikiLinks('Empty [[]] here.', slugs);
    expect(result).toEqual([]);
  });

  it('handles mixed valid and broken links', () => {
    const text = '[[Age of Abundance]] and [[nonexistent-page]].';
    const result = extractWikiLinks(text, slugs);
    expect(result).toHaveLength(2);
    expect(result[0].exists).toBe(true);
    expect(result[1].exists).toBe(false);
  });
});

// ─── buildWikiLinkGraph ──────────────────────────────────────────────

describe('buildWikiLinkGraph', () => {
  const articles = [
    {
      id: 'article-a',
      content: {
        body: 'Links to [[Article B]].',
        paragraphs: [
          { subtitle: 'Section', description: 'Also [[Article C]].' },
        ],
      },
    },
    {
      id: 'article-b',
      content: {
        body: 'Links back to [[Article A]].',
        paragraphs: [],
      },
    },
    {
      id: 'article-c',
      content: {
        body: 'No links here.',
        paragraphs: [],
      },
    },
  ];

  it('builds a graph with backlinks', () => {
    const graph = buildWikiLinkGraph(articles);
    expect(graph.get('article-b')).toEqual(new Set(['article-a']));
    expect(graph.get('article-a')).toEqual(new Set(['article-b']));
    expect(graph.get('article-c')).toEqual(new Set(['article-a']));
  });

  it('ignores links to non-existent articles', () => {
    const articles2 = [
      {
        id: 'x',
        content: { body: '[[nonexistent]] and [[y]]', paragraphs: [] },
      },
      {
        id: 'y',
        content: { body: 'No links.', paragraphs: [] },
      },
    ];
    const graph = buildWikiLinkGraph(articles2);
    expect(graph.get('y')).toEqual(new Set(['x']));
    // nonexistent is not in the graph
    expect(graph.has('nonexistent')).toBe(false);
  });

  it('initializes all slugs with empty sets', () => {
    const articles3 = [
      { id: 'orphan', content: { body: 'No links.', paragraphs: [] } },
    ];
    const graph = buildWikiLinkGraph(articles3);
    expect(graph.get('orphan')).toEqual(new Set());
  });

  it('handles empty articles array', () => {
    const graph = buildWikiLinkGraph([]);
    expect(graph.size).toBe(0);
  });
});

// ─── collectArticleLinks ─────────────────────────────────────────────

describe('collectArticleLinks', () => {
  const slugs = new Set(['article-a', 'article-b']);

  it('collects unique outgoing links from an article', () => {
    const article = {
      content: {
        body: 'See [[Article A]] and [[Article A]] again.',
        paragraphs: [
          { subtitle: 'Heading', description: '[[Article B]] and [[Missing]].' },
        ],
      },
    };
    const links = collectArticleLinks(article, slugs);
    // Deduped: article-a, article-b, missing
    expect(links).toHaveLength(3);
    expect(links[0]).toEqual({ slug: 'article-a', exists: true });
    expect(links[1]).toEqual({ slug: 'article-b', exists: true });
    expect(links[2]).toEqual({ slug: 'missing', exists: false });
  });

  it('returns empty for articles with no wiki-links', () => {
    const article = {
      content: { body: 'Plain text.', paragraphs: [] },
    };
    expect(collectArticleLinks(article, slugs)).toEqual([]);
  });

  it('handles missing content gracefully', () => {
    expect(collectArticleLinks({}, slugs)).toEqual([]);
    expect(collectArticleLinks({ content: {} }, slugs)).toEqual([]);
  });
});
