/**
 * Wiki TOC renderer plugin.
 *
 * Wraps {@link WikiToc} as a standalone @dds/renderer registry entry.
 * Builds TOC entries from `section.content.paragraphs` using the same
 * `buildTocEntries` utility the article page uses.
 *
 * Intended for standalone TOC sections — when used inside a full
 * wiki-article layout, the WikiArticle component handles TOC internally.
 *
 * Renders nothing if no paragraphs have subtitles.
 */

import { buildTocEntries } from '../content/wiki-toc.js';
import { WikiToc } from '../components/wiki-toc.jsx';

export function WikiTocRenderer({ section }) {
  const paragraphs = section.content?.paragraphs ?? [];
  const entries = buildTocEntries(paragraphs);
  return <WikiToc entries={entries} />;
}
