/**
 * Wiki content renderer — replaces `[[…]]` wiki-links with semantic HTML.
 *
 * Pure RSC (no client JS). Takes a plain-text string that may contain
 * wiki-link syntax and renders it as a React fragment of text nodes
 * interspersed with `<a>` (valid links) or `<span>` (broken links).
 *
 * Valid links:   <a href="/a/slug" class="wiki-link">Display Text</a>
 * Broken links:  <span class="wiki-link wiki-link--broken"
 *                  role="link" aria-disabled="true"
 *                  title="Page not found: slug">Display Text</span>
 *
 * The component receives a pre-built Set of known slugs so resolution
 * happens at render time (which is build time for static pages).
 */

import { segmentWikiContent } from '../content/wiki-links.js';

/**
 * @param {{ text: string, knownSlugs: Set<string> }} props
 */
export function WikiContent({ text, knownSlugs }) {
  if (typeof text !== 'string' || text.length === 0) return null;

  const segments = segmentWikiContent(text, knownSlugs);

  return (
    <>
      {segments.map((segment, i) => {
        // Plain text segment
        if (typeof segment === 'string') {
          return <span key={i}>{segment}</span>;
        }

        // Resolved wiki-link
        if (segment.exists) {
          return (
            <a
              key={i}
              href={segment.href}
              className="wiki-link"
              data-wiki-target={segment.slug}
            >
              {segment.display}
            </a>
          );
        }

        // Broken wiki-link
        return (
          <span
            key={i}
            className="wiki-link wiki-link--broken"
            role="link"
            aria-disabled="true"
            title={`Page not found: ${segment.slug}`}
            data-wiki-target={segment.slug}
          >
            {segment.display}
          </span>
        );
      })}
    </>
  );
}
