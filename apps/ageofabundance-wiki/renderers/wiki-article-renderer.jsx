/**
 * Wiki article renderer plugin.
 *
 * Wraps the existing {@link WikiArticle} component as a @dds/renderer
 * registry entry. Accepts a UniversalSection with
 * `display.layout === 'wiki-article'` and delegates all rendering to
 * the battle-tested WikiArticle RSC.
 *
 * This renderer is the bridge between the @dds/renderer registry system
 * and the wiki's bespoke article component. It enables the wiki to
 * progressively adopt SectionBatchRenderer without rewriting WikiArticle.
 */

import { WikiArticle } from '../components/wiki-article.jsx';

export function WikiArticleRenderer({ section }) {
  return <WikiArticle article={section} />;
}
