'use client';

import { SectionBatchRenderer } from '@dds/renderer';
import type { UniversalSection } from '@dds/types';

interface EntriesRendererProps {
  sections: UniversalSection[];
}

export function EntriesRenderer({ sections }: EntriesRendererProps) {
  return (
    <main id="main-content">
      <SectionBatchRenderer sections={sections} />
    </main>
  );
}
