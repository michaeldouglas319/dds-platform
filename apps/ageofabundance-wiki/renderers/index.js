/**
 * Wiki renderer plugins — barrel export.
 *
 * Re-exports all wiki-specific renderer components, the extended
 * registry, and the standalone entry map.
 */

// Renderers
export { WikiArticleRenderer } from './wiki-article-renderer.jsx';
export { WikiCardGridRenderer } from './wiki-card-grid-renderer.jsx';
export { WikiIndexRenderer } from './wiki-index-renderer.jsx';
export { WikiTocRenderer } from './wiki-toc-renderer.jsx';
export { WikiBacklinksRenderer } from './wiki-backlinks-renderer.jsx';

// Registry
export { wikiRegistry, wikiEntries } from './wiki-registry.js';
