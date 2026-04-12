/**
 * Renders a plain-text string with embedded `[[wiki-links]]` resolved to
 * internal `<a>` elements. Unresolvable slugs render as broken-link spans
 * with distinct visual treatment.
 *
 * This is a React Server Component — no client JS, no hydration cost.
 * It receives the set of known slugs at render time and resolves inline.
 *
 * Usage:
 *   <WikiLinkText text={paragraph} knownSlugs={slugSet} />
 */

import { extractWikiLinks } from '../content/wiki-links.js';

/**
 * @param {{ text: string, knownSlugs: Set<string> }} props
 */
export function WikiLinkText({ text, knownSlugs }) {
  if (!text) return null;

  const links = extractWikiLinks(text, knownSlugs);

  // No wiki-links — return the string as-is (no wrapper element)
  if (links.length === 0) return text;

  // Build an array of text segments and link elements
  const parts = [];
  let cursor = 0;

  for (const link of links) {
    // Text before this link
    if (link.start > cursor) {
      parts.push(text.slice(cursor, link.start));
    }

    if (link.exists) {
      parts.push(
        <a
          key={`wl-${link.start}`}
          href={`/a/${link.slug}`}
          className="wiki-link"
        >
          {link.display}
        </a>,
      );
    } else {
      parts.push(
        <span
          key={`wl-${link.start}`}
          className="wiki-link wiki-link--broken"
          title={`Article "${link.display}" does not exist yet`}
          data-wiki-target={link.slug}
        >
          {link.display}
        </span>,
      );
    }

    cursor = link.end;
  }

  // Trailing text after the last link
  if (cursor < text.length) {
    parts.push(text.slice(cursor));
  }

  return <>{parts}</>;
}
