/**
 * WikiText — inline wiki-link renderer (RSC).
 *
 * Takes a plain-text string that may contain `[[wiki-links]]` and renders
 * it as a React fragment where each wiki-link is an `<a>` pointing to
 * `/a/<slug>`. Links whose target article does not exist receive a
 * `.wiki-link--broken` class (the classic Wikipedia "redlink").
 *
 * This is a server component — no client JS, no hydration cost.
 *
 * Usage:
 *   <WikiText text={article.content.body} knownSlugs={slugSet} />
 */

import { parseWikiText } from '../content/wiki-links.js';

/**
 * @param {{ text: string, knownSlugs: Set<string> }} props
 */
export function WikiText({ text, knownSlugs }) {
  if (!text) return null;

  const segments = parseWikiText(text, knownSlugs);

  return (
    <>
      {segments.map((seg, i) => {
        if (seg.type === 'text') {
          return <span key={i}>{seg.value}</span>;
        }

        // Wiki-link segment
        const className = seg.exists
          ? 'wiki-link'
          : 'wiki-link wiki-link--broken';

        if (seg.exists) {
          return (
            <a
              key={i}
              href={`/a/${seg.slug}`}
              className={className}
              data-wiki-link={seg.slug}
            >
              {seg.display}
            </a>
          );
        }

        // Broken link: render as a <span> with title explaining it's missing.
        // Not an <a> — there is nothing to navigate to.
        return (
          <span
            key={i}
            className={className}
            data-wiki-link={seg.slug}
            title={`Page "${seg.display}" does not exist yet`}
            role="link"
            aria-disabled="true"
          >
            {seg.display}
          </span>
        );
      })}
    </>
  );
}
