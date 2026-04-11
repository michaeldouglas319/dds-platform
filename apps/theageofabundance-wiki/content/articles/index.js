/**
 * Article registry for the wiki.
 *
 * New articles: add the `UniversalSection` data module here. The dynamic
 * `/article/[slug]` route uses `getArticle(slug)` to look the section up and
 * hand it to `SectionBatchRenderer` — nothing else needs to change.
 *
 * `listArticleSlugs()` powers `generateStaticParams` so every article is
 * static-generated at build time for fast first paint and cheap hosting.
 */

import { welcome } from './welcome.js';

/** @type {Record<string, import('@dds/types').UniversalSection>} */
const ARTICLES = {
  welcome,
};

/**
 * @param {string} slug
 * @returns {import('@dds/types').UniversalSection | undefined}
 */
export function getArticle(slug) {
  return ARTICLES[slug];
}

/** @returns {string[]} */
export function listArticleSlugs() {
  return Object.keys(ARTICLES);
}
