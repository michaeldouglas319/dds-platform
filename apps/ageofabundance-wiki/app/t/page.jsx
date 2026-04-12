import {
  listTagsWithCounts,
} from '../../content/articles.js';
import { deriveWikiMeta } from '../../content/wiki-meta.js';

export const metadata = {
  title: 'All tags — ageofabundance.wiki',
  description:
    'Browse every tag in the Age of Abundance wiki. Each tag groups related articles for easy discovery.',
};

export default function TagIndexPage() {
  const tags = listTagsWithCounts(deriveWikiMeta);

  return (
    <main id="main-content" className="wiki-index wiki-tag-index">
      <nav className="wiki-breadcrumb" aria-label="Breadcrumb">
        <ol className="wiki-breadcrumb__list">
          <li>
            <a href="/">ageofabundance.wiki</a>
          </li>
          <li aria-current="page">All tags</li>
        </ol>
      </nav>

      <header className="wiki-index__header">
        <h1 className="wiki-index__title">All tags</h1>
        <p className="wiki-index__lede">
          {tags.length} tag{tags.length === 1 ? '' : 's'} across the wiki.
        </p>
      </header>

      {tags.length === 0 ? (
        <p className="wiki-index__empty">No tags yet.</p>
      ) : (
        <ul className="wiki-tag-index__list" role="list">
          {tags.map(({ tag, count }) => (
            <li key={tag} className="wiki-tag-index__item">
              <a href={`/t/${tag}`} className="wiki-tag-index__link">
                <span className="wiki-tag-index__name">{tag}</span>
                <span
                  className="wiki-tag-index__count"
                  aria-label={`${count} article${count === 1 ? '' : 's'}`}
                >
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
