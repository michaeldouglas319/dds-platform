/**
 * Wiki article renderer.
 *
 * Consumes a UniversalSection whose `display.layout === "wiki-article"`
 * and renders it as a long-form editorial page. This is a LOCAL component
 * in the wiki app — it does not fork `@dds/renderer` or modify its
 * registry. If a future wiki plugin is added to the core renderer, this
 * component is its direct blueprint.
 *
 * The component is an RSC: it takes serialized data and emits semantic
 * HTML only. No client JS, no hydration cost.
 *
 * All metadata is resolved through `normalizeWikiMeta` so this file,
 * the article card, the index, and any future consumer read from the
 * same source of truth.
 */

import { formatWordCount, normalizeWikiMeta } from '../content/wiki-meta.js';

/**
 * Join a list of authors into a natural-language string:
 *   ['ada']                -> 'ada'
 *   ['ada', 'grace']       -> 'ada and grace'
 *   ['ada', 'grace', 'hu'] -> 'ada, grace, and hu'
 */
function joinAuthors(authors) {
  if (!authors || authors.length === 0) return null;
  if (authors.length === 1) return authors[0];
  if (authors.length === 2) return `${authors[0]} and ${authors[1]}`;
  const head = authors.slice(0, -1).join(', ');
  return `${head}, and ${authors[authors.length - 1]}`;
}

export function WikiArticle({ article }) {
  const title = article?.subject?.title;
  const subtitle = article?.subject?.subtitle;
  const category = article?.subject?.category;
  const body = article?.content?.body;
  const paragraphs = article?.content?.paragraphs ?? [];

  const meta = normalizeWikiMeta(article);
  const {
    lastUpdatedISO,
    lastUpdatedDisplay,
    authors,
    tags,
    wordCount,
    readingTimeMinutes,
  } = meta;
  const authorList = joinAuthors(authors);

  return (
    <article className="wiki-article" aria-labelledby="wiki-article-title">
      <header className="wiki-article__header">
        {category && (
          <p className="wiki-article__kicker">{category}</p>
        )}
        <h1 id="wiki-article-title" className="wiki-article__title">
          {title}
        </h1>
        {subtitle && (
          <p className="wiki-article__subtitle">{subtitle}</p>
        )}
        <dl className="wiki-article__meta" aria-label="Article metadata">
          {lastUpdatedDisplay && (
            <div className="wiki-article__meta-row" data-meta="updated">
              <dt>Last updated</dt>
              <dd>
                <time dateTime={lastUpdatedISO}>{lastUpdatedDisplay}</time>
              </dd>
            </div>
          )}
          {authorList && (
            <div className="wiki-article__meta-row" data-meta="authors">
              <dt>By</dt>
              <dd>{authorList}</dd>
            </div>
          )}
          {readingTimeMinutes > 0 && (
            <div className="wiki-article__meta-row" data-meta="reading">
              <dt>Reading time</dt>
              <dd>
                <span aria-label={`${readingTimeMinutes} minute read`}>
                  {readingTimeMinutes} min
                </span>
              </dd>
            </div>
          )}
          {wordCount > 0 && (
            <div className="wiki-article__meta-row" data-meta="wordcount">
              <dt>Length</dt>
              <dd>{formatWordCount(wordCount)}</dd>
            </div>
          )}
          {tags.length > 0 && (
            <div className="wiki-article__meta-row" data-meta="tags">
              <dt>Tags</dt>
              <dd>
                <ul className="wiki-article__tags" aria-label="Article tags">
                  {tags.map((tag) => (
                    <li key={tag} className="wiki-article__tag">
                      {tag}
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
          )}
        </dl>
      </header>

      <div className="wiki-article__body">
        {body && <p className="wiki-article__lede">{body}</p>}

        {paragraphs.map((p, i) => (
          <section key={i} className="wiki-article__section">
            {p.subtitle && (
              <h2 className="wiki-article__h2">{p.subtitle}</h2>
            )}
            {p.description && (
              <p className="wiki-article__p">{p.description}</p>
            )}
          </section>
        ))}
      </div>

      <footer className="wiki-article__footer">
        <a className="wiki-article__back" href="/">
          <span aria-hidden="true">←</span> Back to the wiki
        </a>
      </footer>
    </article>
  );
}
