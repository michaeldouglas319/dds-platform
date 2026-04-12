'use client';

import type { RendererProps } from '@dds/types';
import { WikiArticle } from '../../../apps/ageofabundance-wiki/components/wiki-article.jsx';

/**
 * Wiki Article Renderer
 *
 * Renders a wiki article using the WikiArticle component.
 * Consumes a UniversalSection with display.layout === 'wiki-article'.
 */
export function WikiArticleRenderer({ section }: RendererProps) {
  if (!section) return null;

  return <WikiArticle article={section} />;
}
