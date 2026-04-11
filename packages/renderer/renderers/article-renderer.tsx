import type { RendererProps } from '@dds/types';

/**
 * ArticleRenderer — long-form wiki / editorial article layout.
 *
 * Maps `UniversalSection` → semantic, accessible article markup:
 *
 *   subject.title       → <h1>
 *   subject.category    → eyebrow label above title
 *   subject.summary     → lede paragraph (falls back to subject.description)
 *   subject.tags        → tag chip row (object entries are flattened to values)
 *   content.paragraphs  → article body
 *                           - paragraph.subtitle    → <h2>
 *                           - paragraph.description → <p>
 *                           - paragraph.citations   → <ol>
 *   meta.author         → byline
 *   meta.lastUpdated    → <time> (ISO 8601)
 *   meta.readingTime    → eyebrow metadata
 *   links.primary       → footer CTA
 *
 * Accessibility contract (AA minimum, AAA on the body copy where possible):
 *  - Semantic <article> / <header> / <main> / <footer> landmarks.
 *  - Exactly one <h1> per article.
 *  - Skip-link targets the article body.
 *  - Reading measure capped at 72ch on the reading column.
 *  - External citation links use rel="noopener noreferrer" and target="_blank".
 *  - Tap targets on the CTA ≥ 44px min-block-size.
 *  - No hardcoded colors — everything is styled through CSS custom properties
 *    (see `.dds-article` rules in the consumer app's stylesheet). Consumers
 *    can retheme by overriding the custom properties.
 *  - prefers-reduced-motion is honored by the consumer stylesheet (the renderer
 *    itself emits no animations).
 *
 * Styling contract: the renderer outputs a stable set of BEM-lite class names
 * (`dds-article`, `dds-article__title`, `dds-article__body`, etc.). Consumers
 * must ship matching CSS. The reference stylesheet lives in
 * `apps/theageofabundance-wiki/app/globals.css`.
 *
 * Empty-state: if `content.paragraphs` is absent or empty, the renderer
 * surfaces a visible "This article has no body yet." status message so broken
 * content is obvious instead of silently blank.
 */
export function ArticleRenderer({ section }: RendererProps) {
  const { subject, content, links, meta } = section;

  const title = subject?.title;
  const category = subject?.category;
  const lede = subject?.summary ?? subject?.description;
  const tagEntries = subject?.tags ? Object.entries(subject.tags) : [];
  const paragraphs = content?.paragraphs ?? [];

  const lastUpdated = typeof meta?.lastUpdated === 'string' ? meta.lastUpdated : undefined;
  const readingTime = typeof meta?.readingTime === 'string' ? meta.readingTime : undefined;
  const author = typeof meta?.author === 'string' ? meta.author : undefined;

  const primary = links?.primary;

  const titleId = `dds-article-title-${section.id}`;
  const bodyId = `dds-article-body-${section.id}`;

  return (
    <article
      className="dds-article"
      aria-labelledby={title ? titleId : undefined}
      data-section-id={section.id}
    >
      <a className="dds-skip-link" href={`#${bodyId}`}>
        Skip to article body
      </a>

      <header className="dds-article__header">
        {(category || readingTime) && (
          <p className="dds-article__eyebrow">
            {category && <span className="dds-article__category">{category}</span>}
            {category && readingTime && <span aria-hidden="true"> · </span>}
            {readingTime && <span className="dds-article__reading-time">{readingTime}</span>}
          </p>
        )}

        {title && (
          <h1 id={titleId} className="dds-article__title">
            {title}
          </h1>
        )}

        {lede && <p className="dds-article__lede">{lede}</p>}

        {(author || lastUpdated) && (
          <div className="dds-article__meta">
            {author && <span className="dds-article__author">By {author}</span>}
            {author && lastUpdated && <span aria-hidden="true"> · </span>}
            {lastUpdated && (
              <span className="dds-article__updated">
                Last updated{' '}
                <time dateTime={lastUpdated}>{formatDate(lastUpdated)}</time>
              </span>
            )}
          </div>
        )}

        {tagEntries.length > 0 && (
          <ul className="dds-article__tags" aria-label="Tags">
            {tagEntries.map(([key, value]) => (
              <li key={key} className="dds-article__tag">
                {String(value)}
              </li>
            ))}
          </ul>
        )}
      </header>

      <main id={bodyId} className="dds-article__body" tabIndex={-1}>
        {paragraphs.length === 0 ? (
          <p className="dds-article__empty" role="status">
            This article has no body yet.
          </p>
        ) : (
          paragraphs.map((paragraph, i) => (
            <section key={i} className="dds-article__section">
              {paragraph.subtitle && (
                <h2 className="dds-article__section-title">{paragraph.subtitle}</h2>
              )}
              {paragraph.description && (
                <p className="dds-article__paragraph">{paragraph.description}</p>
              )}
              {paragraph.citations && paragraph.citations.length > 0 && (
                <ol
                  className="dds-article__citations"
                  aria-label={`Citations for ${paragraph.subtitle ?? `section ${i + 1}`}`}
                >
                  {paragraph.citations.map((c, j) => (
                    <li key={j} className="dds-article__citation">
                      <a
                        href={c.url}
                        rel="noopener noreferrer"
                        target="_blank"
                        className="dds-article__citation-link"
                      >
                        {c.text}
                        <span className="dds-article__external-sr" aria-hidden="false">
                          {' '}(opens in a new tab)
                        </span>
                      </a>
                    </li>
                  ))}
                </ol>
              )}
            </section>
          ))
        )}
      </main>

      {primary && (
        <footer className="dds-article__footer">
          <a href={primary.href} className="dds-article__cta">
            <span>{primary.text}</span>
            <span aria-hidden="true"> →</span>
          </a>
        </footer>
      )}
    </article>
  );
}

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}
