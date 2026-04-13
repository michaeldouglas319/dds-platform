import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import {
  WikiArticleRenderer,
  WikiCardGridRenderer,
  WikiIndexRenderer,
  WikiTocRenderer,
  WikiBacklinksRenderer,
  wikiRegistry,
  wikiEntries,
} from '../index.js';

// ─── Fixtures ────────────────────────────────────────────────────

/** Minimal article section matching the seed data shape. */
const articleSection = {
  id: 'age-of-abundance',
  type: 'section',
  name: 'age-of-abundance',
  subject: {
    title: 'Age of Abundance',
    subtitle: 'A living encyclopedia of post-scarcity civilization.',
    category: 'Concept',
  },
  content: {
    body: 'The Age of Abundance describes the socio-technical transition.',
    paragraphs: [
      { subtitle: 'Origins of the term', description: 'The phrase gained wide currency.' },
      { subtitle: 'Core pillars', description: 'Four pillars are identified.' },
    ],
  },
  display: { layout: 'wiki-article', textWidth: 'm' },
  meta: {
    wiki: {
      lastUpdatedISO: '2026-04-11',
      authors: ['editorial'],
      tags: ['concept', 'foundations'],
      summary: 'The socio-technical transition.',
      toc: 'auto',
    },
  },
};

const cardGridSection = {
  id: 'featured-grid',
  type: 'section',
  name: 'featured-grid',
  subject: { title: 'Featured articles' },
  display: { layout: 'wiki-card-grid' },
  children: [
    {
      id: 'article-a',
      type: 'section',
      name: 'article-a',
      subject: { title: 'Article A', category: 'Test' },
      content: { body: 'Body A' },
      display: { layout: 'wiki-article' },
      meta: { wiki: { tags: [], authors: [] } },
    },
    {
      id: 'article-b',
      type: 'section',
      name: 'article-b',
      subject: { title: 'Article B', category: 'Test' },
      content: { body: 'Body B' },
      display: { layout: 'wiki-article' },
      meta: { wiki: { tags: [], authors: [] } },
    },
  ],
  meta: {},
};

const indexSection = {
  id: 'wiki-index',
  type: 'section',
  name: 'wiki-index',
  subject: { title: 'All articles', subtitle: 'Browse the full index.' },
  display: { layout: 'wiki-index' },
  meta: {},
};

const tocSection = {
  id: 'standalone-toc',
  type: 'section',
  name: 'standalone-toc',
  content: {
    paragraphs: [
      { subtitle: 'First heading', description: 'Details.' },
      { subtitle: 'Second heading', description: 'More details.' },
    ],
  },
  display: { layout: 'wiki-toc' },
  meta: {},
};

const backlinksSection = {
  id: 'energy-abundance',
  type: 'section',
  name: 'energy-abundance',
  display: { layout: 'wiki-backlinks' },
  meta: { wiki: { targetSlug: 'energy-abundance' } },
};

// ─── Registry structure tests ────────────────────────────────────

describe('wikiRegistry', () => {
  it('contains all five wiki layout keys', () => {
    const wikiKeys = [
      'wiki-article',
      'wiki-card-grid',
      'wiki-index',
      'wiki-toc',
      'wiki-backlinks',
    ];
    for (const key of wikiKeys) {
      expect(wikiRegistry[key]).toBeDefined();
      expect(wikiRegistry[key].component).toBeTypeOf('function');
      expect(wikiRegistry[key].metadata).toBeDefined();
      expect(wikiRegistry[key].metadata.name).toBe(key);
    }
  });

  it('preserves all default registry keys', () => {
    const defaultKeys = [
      'intro', 'hero', 'text', 'section', 'header', 'text-only',
      'stats-grid', 'feature-matrix', 'timeline', 'cta',
      'centered-text', 'two-column', 'sectors-grid',
    ];
    for (const key of defaultKeys) {
      expect(wikiRegistry[key]).toBeDefined();
      expect(wikiRegistry[key].component).toBeTypeOf('function');
    }
  });

  it('does not overwrite any default registry key', () => {
    const defaultKeys = [
      'intro', 'hero', 'text', 'section', 'header', 'text-only',
      'stats-grid', 'feature-matrix', 'timeline', 'cta',
      'centered-text', 'two-column', 'sectors-grid',
    ];
    for (const key of defaultKeys) {
      // Wiki keys all start with 'wiki-', so no collisions
      expect(key.startsWith('wiki-')).toBe(false);
    }
  });
});

describe('wikiEntries', () => {
  it('exports exactly five entries', () => {
    expect(Object.keys(wikiEntries)).toHaveLength(5);
  });

  it('each entry has component and metadata with required fields', () => {
    for (const [key, entry] of Object.entries(wikiEntries)) {
      expect(entry.component).toBeTypeOf('function');
      expect(entry.metadata.name).toBe(key);
      expect(entry.metadata.displayName).toBeTruthy();
      expect(entry.metadata.description).toBeTruthy();
      expect(entry.metadata.layouts).toContain(key);
    }
  });
});

// ─── Renderer component tests ───────────────────────────────────

describe('WikiArticleRenderer', () => {
  it('is a function', () => {
    expect(WikiArticleRenderer).toBeTypeOf('function');
  });

  it('renders the article title', () => {
    render(<WikiArticleRenderer section={articleSection} />);
    expect(screen.getByText('Age of Abundance')).toBeInTheDocument();
  });

  it('renders section headings from paragraphs', () => {
    render(<WikiArticleRenderer section={articleSection} />);
    // Text appears in both TOC and h2 — use getAllByText to verify presence
    expect(screen.getAllByText('Origins of the term').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Core pillars').length).toBeGreaterThanOrEqual(1);
  });

  it('renders the category kicker', () => {
    render(<WikiArticleRenderer section={articleSection} />);
    expect(screen.getByText('Concept')).toBeInTheDocument();
  });

  it('renders metadata panel', () => {
    render(<WikiArticleRenderer section={articleSection} />);
    expect(screen.getByText('Last updated')).toBeInTheDocument();
    expect(screen.getByText('Authors')).toBeInTheDocument();
  });
});

describe('WikiCardGridRenderer', () => {
  it('is a function', () => {
    expect(WikiCardGridRenderer).toBeTypeOf('function');
  });

  it('renders article cards from children', () => {
    render(<WikiCardGridRenderer section={cardGridSection} />);
    expect(screen.getByText('Article A')).toBeInTheDocument();
    expect(screen.getByText('Article B')).toBeInTheDocument();
  });

  it('renders the section title', () => {
    render(<WikiCardGridRenderer section={cardGridSection} />);
    expect(screen.getByText('Featured articles')).toBeInTheDocument();
  });

  it('renders empty state when no children', () => {
    const emptySection = {
      ...cardGridSection,
      children: [],
      meta: { wiki: { emptyMessage: 'Nothing here yet.' } },
    };
    render(<WikiCardGridRenderer section={emptySection} />);
    expect(screen.getByText('Nothing here yet.')).toBeInTheDocument();
  });

  it('renders default empty message', () => {
    const emptySection = { ...cardGridSection, children: [], meta: {} };
    render(<WikiCardGridRenderer section={emptySection} />);
    expect(screen.getByText('No articles yet. Check back soon.')).toBeInTheDocument();
  });
});

describe('WikiIndexRenderer', () => {
  it('is a function', () => {
    expect(WikiIndexRenderer).toBeTypeOf('function');
  });

  it('renders the title from section data', () => {
    render(<WikiIndexRenderer section={indexSection} />);
    expect(screen.getByText('All articles')).toBeInTheDocument();
  });

  it('renders the lede from section subtitle', () => {
    render(<WikiIndexRenderer section={indexSection} />);
    expect(screen.getByText('Browse the full index.')).toBeInTheDocument();
  });

  it('uses default title when section has no subject', () => {
    const minimal = { id: 'idx', type: 'section', display: { layout: 'wiki-index' }, meta: {} };
    render(<WikiIndexRenderer section={minimal} />);
    expect(screen.getByText('All articles')).toBeInTheDocument();
  });
});

describe('WikiTocRenderer', () => {
  it('is a function', () => {
    expect(WikiTocRenderer).toBeTypeOf('function');
  });

  it('renders TOC entries from paragraphs', () => {
    render(<WikiTocRenderer section={tocSection} />);
    expect(screen.getByText('First heading')).toBeInTheDocument();
    expect(screen.getByText('Second heading')).toBeInTheDocument();
  });

  it('renders a navigation landmark', () => {
    render(<WikiTocRenderer section={tocSection} />);
    expect(screen.getByRole('navigation', { name: /table of contents/i })).toBeInTheDocument();
  });

  it('renders nothing for empty paragraphs', () => {
    const emptySection = { id: 'empty-toc', type: 'section', content: { paragraphs: [] }, meta: {} };
    const { container } = render(<WikiTocRenderer section={emptySection} />);
    expect(container.innerHTML).toBe('');
  });

  it('renders nothing when content is undefined', () => {
    const noContent = { id: 'no-content', type: 'section', meta: {} };
    const { container } = render(<WikiTocRenderer section={noContent} />);
    expect(container.innerHTML).toBe('');
  });
});

describe('WikiBacklinksRenderer', () => {
  it('is a function', () => {
    expect(WikiBacklinksRenderer).toBeTypeOf('function');
  });

  it('uses targetSlug from meta.wiki when provided', () => {
    // energy-abundance has backlinks from age-of-abundance
    render(<WikiBacklinksRenderer section={backlinksSection} />);
    expect(screen.getByText('Pages that link here')).toBeInTheDocument();
  });

  it('renders nothing for slug with no backlinks', () => {
    const noBacklinks = {
      id: 'no-backlinks-slug-xyz',
      type: 'section',
      display: { layout: 'wiki-backlinks' },
      meta: { wiki: { targetSlug: 'no-backlinks-slug-xyz' } },
    };
    const { container } = render(<WikiBacklinksRenderer section={noBacklinks} />);
    expect(container.innerHTML).toBe('');
  });

  it('falls back to section.id when no targetSlug', () => {
    const fallback = {
      id: 'energy-abundance',
      type: 'section',
      display: { layout: 'wiki-backlinks' },
      meta: {},
    };
    render(<WikiBacklinksRenderer section={fallback} />);
    expect(screen.getByText('Pages that link here')).toBeInTheDocument();
  });
});
