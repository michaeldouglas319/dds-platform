'use client';

import type { RendererProps, Paragraph, Citation } from '@dds/types';
import { cn } from '../lib/utils';

/**
 * Wiki Article Renderer — long-form editorial body
 *
 * Renders a UniversalSection as a semantic <article> landmark with
 * accessibility-first editorial typography:
 *
 * - `subject.title`    → h1 headline
 * - `subject.subtitle` → deck / dek under the headline
 * - `subject.summary`  → lede paragraph (larger, more contrast)
 * - `content.body`     → optional opening paragraph after the lede
 * - `content.paragraphs[]` → body sections
 *     - `paragraph.subtitle`    → h2 with a stable, slugged anchor ID and a
 *                                 permalink affordance visible on hover/focus
 *     - `paragraph.description` → body copy
 *     - `paragraph.citations[]` → footnote markers
 * - `content.items[]`  → optional "see also" list at the end of the article
 *
 * Design system pillars honored:
 *  - Pure CSS custom properties (`--wiki-*`) with sensible defaults; apps may
 *    override these via `data-theme-variant` selectors.
 *  - ≤75ch measure for long-form copy.
 *  - WCAG AA contrast out of the box.
 *  - `prefers-reduced-motion` guard on every transition.
 *  - Mobile-first; all touch targets ≥44px.
 *  - No JavaScript needed for the anchor permalinks — they are real `<a>`
 *    elements with a visible focus ring.
 *
 * Backward compatibility: this is an additive plugin. The UniversalSection
 * schema is unchanged. Existing renderers are untouched.
 */
export function WikiArticleRenderer({ section }: RendererProps) {
  const { subject, content, display, meta } = section;
  const title = subject?.title;
  const subtitle = subject?.subtitle;
  const summary = subject?.summary;
  const body = content?.body;
  const paragraphs: Paragraph[] = content?.paragraphs ?? [];
  const items = content?.items ?? [];
  const align = display?.textAlign ?? 'start';
  const seeAlsoLabel =
    (meta?.seeAlsoLabel as string | undefined) ?? 'See also';

  // Stable id for the article landmark; apps may override via meta.articleId.
  const articleId =
    (meta?.articleId as string | undefined) ?? `wiki-article-${section.id}`;

  return (
    <article
      id={articleId}
      data-section="wiki-article"
      aria-labelledby={`${articleId}-heading`}
      className={cn('wiki-article', align === 'center' && 'wiki-article--center')}
    >
      <style>{WIKI_ARTICLE_CSS}</style>

      <header className="wiki-article__header">
        {subject?.category && (
          <p className="wiki-article__category">{subject.category}</p>
        )}

        {title && (
          <h1
            id={`${articleId}-heading`}
            className="wiki-article__title"
          >
            {title}
          </h1>
        )}

        {subtitle && (
          <p className="wiki-article__subtitle">{subtitle}</p>
        )}

        {summary && (
          <p className="wiki-article__lede">{summary}</p>
        )}
      </header>

      <div className="wiki-article__body">
        {body && (
          <p className="wiki-article__paragraph wiki-article__paragraph--opener">
            {body}
          </p>
        )}

        {paragraphs.map((p, i) => {
          const headingText = p.subtitle;
          const anchor = headingText ? slugify(headingText) : `section-${i}`;
          const headingId = `${articleId}-${anchor}`;
          return (
            <section
              key={anchor + '-' + i}
              className="wiki-article__section"
              aria-labelledby={headingText ? headingId : undefined}
            >
              {headingText && (
                <h2 id={headingId} className="wiki-article__heading">
                  {headingText}
                  <a
                    href={`#${headingId}`}
                    className="wiki-article__permalink"
                    aria-label={`Permalink to section: ${headingText}`}
                  >
                    <span aria-hidden="true">#</span>
                  </a>
                </h2>
              )}
              {p.description && (
                <p className="wiki-article__paragraph">{p.description}</p>
              )}
              {p.citations && p.citations.length > 0 && (
                <ol className="wiki-article__citations" aria-label="Citations">
                  {p.citations.map((c: Citation, ci: number) => (
                    <li key={ci} className="wiki-article__citation">
                      <a
                        href={c.url}
                        className="wiki-article__citation-link"
                        rel="noopener noreferrer"
                      >
                        {c.text}
                      </a>
                    </li>
                  ))}
                </ol>
              )}
            </section>
          );
        })}

        {items.length > 0 && (
          <section
            className="wiki-article__see-also"
            aria-labelledby={`${articleId}-see-also`}
          >
            <h2
              id={`${articleId}-see-also`}
              className="wiki-article__heading"
            >
              {seeAlsoLabel}
            </h2>
            <ul className="wiki-article__see-also-list">
              {items.map((item, i) => (
                <li key={i} className="wiki-article__see-also-item">
                  {item}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </article>
  );
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    || 'section';
}

/**
 * Scoped CSS for the wiki article. Uses CSS custom properties so consuming
 * apps can retheme via `data-theme-variant` selectors without forking the
 * plugin. Every value has a safe fallback so the renderer works in any
 * environment, including a minimal wiki app with no theme provider.
 */
const WIKI_ARTICLE_CSS = `
.wiki-article {
  --wiki-measure: 70ch;
  --wiki-fg: var(--color-fg, #0a0a0a);
  --wiki-fg-muted: var(--color-fg-muted, #3f3f46);
  --wiki-fg-subtle: var(--color-fg-subtle, #52525b);
  --wiki-bg: var(--color-bg, #ffffff);
  --wiki-accent: var(--color-brand-primary, #4338ca);
  --wiki-rule: var(--color-rule, rgba(9, 9, 11, 0.12));
  --wiki-focus: var(--color-focus, #2563eb);
  --wiki-font-body: var(--font-serif, Georgia, 'Iowan Old Style', 'Palatino Linotype', 'Times New Roman', serif);
  --wiki-font-display: var(--font-display, var(--font-sans, system-ui, -apple-system, 'Segoe UI', sans-serif));

  display: block;
  max-width: min(100%, calc(var(--wiki-measure) + 6rem));
  margin: 0 auto;
  padding: clamp(1.25rem, 4vw, 3rem);
  color: var(--wiki-fg);
  background: var(--wiki-bg);
  font-family: var(--wiki-font-body);
  font-size: clamp(1rem, 0.97rem + 0.15vw, 1.0625rem);
  line-height: 1.7;
}
.wiki-article--center { text-align: center; }

.wiki-article__header {
  margin-bottom: 2.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--wiki-rule);
}
.wiki-article__category {
  margin: 0 0 0.75rem;
  font-family: var(--wiki-font-display);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--wiki-accent);
}
.wiki-article__title {
  margin: 0 0 0.5rem;
  font-family: var(--wiki-font-display);
  font-size: clamp(2rem, 1.5rem + 2.5vw, 3.25rem);
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.02em;
  color: var(--wiki-fg);
}
.wiki-article__subtitle {
  margin: 0 0 1rem;
  font-family: var(--wiki-font-display);
  font-size: clamp(1.125rem, 1rem + 0.5vw, 1.375rem);
  font-weight: 400;
  line-height: 1.4;
  color: var(--wiki-fg-muted);
}
.wiki-article__lede {
  margin: 1rem 0 0;
  max-width: var(--wiki-measure);
  font-size: 1.125rem;
  line-height: 1.65;
  color: var(--wiki-fg);
  font-style: italic;
}

.wiki-article__body {
  max-width: var(--wiki-measure);
}
.wiki-article__section {
  margin-top: 2.25rem;
}
.wiki-article__heading {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  margin: 2.5rem 0 0.75rem;
  font-family: var(--wiki-font-display);
  font-size: clamp(1.375rem, 1.25rem + 0.6vw, 1.75rem);
  font-weight: 700;
  line-height: 1.25;
  letter-spacing: -0.01em;
  scroll-margin-top: 2rem;
  color: var(--wiki-fg);
}
.wiki-article__permalink {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 44px;
  min-height: 44px;
  padding: 0.25rem;
  margin-left: 0.25rem;
  font-size: 0.9em;
  font-weight: 400;
  line-height: 1;
  color: var(--wiki-fg-subtle);
  text-decoration: none;
  border-radius: 0.25rem;
  opacity: 0;
  transition: opacity 120ms ease, color 120ms ease;
}
.wiki-article__heading:hover .wiki-article__permalink,
.wiki-article__heading:focus-within .wiki-article__permalink,
.wiki-article__permalink:focus-visible {
  opacity: 1;
}
.wiki-article__permalink:hover { color: var(--wiki-accent); }
.wiki-article__permalink:focus-visible {
  outline: 2px solid var(--wiki-focus);
  outline-offset: 2px;
  color: var(--wiki-accent);
}

.wiki-article__paragraph {
  margin: 0 0 1rem;
  color: var(--wiki-fg);
}
.wiki-article__paragraph--opener {
  font-size: 1.0625rem;
  color: var(--wiki-fg);
}

.wiki-article__citations {
  margin: 0.5rem 0 1.5rem;
  padding-left: 1.25rem;
  font-size: 0.875rem;
  color: var(--wiki-fg-muted);
}
.wiki-article__citation { margin-bottom: 0.25rem; }
.wiki-article__citation-link {
  color: var(--wiki-accent);
  text-decoration: underline;
  text-underline-offset: 2px;
}
.wiki-article__citation-link:focus-visible {
  outline: 2px solid var(--wiki-focus);
  outline-offset: 2px;
}

.wiki-article__see-also {
  margin-top: 3rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--wiki-rule);
}
.wiki-article__see-also-list {
  margin: 0;
  padding-left: 1.25rem;
}
.wiki-article__see-also-item {
  margin-bottom: 0.375rem;
  color: var(--wiki-fg);
}

@media (prefers-reduced-motion: reduce) {
  .wiki-article__permalink { transition: none; }
}
`;
