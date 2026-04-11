/**
 * WikiArticleRenderer — long-form, schema-driven wiki article plugin
 *
 * Plugs into the @dds/renderer registry as `display.layout: 'wiki-article'`.
 * Reads a UniversalSection and renders an accessible, themable, long-form
 * article. Pure additive: this file never imports or mutates the @dds core
 * registry — it returns its own RendererEntry that callers compose into a
 * registry via createRegistry({ ...defaultRegistry, 'wiki-article': entry }).
 *
 * Accessibility:
 *   - Wraps content in <article> with aria-labelledby pointing at the <h1>.
 *   - Heading level is configurable via display.headingLevel (default 1) so
 *     wiki articles can be embedded inside other landmarks without breaking
 *     the heading outline.
 *   - All colors and spacing come from CSS custom properties on the host
 *     element, so themes (light/dark + 9 variants) can override.
 *   - Body measure is constrained to var(--wiki-measure, 70ch) ≤ 75ch.
 *   - prefers-reduced-motion is honored in globals.css.
 *
 * Schema mapping (UniversalSection → article):
 *   subject.title       → <h{level}>
 *   subject.subtitle    → standfirst / lede
 *   subject.category    → eyebrow / kicker
 *   subject.tags        → tag pills in header
 *   content.body        → opening paragraph (single string)
 *   content.paragraphs  → body sections, each with optional heading + prose
 *   content.highlights  → "Key facts" aside (label/value pairs)
 *   content.items       → "On this page" / topic list
 *   display.headingLevel → starting heading level (1–6, default 1)
 */
import type {
  RendererEntry,
  RendererProps,
  UniversalSection,
} from '@dds/types';

// ─── Helpers ─────────────────────────────────────────────────────────

/** Slugify a heading for stable in-page anchor ids. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

/** Clamp heading level to 1–6 and return a valid HTML heading tag. */
function headingTag(level: number | undefined): 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' {
  const clamped = Math.min(6, Math.max(1, level ?? 1));
  return (`h${clamped}`) as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

// ─── Component ───────────────────────────────────────────────────────

export function WikiArticleRenderer({ section }: RendererProps) {
  const { subject, content, display } = section;

  const baseLevel = display?.headingLevel ?? 1;
  const TitleTag = headingTag(baseLevel);
  const SectionHeadingTag = headingTag(baseLevel + 1);

  const title = subject?.title ?? 'Untitled';
  const titleId = `wiki-article-${section.id}`;
  const tags = subject?.tags;
  const tagEntries = tags ? Object.entries(tags) : [];

  return (
    <article
      className="wiki-article"
      aria-labelledby={titleId}
      data-testid={`wiki-article-${section.id}`}
    >
      <header className="wiki-article__header">
        {subject?.category && (
          <p className="wiki-article__kicker" aria-hidden="false">
            {subject.category}
          </p>
        )}

        <TitleTag id={titleId} className="wiki-article__title">
          {title}
        </TitleTag>

        {subject?.subtitle && (
          <p className="wiki-article__standfirst">{subject.subtitle}</p>
        )}

        {tagEntries.length > 0 && (
          <ul
            className="wiki-article__tags"
            aria-label={`Tags for ${title}`}
          >
            {tagEntries.map(([key, value]) => (
              <li key={key} className="wiki-article__tag">
                <span className="wiki-article__tag-key">{key}</span>
                <span className="wiki-article__tag-value">{value}</span>
              </li>
            ))}
          </ul>
        )}
      </header>

      <div className="wiki-article__body">
        {content?.body && (
          <p className="wiki-article__lede">{content.body}</p>
        )}

        {content?.paragraphs && content.paragraphs.length > 0 && (
          <>
            {content.paragraphs.map((p, i) => {
              const headingId = p.subtitle
                ? `${titleId}-section-${slugify(p.subtitle)}`
                : undefined;
              return (
                <section
                  key={`${section.id}-p-${i}`}
                  className="wiki-article__section"
                  aria-labelledby={headingId}
                >
                  {p.subtitle && (
                    <SectionHeadingTag
                      id={headingId}
                      className="wiki-article__section-heading"
                    >
                      {p.subtitle}
                    </SectionHeadingTag>
                  )}
                  {p.description && (
                    <p className="wiki-article__paragraph">{p.description}</p>
                  )}
                  {p.citations && p.citations.length > 0 && (
                    <ol
                      className="wiki-article__citations"
                      aria-label="Citations"
                    >
                      {p.citations.map((c, ci) => (
                        <li key={`${section.id}-cite-${i}-${ci}`}>
                          <a href={c.url} rel="noopener">
                            {c.text}
                          </a>
                        </li>
                      ))}
                    </ol>
                  )}
                </section>
              );
            })}
          </>
        )}
      </div>

      {(content?.highlights?.length ?? 0) > 0 && (
        <aside
          className="wiki-article__aside"
          aria-label="Key facts"
        >
          <p className="wiki-article__aside-title">Key facts</p>
          <dl className="wiki-article__facts">
            {content!.highlights!.map((h, i) => (
              <div className="wiki-article__fact" key={`${section.id}-fact-${i}`}>
                {h.subtitle && (
                  <dt className="wiki-article__fact-term">{h.subtitle}</dt>
                )}
                {h.description && (
                  <dd className="wiki-article__fact-desc">{h.description}</dd>
                )}
              </div>
            ))}
          </dl>
        </aside>
      )}

      {content?.items && content.items.length > 0 && (
        <nav className="wiki-article__topics" aria-label="Related topics">
          <p className="wiki-article__topics-title">Related topics</p>
          <ul className="wiki-article__topics-list">
            {content.items.map((item, i) => (
              <li key={`${section.id}-topic-${i}`}>{item}</li>
            ))}
          </ul>
        </nav>
      )}
    </article>
  );
}

// ─── Plugin entry ────────────────────────────────────────────────────

export const wikiArticleEntry: RendererEntry = {
  component: WikiArticleRenderer,
  metadata: {
    name: 'wiki-article',
    displayName: 'Wiki Article',
    description:
      'Long-form, schema-driven wiki article (WCAG AA, theme-aware, ≤75ch measure).',
    layouts: ['wiki-article'],
    optional: {
      subject: ['title', 'subtitle', 'category', 'tags'],
      content: ['body', 'paragraphs', 'highlights', 'items'],
      display: ['headingLevel'],
    },
  },
};

/** Type re-export for convenience to consumers building their own registries. */
export type { UniversalSection };
