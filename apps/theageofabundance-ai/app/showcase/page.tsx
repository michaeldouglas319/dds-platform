'use client';

import { SectionBatchRenderer } from '@dds/renderer';
import sections from '../../data/showcase.json';

export default function Showcase() {
  return (
    <main>
      <SectionBatchRenderer sections={sections as any} />
    </main>
  );
}
