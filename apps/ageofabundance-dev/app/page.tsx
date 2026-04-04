'use client';

import { SectionBatchRenderer } from '@dds/renderer';
import type { UniversalSection, FeatureFlags } from '@dds/types';
import siteConfig from '../data/site.config.json';

export default function Home() {
  const homePage = siteConfig.pages.find((p: { path: string }) => p.path === '/');
  const sections = (homePage?.sections ?? []) as UniversalSection[];
  const features = (siteConfig as Record<string, unknown>).features as FeatureFlags | undefined;

  return (
    <main>
      <SectionBatchRenderer sections={sections} features={features} />
    </main>
  );
}
