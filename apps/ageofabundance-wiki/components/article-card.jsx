/**
 * Article card — featured-article list item on the wiki homepage and
 * the article index. Pure RSC. Reads UniversalSection-shaped data
 * through `normalizeWikiMeta` and emits semantic HTML only.
 */

import { normalizeWikiMeta } from '../content/wiki-meta.js';

export function ArticleCard({ article }) {
  const title = article?.subject?.title;
  const subtitle = article?.subject?.subtitle;
  const category = article?.subject?.category;
  const href = `/a/${article.id}`;

  const meta = normalizeWikiMeta(article);
  const summary = meta.summary ?? article?.content?.body;
  const { tags, readingTimeMinutes, wordCount } = meta;

  return (
    <article className="article-card">
      <a href={href} className="article-card__link">
        {category && <p className="article-card__kicker">{category}</p>}
        <h2 className="article-card__title">{title}</h2>
        {subtitle && <p className="article-card__subtitle">{subtitle}</p>}
        {summary && <p className="article-card__summary">{summary}</p>}
        {tags.length > 0 && (
          <ul
            className="article-card__tags"
            aria-label="Article tags"
            role="list"
          >
            {tags.slice(0, 4).map((tag) => (
              <li key={tag} className="article-card__tag">
                {tag}
              </li>
            ))}
          </ul>
        )}
        <p className="article-card__cta">
          <span className="article-card__cta-text">Continue reading</span>
          {readingTimeMinutes > 0 && (
            <span
              className="article-card__reading"
              aria-label={`${readingTimeMinutes} minute read, ${wordCount} words`}
            >
              {readingTimeMinutes} min · {wordCount.toLocaleString('en-US')} words
            </span>
          )}
        </p>
      </a>
    </article>
  );
}
