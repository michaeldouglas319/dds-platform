/**
 * WikiContent — renders a plain-text string that may contain wiki-link
 * markers (`[[Page Name]]` / `[[slug|Display Text]]`) as React elements.
 *
 * This is an RSC: no client JS, no hydration cost. It calls the parser
 * at render time (build time for static pages) and emits semantic `<a>`
 * elements with appropriate class names and ARIA for valid and broken
 * wiki-links.
 *
 * Valid links:   class="wiki-link"
 * Broken links:  class="wiki-link wiki-link--broken"
 *                aria-label includes "(page does not exist)"
 *                data-broken-link attribute for CSS targeting
 */

import { parseWikiLinks, hasWikiLinks } from '../content/wiki-links.js';

/**
 * Render a text string with wiki-link syntax as React elements.
 *
 * When the input contains no `[[…]]` markers, returns the plain string
 * without wrapping — no extra DOM overhead.
 *
 * @param {{ text: string, as?: string, className?: string }} props
 *   `text`      — Raw content string (may include `[[…]]` markers).
 *   `as`        — HTML tag for the wrapper element (default: `'p'`).
 *   `className` — CSS class applied to the wrapper element.
 */
export function WikiContent({ text, as: Tag = 'p', className }) {
  if (!text) return null;

  // Fast path: no wiki-links → plain text.
  if (!hasWikiLinks(text)) {
    return <Tag className={className}>{text}</Tag>;
  }

  const segments = parseWikiLinks(text);

  return (
    <Tag className={className}>
      {segments.map((seg, i) => {
        if (seg.type === 'text') {
          return seg.value;
        }

        if (seg.exists) {
          return (
            <a key={i} href={seg.href} className="wiki-link">
              {seg.display}
            </a>
          );
        }

        // Broken link — visually distinct + SR-announced.
        return (
          <a
            key={i}
            href={seg.href}
            className="wiki-link wiki-link--broken"
            data-broken-link=""
            aria-label={`${seg.display} (page does not exist)`}
          >
            {seg.display}
          </a>
        );
      })}
    </Tag>
  );
}
