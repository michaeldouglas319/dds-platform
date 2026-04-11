'use client';

/**
 * Table of contents landmark for a wiki article.
 *
 * Rendered as a `<nav aria-label="Table of contents">` so assistive tech
 * can skip directly to it. Links jump to the section id produced by
 * `buildTableOfContents(article)`.
 */
export function WikiTableOfContents({ entries }) {
  if (!entries || entries.length === 0) return null;

  return (
    <nav className="wiki-toc" aria-label="Table of contents">
      <h2 className="wiki-toc__heading">Contents</h2>
      <ol className="wiki-toc__list">
        {entries.map((entry) => (
          <li className="wiki-toc__item" key={entry.id}>
            <a className="wiki-toc__link" href={`#${entry.id}`}>
              {entry.title}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
