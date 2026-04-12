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
 * HTML only. No client JS, no hydration cost — except for the optional
 * Table of Contents scroll-spy, which is a self-contained client island.
 *
 * All wiki metadata (reading time, updated date, authors, tags, word
 * count, summary) is read through {@link deriveWikiMeta} so the header
 * stays consistent for articles that ship with explicit metadata and
 * those that let the helper derive it.
 */

import { deriveWikiMeta } from '../content/wiki-meta.js';
import { WikiText } from './wiki-text.jsx';
import { TableOfContents } from './table-of-contents.jsx';

/* ── Heading utilities ─────────────────────────────────────────── */

/**
 * Convert heading text to a URL-safe id.
 * @param {string} text
 * @returns {string}
 */
function slugifyHeading(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Build a parallel array of heading entries (or null) for each paragraph.
 * Entries with a subtitle get `{ id, text }`; entries without get `null`.
 * Duplicate slugs receive a numeric suffix to stay unique.
 *
 * @param {{ subtitle?: string }[]} paragraphs
 * @returns {(null | { id: string, text: string })[]}
 */
function buildHeadingMap(paragraphs) {
  /** @type {(null | { id: string, text: string })[]} */
  const map = [];
  /** @type {Map<string, number>} */
  const seen = new Map();

  for (const p of paragraphs) {
    if (!p.subtitle) {
      map.push(null);
      continue;
    }
    let slug = slugifyHeading(p.subtitle);
    const count = seen.get(slug) ?? 0;
    seen.set(slug, count + 1);
    if (count > 0) slug = `${slug}-${count}`;
    map.push({ id: slug, text: p.subtitle });
  }
  return map;
}

/* ── Component ─────────────────────────────────────────────────── */

export function WikiArticle({ article }) {
  const title = article?.subject?.title;
  const subtitle = article?.subject?.subtitle;
  const category = article?.subject?.category;
  const body = article?.content?.body;
  const paragraphs = article?.content?.paragraphs ?? [];
  const meta = deriveWikiMeta(article);

  const headingMap = buildHeadingMap(paragraphs);
  const headings = headingMap.filter(Boolean);
  const showToc = meta.toc !== 'off' && headings.length > 0;

  return (
    <article
      className={`wiki-article${showToc ? ' wiki-article--has-toc' : ''}`}
      aria-labelledby="wiki-article-title"
    >
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

      <div className="wiki-article__content-area">
        <div className="wiki-article__body">
          {body && (
            <WikiText text={body} as="p" className="wiki-article__lede" />
          )}

          {paragraphs.map((p, i) => (
            <section key={headingMap[i]?.id ?? i} className="wiki-article__section">
              {p.subtitle && (
                <h2
                  id={headingMap[i]?.id}
                  className="wiki-article__h2"
                  tabIndex={-1}
                >
                  {p.subtitle}
                </h2>
              )}
              {p.description && (
                <WikiText text={p.description} as="p" className="wiki-article__p" />
              )}
            </section>
          ))}
        </div>

        {showToc && (
          <aside className="wiki-article__toc-sidebar" aria-label="Article navigation">
            <TableOfContents headings={headings} />
          </aside>
        )}
      </div>

      <footer className="wiki-article__footer">
        <a className="wiki-article__back" href="/">
          <span aria-hidden="true">&larr;</span> Back to the wiki
        </a>
      </footer>
    </article>
  );
}
