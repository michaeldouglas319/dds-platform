'use client';

/**
 * `wiki-body` renderer plugin.
 *
 * Renders a single article body section — heading (from `subject.title`),
 * an optional `content.body` paragraph, and any structured `content.paragraphs`.
 * The heading level is driven by `display.headingLevel` (defaults to h2)
 * so the core renderer registry stays honest about document outline.
 *
 * The outer element is a proper `<section>` with an `aria-labelledby`
 * pointing at the heading so screen readers announce the title first.
 */
export function WikiBody({ section }) {
  const id = section?.id;
  const title = section?.subject?.title;
  const body = section?.content?.body;
  const paragraphs = section?.content?.paragraphs ?? [];

  const level = clampHeadingLevel(section?.display?.headingLevel);
  const Heading = /** @type {keyof JSX.IntrinsicElements} */ (`h${level}`);
  const headingId = id ? `${id}-heading` : undefined;

  return (
    <section
      id={id}
      className="wiki-body"
      aria-labelledby={headingId}
      data-testid="wiki-body-section"
    >
      {title && (
        <Heading id={headingId} className="wiki-body__heading">
          {title}
        </Heading>
      )}
      {body && <p className="wiki-body__lede">{body}</p>}
      {paragraphs.length > 0 && (
        <div className="wiki-body__paragraphs">
          {paragraphs.map((paragraph, index) => (
            <div className="wiki-body__paragraph" key={`${paragraph.subtitle ?? 'p'}-${index}`}>
              {paragraph.subtitle && (
                <h3 className="wiki-body__sub-heading">{paragraph.subtitle}</h3>
              )}
              {paragraph.description && (
                <p className="wiki-body__copy">{paragraph.description}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function clampHeadingLevel(level) {
  const numeric = typeof level === 'number' ? level : 2;
  if (numeric < 2) return 2;
  if (numeric > 6) return 6;
  return numeric;
}
