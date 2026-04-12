/**
 * Backlinks panel — lists every article that links to the current page.
 *
 * Built from the inverted wiki-link graph at build time. This is an RSC:
 * zero client JS, semantic HTML only. Renders as a <nav> landmark so
 * screen readers can jump to it directly.
 *
 * If there are no backlinks the component renders nothing — no empty
 * container, no noise.
 */

export function WikiBacklinks({ backlinks }) {
  if (!backlinks || backlinks.length === 0) return null;

  return (
    <nav className="wiki-backlinks" aria-label="Pages that link here">
      <h2 className="wiki-backlinks__heading">Pages that link here</h2>
      <ul className="wiki-backlinks__list">
        {backlinks.map((link) => (
          <li key={link.slug} className="wiki-backlinks__item">
            <a className="wiki-backlinks__link" href={`/a/${link.slug}`}>
              {link.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
