import { listTagsWithCounts } from '../../content/articles.js';
import { deriveWikiMeta } from '../../content/wiki-meta.js';

export const metadata = {
  title: 'All tags — ageofabundance.wiki',
  description: 'Browse all topic tags across the Age of Abundance wiki.',
};

export default function TagsIndexPage() {
  const tagsWithCounts = listTagsWithCounts(deriveWikiMeta);

  return (
    <main id="main-content" className="wiki-tags-index">
      <nav className="wiki-breadcrumb" aria-label="Breadcrumb">
        <ol className="wiki-breadcrumb__list">
          <li>
            <a href="/">ageofabundance.wiki</a>
          </li>
          <li aria-current="page">All tags</li>
        </ol>
      </nav>

      <header className="wiki-tags-index__header">
        <h1 className="wiki-tags-index__title">All tags</h1>
        <p className="wiki-tags-index__lede">
          {tagsWithCounts.length} topic tag{tagsWithCounts.length === 1 ? '' : 's'} across the wiki.
        </p>
      </header>

      {tagsWithCounts.length === 0 ? (
        <p className="wiki-tags-index__empty">No tags yet.</p>
      ) : (
        <ul className="wiki-tags-index__grid" role="list">
          {tagsWithCounts.map(({ tag, count }) => (
            <li key={tag}>
              <a href={`/t/${tag}`} className="wiki-tag-card">
                <span className="wiki-tag-card__name">{tag}</span>
                <span className="wiki-tag-card__count" aria-label={`${count} article${count === 1 ? '' : 's'}`}>
                  {count}
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
