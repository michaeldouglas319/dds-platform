/**
 * Wiki article registry.
 *
 * Articles are typed ES modules that export an `Article` shape (slug, title,
 * summary, sections). The registry below is the single source of truth — to
 * add an article, import it here and add it to `ARTICLES`.
 *
 * Lookups are O(1) and pure, so they are safe to call from server components,
 * generateStaticParams, and generateMetadata.
 *
 * @typedef {import('@dds/types').UniversalSection} UniversalSection
 * @typedef {{
 *   slug: string,
 *   title: string,
 *   summary: string,
 *   category?: string,
 *   updatedAt: string,
 *   sections: UniversalSection[],
 * }} Article
 */

import { welcome, universalSchema } from '../content/articles/welcome.js';

/** @type {Article[]} */
const ARTICLES = [welcome, universalSchema];

/** @type {Map<string, Article>} */
const BY_SLUG = new Map(ARTICLES.map((a) => [a.slug, a]));

/**
 * Return every article, sorted by title for a deterministic index page.
 * @returns {Article[]}
 */
export function listArticles() {
  return [...ARTICLES].sort((a, b) => a.title.localeCompare(b.title));
}

/**
 * Look up a single article by slug. Returns `null` for unknown slugs so
 * callers can render a 404 instead of throwing.
 * @param {string} slug
 * @returns {Article | null}
 */
export function getArticle(slug) {
  return BY_SLUG.get(slug) ?? null;
}

/**
 * All known slugs — used by `generateStaticParams` to pre-render every
 * article at build time.
 * @returns {string[]}
 */
export function listSlugs() {
  return ARTICLES.map((a) => a.slug);
}

/**
 * Build a table of contents from an article's sections. Each entry maps to
 * an `id` that the article shell will use as the heading anchor target.
 *
 * Empty arrays are returned (not `null`) so the article shell can render an
 * empty-state TOC without conditional logic.
 *
 * @param {Article} article
 * @returns {{ id: string, label: string }[]}
 */
export function buildTableOfContents(article) {
  return article.sections
    .map((section) => {
      const label = section.subject?.title ?? section.name;
      if (!label || typeof label !== 'string') return null;
      return { id: section.id, label };
    })
    .filter(
      /** @returns {entry is { id: string, label: string }} */
      (entry) => entry !== null,
    );
}
