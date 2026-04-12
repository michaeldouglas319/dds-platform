/**
 * WikiText — renders plain text with [[wiki-links]] resolved to <a> tags.
 *
 * Server component (RSC). No client JS. Parses wiki-link syntax at render
 * time, resolves targets against the article dataset, and emits:
 *   • Live links (class="wiki-link") for pages that exist
 *   • Broken-link spans (class="wiki-link wiki-link--broken") for missing pages
 *
 * Broken links carry a `title` tooltip and `data-wiki-target` for testing.
 */

import { parseWikiLinks, resolveWikiLink } from '../content/wiki-links.js';
import { listArticleSlugs } from '../content/articles.js';

/**
 * @param {{ text: string, className?: string }} props
 */
export function WikiText({ text, className }) {
  if (!text) return null;

  const segments = parseWikiLinks(text);
  const slugs = listArticleSlugs();

  // Fast path: no wiki-links in the text
  const hasLinks = segments.some((s) => s.type === 'wikilink');
  if (!hasLinks) return text;

  return (
    <span className={className}>
      {segments.map((seg, i) => {
        if (seg.type === 'text') {
          return <span key={i}>{seg.value}</span>;
        }

        const resolved = resolveWikiLink(seg.target, slugs);

        if (resolved.exists) {
          return (
            <a
              key={i}
              href={`/a/${resolved.slug}`}
              className="wiki-link"
              data-wiki-target={resolved.slug}
            >
              {seg.display}
            </a>
          );
        }

        return (
          <span
            key={i}
            className="wiki-link wiki-link--broken"
            title={`"${seg.target}" does not exist yet`}
            data-wiki-target={resolved.slug}
            role="link"
            aria-disabled="true"
          >
            {seg.display}
          </span>
        );
      })}
    </span>
  );
}
