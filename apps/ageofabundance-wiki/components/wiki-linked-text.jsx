/**
 * WikiLinkedText — render a string of prose with `[[target]]` wiki-links
 * resolved against an article index.
 *
 * This is a pure RSC: it emits semantic HTML only (no client JS, no
 * hydration cost). Unresolved targets render as a non-navigable
 * "redlink" span so broken links are visually distinct, announced to
 * screen readers, and editorially actionable — never silently dropped.
 *
 * The component delegates all parsing and resolution to
 * {@link resolveWikiLinks} so rendering stays a trivial token→node map.
 */

import { resolveWikiLinks } from '../content/wiki-links.js';

/**
 * @param {{
 *   text: string | null | undefined,
 *   resolver: { resolve: (raw: string) => { slug: string, exists: boolean, title: string | null } } | null | undefined,
 * }} props
 */
export function WikiLinkedText({ text, resolver }) {
  if (typeof text !== 'string' || text.length === 0) return null;

  const tokens = resolveWikiLinks(text, resolver ?? null);

  return (
    <>
      {tokens.map((token, i) => {
        if (token.type === 'text') {
          // Fragment-friendly plain string; React collapses adjacent strings.
          return token.value;
        }

        if (token.exists) {
          return (
            <a
              key={i}
              className="wiki-link"
              href={`/a/${token.slug}`}
              data-wiki-link="valid"
            >
              {token.display}
            </a>
          );
        }

        // Redlink: article does not (yet) exist. Surfaced as a non-navigable
        // span with an SR-only explanation. Still visible to editors and AT
        // as a legitimate, actionable gap.
        return (
          <span
            key={i}
            className="wiki-link wiki-link--broken"
            data-wiki-link="broken"
            data-wiki-target={token.slug}
            title={`Article not yet written: ${token.display}`}
          >
            {token.display}
            <span className="wiki-sr-only"> (article not yet written)</span>
          </span>
        );
      })}
    </>
  );
}
