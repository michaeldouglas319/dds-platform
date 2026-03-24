'use client';

import { SectionBatchRenderer } from '@dds/renderer';
import { BrandHeading } from '@dds/ui';
import type { UniversalSection } from '@dds/types';
import siteConfig from '../data/site.config.json';

export default function Home() {
  const homePage = siteConfig.pages.find((p: { path: string }) => p.path === '/');
  const sections = (homePage?.sections ?? []) as UniversalSection[];
  const label = (siteConfig.app as Record<string, unknown>).label as string | undefined;

  return (
    <main>
      <div style={{ padding: '3rem 2rem 1rem', maxWidth: '64rem', margin: '0 auto' }}>
        <BrandHeading>{label}</BrandHeading>
      </div>
      <SectionBatchRenderer sections={sections} />
    </main>
  );
}
