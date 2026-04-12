/**
 * Backlinks panel — "Pages that link here".
 *
 * Renders a list of articles that wiki-link to the current page, placed
 * at the article footer. Each item shows the linking article's title and
 * a one-line summary excerpt so readers can gauge relevance at a glance.
 *
 * RSC only — zero client JS, zero hydration cost.
 *
 * Empty state: when no articles link here, the component renders nothing
 * (returns null) so it leaves no DOM footprint.
 */

export function WikiBacklinks({ backlinks }) {
  if (!backlinks || backlinks.length === 0) return null;

  return (
    <section
      className="wiki-backlinks"
      aria-labelledby="backlinks-heading"
    >
      <h2 id="backlinks-heading" className="wiki-backlinks__heading">
        Pages that link here
      </h2>
      <ul className="wiki-backlinks__list">
        {backlinks.map((link) => (
          <li key={link.slug} className="wiki-backlinks__item">
            <a href={`/a/${link.slug}`} className="wiki-backlinks__link">
              <span className="wiki-backlinks__title">{link.title}</span>
              {link.summary && (
                <span className="wiki-backlinks__summary">{link.summary}</span>
              )}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
