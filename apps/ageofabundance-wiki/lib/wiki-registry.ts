/**
 * Wiki renderer registry — composes the @dds/renderer default registry with
 * wiki-specific plugins. Pure additive: never mutates defaultRegistry.
 *
 * Adding a new wiki renderer:
 *   1. Implement the plugin in lib/<your-renderer>.tsx, exporting an entry.
 *   2. Spread it into the object below under its layout key.
 *   3. Reference the layout via `display.layout: '<your-key>'` in your schema.
 */
import { createRegistry, defaultRegistry } from '@dds/renderer';
import type { RendererRegistry } from '@dds/types';
import { wikiArticleEntry } from './wiki-renderer';

export const wikiRegistry: RendererRegistry = createRegistry({
  ...defaultRegistry,
  'wiki-article': wikiArticleEntry,
});
