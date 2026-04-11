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
 *
 * Inline `[[wiki-links]]` inside `content.body` and
 * `content.paragraphs[].description` are parsed via {@link parseWikiLinks}
 * and rendered as `<a>` when the target exists, or a non-interactive
 * `<span class="wiki-link wiki-link--broken">` when it does not. The
 * renderer takes a `knownSlugs` set so it can run entirely statically;
 * the page component owns supplying that set.
 */

import { deriveWikiMeta } from '../content/wiki-meta.js';
import { parseWikiLinks } from '../content/wiki-links.js';

/**
 * Render a string that may contain `[[wiki-link]]` markers. Returns an
 * array of React nodes suitable for dropping directly inside any text
 * container. Pure function over serializable inputs, RSC-safe.
 *
 * @param {string} text
 * @param {Set<string>} knownSlugs
 * @param {string} keyPrefix  Stable prefix for React `key` generation.
 */
function renderWikiText(text, knownSlugs, keyPrefix) {
  const segments = parseWikiLinks(text, knownSlugs);
  if (segments.length === 0) return text;
  return segments.map((seg, i) => {
    if (seg.type === 'text') {
      return seg.value;
    }
    if (seg.broken) {
      return (
        <span
          key={`${keyPrefix}-${i}`}
          className="wiki-link wiki-link--broken"
          aria-label={`Broken wiki link: ${seg.value}`}
          title="This article does not exist yet"
          data-broken="true"
        >
          {seg.value}
        </span>
      );
    }
    return (
      <a
        key={`${keyPrefix}-${i}`}
        className="wiki-link"
        href={`/a/${seg.slug}`}
        data-wiki-link={seg.slug}
      >
        {seg.value}
      </a>
    );
  });
}

export function WikiArticle({ article, knownSlugs }) {
  const title = article?.subject?.title;
  const subtitle = article?.subject?.subtitle;
  const category = article?.subject?.category;
  const body = article?.content?.body;
  const paragraphs = article?.content?.paragraphs ?? [];
  const meta = deriveWikiMeta(article);
  const slugSet = knownSlugs instanceof Set ? knownSlugs : new Set(knownSlugs ?? []);

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
          <p className="wiki-article__lede">
            {renderWikiText(body, slugSet, 'lede')}
          </p>
        )}

        {paragraphs.map((p, i) => (
          <section key={i} className="wiki-article__section">
            {p.subtitle && (
              <h2 className="wiki-article__h2">{p.subtitle}</h2>
            )}
            {p.description && (
              <p className="wiki-article__p">
                {renderWikiText(p.description, slugSet, `p-${i}`)}
              </p>
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
