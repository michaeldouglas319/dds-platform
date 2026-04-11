/**
 * Article card — featured-article list item on the wiki homepage.
 * Pure RSC. Reads UniversalSection-shaped data; emits semantic HTML only.
 *
 * All wiki metadata flows through {@link deriveWikiMeta} so cards always
 * display a reading-time badge and summary, even for articles that ship
 * without explicit `meta.wiki` values.
 */

import { deriveWikiMeta } from '../content/wiki-meta.js';

export function ArticleCard({ article }) {
  const title = article?.subject?.title;
  const subtitle = article?.subject?.subtitle;
  const category = article?.subject?.category;
  const meta = deriveWikiMeta(article);
  const summary = meta.summary;
  const reading = meta.readingTimeMinutes;
  const href = `/a/${article.id}`;

  return (
    <article className="article-card">
      <a href={href} className="article-card__link">
        {category && <p className="article-card__kicker">{category}</p>}
        <h2 className="article-card__title">{title}</h2>
        {subtitle && <p className="article-card__subtitle">{subtitle}</p>}
        {summary && <p className="article-card__summary">{summary}</p>}
        <p className="article-card__cta">
          <span className="article-card__cta-text">Continue reading</span>
          {reading > 0 && (
            <span className="article-card__reading" aria-label={`${reading} minute read`}>
              {reading} min
            </span>
          )}
        </p>
      </a>
    </article>
  );
}
