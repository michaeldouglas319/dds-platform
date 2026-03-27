'use client';

import { SectionBatchRenderer } from '@dds/renderer';
import type { UniversalSection } from '@dds/types';
import siteConfig from '../../data/site.config.json';

export default function SectionsPage() {
  const allSections = siteConfig.pages.flatMap((page: any) => page.sections || []) as UniversalSection[];

  return (
    <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>All Sections</h1>
      <p>Total sections: {allSections.length}</p>

      <div style={{ marginTop: '2rem' }}>
        {allSections.map((section, idx) => (
          <div key={idx} style={{
            marginBottom: '3rem',
            padding: '2rem',
            border: '1px solid #ccc',
            borderRadius: '8px'
          }}>
            <h2>{section.subject?.title || section.name || `Section ${idx}`}</h2>
            <p style={{ opacity: 0.7 }}>Type: {section.type}</p>

            <div style={{ marginTop: '1rem' }}>
              <SectionBatchRenderer sections={[section]} />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
