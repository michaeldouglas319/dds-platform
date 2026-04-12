/**
 * Wiki table of contents — RSC, zero client JS.
 *
 * On mobile: a collapsible <details>/<summary> widget (starts expanded).
 * On wide screens (≥72rem): sticky sidebar alongside article body,
 * always visible (toggle disabled via CSS).
 *
 * Uses native HTML disclosure: no JavaScript needed for collapse.
 * Anchor scroll uses the browser's native fragment navigation with
 * `scroll-behavior: smooth` on `<html>`, guarded by the existing
 * `prefers-reduced-motion: reduce` rule that resets to `auto`.
 */

export function WikiToc({ entries }) {
  if (!entries || entries.length === 0) return null;

  return (
    <nav className="wiki-toc" aria-label="Table of contents">
      <details className="wiki-toc__details" open>
        <summary className="wiki-toc__toggle">
          <span className="wiki-toc__toggle-icon" aria-hidden="true" />
          <span className="wiki-toc__toggle-text">Contents</span>
        </summary>
        <ol className="wiki-toc__list">
          {entries.map((entry) => (
            <li key={entry.id} className="wiki-toc__item">
              <a href={`#${entry.id}`} className="wiki-toc__link">
                {entry.text}
              </a>
            </li>
          ))}
        </ol>
      </details>
    </nav>
  );
}
