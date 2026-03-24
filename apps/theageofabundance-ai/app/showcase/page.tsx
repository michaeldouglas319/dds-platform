'use client';

import { SectionBatchRenderer } from '@dds/renderer';
import { SectionErrorBoundary } from '../../components/section-error-boundary';
import sections from '../../data/showcase.json';

export default function Showcase() {
  return (
    <main>
      <SectionErrorBoundary>
        <SectionBatchRenderer sections={sections as any} />
      </SectionErrorBoundary>
    </main>
  );
}
