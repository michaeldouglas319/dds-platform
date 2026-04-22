/**
 * Wiki index renderer plugin.
 *
 * Renders the full article index: a sorted list of all articles with
 * client-side tag filtering via {@link TagFilter}. The renderer loads
 * articles and tags internally — the section only needs to exist as a
 * routing/layout placeholder.
 *
 * Section data used:
 * - `subject.title` — page heading (defaults to "All articles")
 * - `subject.subtitle` — lede text (defaults to "Every article…")
 */

import {
  listArticlesSortedByDate,
  listAllTags,
} from '../content/articles.js';
import { deriveWikiMeta } from '../content/wiki-meta.js';
import { TagFilter } from '../components/tag-filter.jsx';

export function WikiIndexRenderer({ section }) {
  const sorted = listArticlesSortedByDate(deriveWikiMeta);
  const allTags = listAllTags(deriveWikiMeta);
  const title = section.subject?.title ?? 'All articles';
  const lede =
    section.subject?.subtitle ?? 'Every article in the wiki, newest first.';

  return (
    <div className="wiki-index">
      <header className="wiki-index__header">
        <h1 className="wiki-index__title">{title}</h1>
        <p className="wiki-index__lede">{lede}</p>
      </header>
      <TagFilter items={sorted} allTags={allTags} />
    </div>
  );
}
