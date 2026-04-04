'use client';

import type { UniversalSection, RendererRegistry, FeatureFlags } from '@dds/types';
import { defaultRegistry } from './registry';

export interface SectionBatchRendererProps {
  sections: UniversalSection[];
  registry?: RendererRegistry;
  features?: FeatureFlags;
}

export function SectionBatchRenderer({
  sections,
  registry = defaultRegistry,
  features,
}: SectionBatchRendererProps) {
  return (
    <>
      {sections.map((section) => {
        // Visibility gate
        if (section.display?.visible === false) return null;

        // Feature flag gate
        const flag = section.display?.featureFlag;
        if (flag && features && !features[flag]) return null;

        // Look up renderer by display.layout first, then section.type
        const key = section.display?.layout ?? section.type;
        const entry = registry[key];

        if (entry) {
          const Component = entry.component;
          return <Component key={section.id} section={section} />;
        }

        // Fallback
        return (
          <div
            key={section.id}
            className="px-6 py-8 text-center text-sm text-neutral-500"
          >
            No renderer for: {section.name ?? section.id}
          </div>
        );
      })}
    </>
  );
}
