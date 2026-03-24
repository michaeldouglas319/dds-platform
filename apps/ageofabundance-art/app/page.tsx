'use client';

import { SectionBatchRenderer } from '@dds/renderer';
import type { UniversalSection } from '@dds/types';
import siteConfig from '../data/site.config.json';

export default function Home() {
  const homePage = siteConfig.pages.find((p: { path: string }) => p.path === '/');
  const sections = (homePage?.sections ?? []) as UniversalSection[];

  return (
    <main>
      <SectionBatchRenderer sections={sections} />
    </main>
  );
}
