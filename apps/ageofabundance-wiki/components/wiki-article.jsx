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
 */

function formatDate(iso) {
  if (!iso) return null;
  // Render in a fixed, locale-stable way so SSR/CSR agree.
  try {
    const d = new Date(iso + 'T00:00:00Z');
    if (Number.isNaN(d.getTime())) return iso;
    const month = d.toLocaleString('en-US', { month: 'long', timeZone: 'UTC' });
    return `${month} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
  } catch {
    return iso;
  }
}

export function WikiArticle({ article }) {
  const title = article?.subject?.title;
  const subtitle = article?.subject?.subtitle;
  const category = article?.subject?.category;
  const body = article?.content?.body;
  const paragraphs = article?.content?.paragraphs ?? [];
  const wikiMeta = article?.meta?.wiki ?? {};
  const tags = wikiMeta.tags ?? [];
  const updated = formatDate(wikiMeta.lastUpdatedISO);
  const reading = wikiMeta.readingTimeMinutes;

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
          {updated && (
            <div className="wiki-article__meta-row">
              <dt>Last updated</dt>
              <dd>
                <time dateTime={wikiMeta.lastUpdatedISO}>{updated}</time>
              </dd>
            </div>
          )}
          {typeof reading === 'number' && (
            <div className="wiki-article__meta-row">
              <dt>Reading time</dt>
              <dd>{reading} min</dd>
            </div>
          )}
          {tags.length > 0 && (
            <div className="wiki-article__meta-row">
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
