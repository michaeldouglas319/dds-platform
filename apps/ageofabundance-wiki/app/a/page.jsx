import {
  listArticlesSortedByDate,
  listAllTags,
} from '../../content/articles.js';
import { deriveWikiMeta } from '../../content/wiki-meta.js';
import { TagFilter } from '../../components/tag-filter.jsx';

export const metadata = {
  title: 'All articles — ageofabundance.wiki',
  description: 'Every article in the Age of Abundance wiki, sorted by date and filterable by tag.',
};

export default function ArticleIndexPage() {
  const sorted = listArticlesSortedByDate(deriveWikiMeta);
  const allTags = listAllTags(deriveWikiMeta);

  return (
    <main id="main-content" className="wiki-index">
      <nav className="wiki-breadcrumb" aria-label="Breadcrumb">
        <ol className="wiki-breadcrumb__list">
          <li>
            <a href="/">ageofabundance.wiki</a>
          </li>
          <li aria-current="page">All articles</li>
        </ol>
      </nav>

      <header className="wiki-index__header">
        <h1 className="wiki-index__title">All articles</h1>
        <p className="wiki-index__lede">
          Every article in the wiki, newest first.
        </p>
      </header>

      <TagFilter items={sorted} allTags={allTags} />
    </main>
  );
}
