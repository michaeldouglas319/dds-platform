/**
 * Wiki article loader.
 *
 * Each article on disk is stored as a JSON bundle consisting of a `slug`,
 * display-level metadata (`title`, `summary`, `category`, `updated`),
 * an optional `infobox` section and an array of body `sections` — all of
 * which are already valid `UniversalSection` objects. The loader never
 * mutates them; it only indexes and fetches.
 *
 * The wiki app consumes the loader from server components (static routes
 * and `generateStaticParams`), so reads happen at build time. No runtime
 * filesystem access in the browser.
 */

import abundancePrinciples from '../../content/articles/abundance-principles.json';
import universalSection from '../../content/articles/universal-section.json';

/** @typedef {import('@dds/types').UniversalSection} UniversalSection */

/**
 * @typedef {Object} WikiArticle
 * @property {string} slug
 * @property {string} title
 * @property {string} summary
 * @property {string} category
 * @property {string} updated
 * @property {UniversalSection} [infobox]
 * @property {UniversalSection[]} sections
 */

/** @type {WikiArticle[]} */
const ARTICLES = [abundancePrinciples, universalSection];

const INDEX = new Map(ARTICLES.map((a) => [a.slug, a]));

/** All known article slugs, sorted alphabetically. */
export function listArticleSlugs() {
  return [...INDEX.keys()].sort();
}

/** Lightweight summary rows for index pages. */
export function listArticleSummaries() {
  return ARTICLES.map(({ slug, title, summary, category, updated }) => ({
    slug,
    title,
    summary,
    category,
    updated,
  })).sort((a, b) => a.title.localeCompare(b.title));
}

/**
 * Look up an article by slug.
 * @param {string} slug
 * @returns {WikiArticle | undefined}
 */
export function getArticle(slug) {
  return INDEX.get(slug);
}

/**
 * Build a table-of-contents model from an article's body sections.
 * Each entry has a stable id (the section id) and the section title,
 * so the TOC can render as a `<nav>` landmark with in-page anchors.
 * @param {WikiArticle} article
 */
export function buildTableOfContents(article) {
  return article.sections
    .filter((section) => section.subject?.title)
    .map((section) => ({
      id: section.id,
      title: /** @type {string} */ (section.subject.title),
    }));
}
