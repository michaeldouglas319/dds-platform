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
 * All wiki metadata (reading time, updated date, authors, tags, word
 * count, summary) is read through {@link deriveWikiMeta} so the header
 * stays consistent for articles that ship with explicit metadata and
 * those that let the helper derive it.
 */

import { deriveWikiMeta } from '../content/wiki-meta.js';
import { buildTocEntries } from '../content/wiki-toc.js';
import { getBacklinksForSlug } from '../content/wiki-links.js';
import { WikiText } from './wiki-text.jsx';
import { WikiToc } from './wiki-toc.jsx';
import { WikiBacklinks } from './wiki-backlinks.jsx';

export function WikiArticle({ article }) {
  const title = article?.subject?.title;
  const subtitle = article?.subject?.subtitle;
  const category = article?.subject?.category;
  const body = article?.content?.body;
  const paragraphs = article?.content?.paragraphs ?? [];
  const meta = deriveWikiMeta(article);

  const tocEntries = meta.toc === 'auto' ? buildTocEntries(paragraphs) : [];
  const hasToc = tocEntries.length > 0;
  const backlinks = getBacklinksForSlug(article.id);

  // Pre-build a map from paragraph index → heading anchor ID so the h2
  // elements carry the same IDs the TOC links point at.
  const headingIdMap = new Map();
  if (hasToc) {
    let entryIdx = 0;
    for (let i = 0; i < paragraphs.length; i++) {
      const p = paragraphs[i];
      if (
        p &&
        typeof p.subtitle === 'string' &&
        p.subtitle.trim() &&
        entryIdx < tocEntries.length
      ) {
        headingIdMap.set(i, tocEntries[entryIdx].id);
        entryIdx++;
      }
    }
  }

  return (
    <article
      className={`wiki-article${hasToc ? ' wiki-article--has-toc' : ''}`}
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
                    <li key={tag}>
                      <a href={`/t/${tag}`} className="wiki-article__tag">
                        {tag}
                      </a>
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
          )}
        </dl>
      </header>

      <div className="wiki-article__content">
        {hasToc && <WikiToc entries={tocEntries} />}

        <div className="wiki-article__body">
          {body && (
            <WikiText text={body} as="p" className="wiki-article__lede" />
          )}

          {paragraphs.map((p, i) => (
            <section key={i} className="wiki-article__section">
              {p.subtitle && (
                <h2
                  id={headingIdMap.get(i)}
                  className="wiki-article__h2"
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
      </div>

      <footer className="wiki-article__footer">
        <WikiBacklinks backlinks={backlinks} />
        <a className="wiki-article__back" href="/">
          <span aria-hidden="true">←</span> Back to the wiki
        </a>
      </footer>
    </article>
  );
}
