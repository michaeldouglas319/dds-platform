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
 * HTML only. The sole client-JS cost is the `TocTracker` component which
 * adds IntersectionObserver-based active-heading tracking (~1.2 kB).
 *
 * All wiki metadata (reading time, updated date, authors, tags, word
 * count, summary) is read through {@link deriveWikiMeta} so the header
 * stays consistent for articles that ship with explicit metadata and
 * those that let the helper derive it.
 */

import { deriveWikiMeta } from '../content/wiki-meta.js';
import { extractTocEntries } from '../content/wiki-toc.js';
import { WikiText } from './wiki-text.jsx';
import { TocTracker } from './toc-tracker.jsx';

/** Minimum number of headings before the TOC is shown. */
const TOC_MIN_HEADINGS = 2;

export function WikiArticle({ article }) {
  const title = article?.subject?.title;
  const subtitle = article?.subject?.subtitle;
  const category = article?.subject?.category;
  const body = article?.content?.body;
  const paragraphs = article?.content?.paragraphs ?? [];
  const meta = deriveWikiMeta(article);

  const tocEntries = extractTocEntries(article);
  const showToc = meta.toc !== 'off' && tocEntries.length >= TOC_MIN_HEADINGS;

  // Build a map from paragraph subtitle → heading ID for rendering
  const headingIdMap = new Map(tocEntries.map((e) => [e.text, e.id]));

  return (
    <div className={`wiki-article-layout${showToc ? ' wiki-article-layout--has-toc' : ''}`}>
      {showToc && (
        <aside className="wiki-article-layout__sidebar">
          <TocTracker entries={tocEntries} />
        </aside>
      )}

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
            {meta.lastUpdatedISO && (
              <div className="wiki-article__meta-row">
                <dt>Last updated</dt>
                <dd>
                  <time dateTime={meta.lastUpdatedISO}>{meta.formattedUpdated}</time>
                </dd>
              </div>
            )}
            {meta.readingTimeMinutes > 0 && (
              <div className="wiki-article__meta-row">
                <dt>Reading time</dt>
                <dd>
                  <span aria-label={`${meta.readingTimeMinutes} minute read`}>
                    {meta.readingTimeMinutes} min
                  </span>
                </dd>
              </div>
            )}
            {meta.wordCount > 0 && (
              <div className="wiki-article__meta-row">
                <dt>Word count</dt>
                <dd>
                  <span
                    className="wiki-article__word-count"
                    aria-label={`${meta.wordCount} words`}
                  >
                    {meta.wordCount.toLocaleString('en-US')}
                  </span>
                </dd>
              </div>
            )}
            {meta.authors.length > 0 && (
              <div className="wiki-article__meta-row">
                <dt>Authors</dt>
                <dd>
                  <ul className="wiki-article__authors" aria-label="Article authors">
                    {meta.authors.map((author) => (
                      <li key={author} className="wiki-article__author">
                        {author}
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
            )}
            {meta.tags.length > 0 && (
              <div className="wiki-article__meta-row">
                <dt>Tags</dt>
                <dd>
                  <ul className="wiki-article__tags" aria-label="Article tags">
                    {meta.tags.map((tag) => (
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
          {body && (
            <WikiText text={body} as="p" className="wiki-article__lede" />
          )}

          {paragraphs.map((p, i) => {
            const headingId = p.subtitle ? headingIdMap.get(p.subtitle.trim()) : undefined;
            return (
              <section key={i} className="wiki-article__section">
                {p.subtitle && (
                  <h2
                    id={headingId}
                    className="wiki-article__h2"
                  >
                    {p.subtitle}
                  </h2>
                )}
                {p.description && (
                  <WikiText text={p.description} as="p" className="wiki-article__p" />
                )}
              </section>
            );
          })}
        </div>

        <footer className="wiki-article__footer">
          <a className="wiki-article__back" href="/">
            <span aria-hidden="true">←</span> Back to the wiki
          </a>
        </footer>
      </article>
    </div>
  );
}
