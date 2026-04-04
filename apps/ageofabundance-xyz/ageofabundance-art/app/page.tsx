'use client';

import { SectionBatchRenderer } from '@dds/renderer';
import { BrandHeading } from '@dds/ui';
import type { UniversalSection, FeatureFlags } from '@dds/types';
import siteConfig from '../data/site.config.json';

export default function Home() {
  const homePage = siteConfig.pages.find((p: { path: string }) => p.path === '/');
  const sections = (homePage?.sections ?? []) as UniversalSection[];
  const features = (siteConfig as Record<string, unknown>).features as FeatureFlags | undefined;
  const label = siteConfig.app.label;

  return (
    <main>
      {/* All sections via DDS renderer — config-driven */}
      <SectionBatchRenderer sections={sections} features={features} />
    </main>
  );
}
