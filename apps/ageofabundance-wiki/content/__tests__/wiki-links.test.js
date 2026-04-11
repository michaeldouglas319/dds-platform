import { describe, it, expect } from 'vitest';
import {
  slugifyTarget,
  parseWikiLinks,
  createWikiLinkResolver,
  resolveWikiLinks,
} from '../wiki-links.js';

describe('slugifyTarget', () => {
  it('returns empty for non-strings', () => {
    expect(slugifyTarget(null)).toBe('');
    expect(slugifyTarget(undefined)).toBe('');
    expect(slugifyTarget(42)).toBe('');
    expect(slugifyTarget({})).toBe('');
  });

  it('returns empty for empty / whitespace input', () => {
    expect(slugifyTarget('')).toBe('');
    expect(slugifyTarget('   ')).toBe('');
  });

  it('lowercases and hyphenates multi-word titles', () => {
    expect(slugifyTarget('Coordination Abundance')).toBe('coordination-abundance');
    expect(slugifyTarget('Age of Abundance')).toBe('age-of-abundance');
  });

  it('passes canonical slugs through unchanged', () => {
    expect(slugifyTarget('coordination-abundance')).toBe('coordination-abundance');
    expect(slugifyTarget('energy-abundance')).toBe('energy-abundance');
  });

  it('treats underscores as word separators', () => {
    expect(slugifyTarget('energy_abundance')).toBe('energy-abundance');
    expect(slugifyTarget('energy__abundance')).toBe('energy-abundance');
  });

  it('strips punctuation outside [a-z0-9-]', () => {
    expect(slugifyTarget("Jane's Notes!")).toBe('janes-notes');
    expect(slugifyTarget('foo.bar/baz')).toBe('foobarbaz');
    expect(slugifyTarget('π≈3.14')).toBe('314');
  });

  it('collapses consecutive hyphens and trims edges', () => {
    expect(slugifyTarget(' - foo -- bar - ')).toBe('foo-bar');
    expect(slugifyTarget('---')).toBe('');
  });
});

describe('parseWikiLinks', () => {
  it('returns an empty array for non-strings / empty input', () => {
    expect(parseWikiLinks(null)).toEqual([]);
    expect(parseWikiLinks(undefined)).toEqual([]);
    expect(parseWikiLinks('')).toEqual([]);
  });

  it('returns a single text token when there are no links', () => {
    const tokens = parseWikiLinks('just plain prose with no links.');
    expect(tokens).toEqual([
      { type: 'text', value: 'just plain prose with no links.' },
    ]);
  });

  it('parses a single bare [[target]]', () => {
    const tokens = parseWikiLinks('see [[coordination-abundance]] for more');
    expect(tokens).toHaveLength(3);
    expect(tokens[0]).toEqual({ type: 'text', value: 'see ' });
    expect(tokens[1]).toMatchObject({
      type: 'link',
      target: 'coordination-abundance',
      slug: 'coordination-abundance',
      display: 'coordination-abundance',
      exists: false,
    });
    expect(tokens[2]).toEqual({ type: 'text', value: ' for more' });
  });

  it('parses aliased [[target|Display]]', () => {
    const [_, link] = parseWikiLinks('read [[energy-abundance|Energy Abundance]].');
    expect(link).toMatchObject({
      type: 'link',
      target: 'energy-abundance',
      slug: 'energy-abundance',
      display: 'Energy Abundance',
    });
  });

  it('parses title-cased targets by slugifying them', () => {
    const tokens = parseWikiLinks('see [[Coordination Abundance]].');
    const link = tokens.find((t) => t.type === 'link');
    expect(link).toMatchObject({
      target: 'Coordination Abundance',
      slug: 'coordination-abundance',
      display: 'Coordination Abundance',
    });
  });

  it('parses multiple links in one string', () => {
    const tokens = parseWikiLinks(
      'the [[energy-abundance|energy]] and [[coordination-abundance|coordination]] pillars',
    );
    const links = tokens.filter((t) => t.type === 'link');
    expect(links).toHaveLength(2);
    expect(links[0].display).toBe('energy');
    expect(links[1].display).toBe('coordination');
  });

  it('round-trips degenerate [[ ]] tokens as plain text', () => {
    const tokens = parseWikiLinks('a [[  ]] b');
    expect(tokens).toEqual([
      { type: 'text', value: 'a ' },
      { type: 'text', value: '[[  ]]' },
      { type: 'text', value: ' b' },
    ]);
  });

  it('is not greedy across newlines', () => {
    const tokens = parseWikiLinks('[[one]]\n[[two]]');
    const links = tokens.filter((t) => t.type === 'link');
    expect(links.map((l) => l.slug)).toEqual(['one', 'two']);
  });

  it('text concatenation round-trips to original', () => {
    const input =
      'start [[age-of-abundance|Age]] middle [[energy-abundance]] end';
    const tokens = parseWikiLinks(input);
    const rejoined = tokens
      .map((t) => (t.type === 'text' ? t.value : t.raw))
      .join('');
    expect(rejoined).toBe(input);
  });
});

describe('createWikiLinkResolver', () => {
  const articles = [
    {
      id: 'age-of-abundance',
      subject: { title: 'Age of Abundance' },
    },
    {
      id: 'energy-abundance',
      subject: { title: 'Energy Abundance' },
    },
    {
      id: 'coordination-abundance',
      subject: { title: 'Coordination Abundance' },
    },
  ];

  it('resolves canonical slugs', () => {
    const { resolve } = createWikiLinkResolver(articles);
    expect(resolve('coordination-abundance')).toEqual({
      slug: 'coordination-abundance',
      exists: true,
      title: 'Coordination Abundance',
    });
  });

  it('resolves title-cased targets', () => {
    const { resolve } = createWikiLinkResolver(articles);
    expect(resolve('Age of Abundance')).toEqual({
      slug: 'age-of-abundance',
      exists: true,
      title: 'Age of Abundance',
    });
  });

  it('marks unknown targets as broken (redlinks)', () => {
    const { resolve } = createWikiLinkResolver(articles);
    expect(resolve('compute-abundance')).toEqual({
      slug: 'compute-abundance',
      exists: false,
      title: null,
    });
  });

  it('returns empty for empty targets', () => {
    const { resolve } = createWikiLinkResolver(articles);
    expect(resolve('')).toEqual({ slug: '', exists: false, title: null });
  });

  it('tolerates malformed article input', () => {
    const { resolve } = createWikiLinkResolver([
      null,
      {},
      { id: 'ok', subject: { title: 'OK' } },
    ]);
    expect(resolve('ok').exists).toBe(true);
    expect(resolve('missing').exists).toBe(false);
  });

  it('tolerates non-array input', () => {
    const { resolve } = createWikiLinkResolver(null);
    expect(resolve('anything').exists).toBe(false);
  });
});

describe('resolveWikiLinks', () => {
  const articles = [
    { id: 'energy-abundance', subject: { title: 'Energy Abundance' } },
    { id: 'coordination-abundance', subject: { title: 'Coordination Abundance' } },
  ];
  const resolver = createWikiLinkResolver(articles);

  it('flags links to known articles as exists: true', () => {
    const tokens = resolveWikiLinks(
      'see [[energy-abundance|energy]] for detail',
      resolver,
    );
    const link = tokens.find((t) => t.type === 'link');
    expect(link).toMatchObject({
      slug: 'energy-abundance',
      display: 'energy',
      exists: true,
    });
  });

  it('flags links to unknown articles as exists: false', () => {
    const tokens = resolveWikiLinks(
      'someday: [[compute-abundance|Compute Abundance]]',
      resolver,
    );
    const link = tokens.find((t) => t.type === 'link');
    expect(link).toMatchObject({
      slug: 'compute-abundance',
      exists: false,
    });
  });

  it('leaves text tokens untouched', () => {
    const tokens = resolveWikiLinks('just text', resolver);
    expect(tokens).toEqual([{ type: 'text', value: 'just text' }]);
  });

  it('returns unresolved tokens when no resolver is supplied', () => {
    const tokens = resolveWikiLinks('[[energy-abundance]]', null);
    expect(tokens[0]).toMatchObject({ type: 'link', exists: false });
  });

  it('resolves title-cased targets through the resolver', () => {
    const tokens = resolveWikiLinks('[[Energy Abundance]]', resolver);
    const link = tokens.find((t) => t.type === 'link');
    expect(link).toMatchObject({
      slug: 'energy-abundance',
      exists: true,
    });
  });
});
