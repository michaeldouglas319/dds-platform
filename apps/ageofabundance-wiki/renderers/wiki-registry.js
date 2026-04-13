/**
 * Wiki renderer registry.
 *
 * Extends the default @dds/renderer registry with wiki-specific layout
 * renderers. Pass `wikiRegistry` to `<SectionBatchRenderer registry={…}>`
 * in any wiki app page to enable wiki layouts alongside the standard
 * set (hero, text, stats, cta, etc.).
 *
 * Layout keys registered:
 * - `wiki-article`   — full editorial article page
 * - `wiki-card-grid` — grid of article cards
 * - `wiki-index`     — article index with tag filtering
 * - `wiki-toc`       — standalone table of contents
 * - `wiki-backlinks` — "Pages that link here" panel
 */

import { createRegistry, defaultRegistry } from '@dds/renderer';

import { WikiArticleRenderer } from './wiki-article-renderer.jsx';
import { WikiCardGridRenderer } from './wiki-card-grid-renderer.jsx';
import { WikiIndexRenderer } from './wiki-index-renderer.jsx';
import { WikiTocRenderer } from './wiki-toc-renderer.jsx';
import { WikiBacklinksRenderer } from './wiki-backlinks-renderer.jsx';

// ─── Registry entries ────────────────────────────────────────────

const wikiArticle = {
  component: WikiArticleRenderer,
  metadata: {
    name: 'wiki-article',
    displayName: 'Wiki Article',
    description:
      'Full editorial article page with metadata, TOC, body sections, and backlinks',
    layouts: ['wiki-article'],
    optional: {
      subject: ['title', 'subtitle', 'category'],
      content: ['body', 'paragraphs'],
      meta: ['wiki'],
    },
  },
};

const wikiCardGrid = {
  component: WikiCardGridRenderer,
  metadata: {
    name: 'wiki-card-grid',
    displayName: 'Wiki Card Grid',
    description:
      'Grid of article cards rendered from children or meta.wiki.articles',
    composable: true,
    layouts: ['wiki-card-grid'],
    optional: {
      subject: ['title'],
      meta: ['wiki'],
    },
  },
};

const wikiIndex = {
  component: WikiIndexRenderer,
  metadata: {
    name: 'wiki-index',
    displayName: 'Wiki Index',
    description:
      'Article index page with date sorting and client-side tag filtering',
    layouts: ['wiki-index'],
    optional: {
      subject: ['title', 'subtitle'],
    },
  },
};

const wikiToc = {
  component: WikiTocRenderer,
  metadata: {
    name: 'wiki-toc',
    displayName: 'Wiki Table of Contents',
    description:
      'Standalone table of contents built from content.paragraphs subtitles',
    layouts: ['wiki-toc'],
    optional: {
      content: ['paragraphs'],
    },
  },
};

const wikiBacklinks = {
  component: WikiBacklinksRenderer,
  metadata: {
    name: 'wiki-backlinks',
    displayName: 'Wiki Backlinks',
    description:
      '"Pages that link here" panel for a target article slug',
    layouts: ['wiki-backlinks'],
    optional: {
      meta: ['wiki'],
    },
  },
};

// ─── Extended registry ───────────────────────────────────────────

export const wikiRegistry = createRegistry({
  ...defaultRegistry,
  'wiki-article': wikiArticle,
  'wiki-card-grid': wikiCardGrid,
  'wiki-index': wikiIndex,
  'wiki-toc': wikiToc,
  'wiki-backlinks': wikiBacklinks,
});

/**
 * Standalone map of wiki-only entries — useful for merging into custom
 * registries without pulling in the full default set.
 */
export const wikiEntries = {
  'wiki-article': wikiArticle,
  'wiki-card-grid': wikiCardGrid,
  'wiki-index': wikiIndex,
  'wiki-toc': wikiToc,
  'wiki-backlinks': wikiBacklinks,
};
