/**
 * Wiki card grid renderer plugin.
 *
 * Renders a grid of {@link ArticleCard} components from either:
 * - `section.children` — an array of article UniversalSections, or
 * - `section.meta.wiki.articles` — a pre-resolved article list.
 *
 * Handles the empty state gracefully. Used for featured-article grids
 * on the homepage and tag-filtered article listings.
 */

import { ArticleCard } from '../components/article-card.jsx';

export function WikiCardGridRenderer({ section }) {
  const articles = section.children ?? section.meta?.wiki?.articles ?? [];
  const title = section.subject?.title;
  const emptyMessage =
    section.meta?.wiki?.emptyMessage ?? 'No articles yet. Check back soon.';

  return (
    <section
      className="wiki-card-grid"
      aria-labelledby={title ? `wiki-card-grid-${section.id}` : undefined}
    >
      {title && (
        <h2
          id={`wiki-card-grid-${section.id}`}
          className="wiki-card-grid__title"
        >
          {title}
        </h2>
      )}
      {articles.length === 0 ? (
        <p className="wiki-card-grid__empty">{emptyMessage}</p>
      ) : (
        <ul className="wiki-card-grid__list" role="list">
          {articles.map((article) => (
            <li key={article.id}>
              <ArticleCard article={article} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
