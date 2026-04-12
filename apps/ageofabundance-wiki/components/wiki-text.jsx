/**
 * WikiText — renders a plain-text string with `[[wiki-link]]` syntax
 * resolved to `<a>` (resolved) or `<span>` (broken) elements.
 *
 * This is a React Server Component: zero client JS. It parses at
 * render time using the build-time slug index.
 *
 * Usage:
 *   <WikiText text="See [[Energy Abundance]] for details." />
 *   → See <a href="/a/energy-abundance" class="wiki-link">Energy Abundance</a> for details.
 *
 * Broken links render as:
 *   <span class="wiki-link wiki-link--broken" title="Page not found: nonexistent-page">
 *     Display Text
 *   </span>
 *
 * If the text contains no wiki-links, it renders as a plain string
 * with no extra DOM nodes.
 */

import { parseWikiText, hasWikiLinks } from '../content/wiki-links.js';

/**
 * @param {{ text: string, as?: string, className?: string }} props
 */
export function WikiText({ text, as: Tag, className }) {
  if (typeof text !== 'string' || text.length === 0) return null;

  // Fast path: no wiki-links → render plain text with no overhead
  if (!hasWikiLinks(text)) {
    if (Tag) {
      return <Tag className={className}>{text}</Tag>;
    }
    return text;
  }

  const segments = parseWikiText(text);

  const children = segments.map((seg, i) => {
    if (seg.type === 'text') {
      return <span key={i}>{seg.value}</span>;
    }

    if (seg.resolved) {
      return (
        <a
          key={i}
          href={`/a/${seg.slug}`}
          className="wiki-link"
        >
          {seg.display}
        </a>
      );
    }

    // Broken link — visually distinct, not clickable
    return (
      <span
        key={i}
        className="wiki-link wiki-link--broken"
        title={`Page not found: ${seg.slug}`}
        role="link"
        aria-disabled="true"
        aria-label={`${seg.display} (page not found)`}
      >
        {seg.display}
      </span>
    );
  });

  if (Tag) {
    return <Tag className={className}>{children}</Tag>;
  }

  return <>{children}</>;
}
