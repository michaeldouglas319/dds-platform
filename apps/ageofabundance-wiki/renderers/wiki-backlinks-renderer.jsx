/**
 * Wiki backlinks renderer plugin.
 *
 * Wraps {@link WikiBacklinks} as a standalone @dds/renderer registry
 * entry. Resolves the target article from `section.meta.wiki.targetSlug`
 * (falling back to `section.id`) and renders the "Pages that link here"
 * panel.
 *
 * Intended for standalone backlinks sections — when used inside a full
 * wiki-article layout, the WikiArticle component handles backlinks
 * internally.
 *
 * Renders nothing if no articles link to the target.
 */

import { getBacklinksForSlug } from '../content/wiki-links.js';
import { WikiBacklinks } from '../components/wiki-backlinks.jsx';

export function WikiBacklinksRenderer({ section }) {
  const targetSlug = section.meta?.wiki?.targetSlug ?? section.id;
  const backlinks = getBacklinksForSlug(targetSlug);
  return <WikiBacklinks backlinks={backlinks} />;
}
