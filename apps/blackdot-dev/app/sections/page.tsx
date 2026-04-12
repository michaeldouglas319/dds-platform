'use client';

import dynamic from 'next/dynamic';
import type { UniversalSection } from '@dds/types';
import { Component, type ReactNode } from 'react';
import siteConfig from '../../data/site.config.json';

const SectionBatchRenderer = dynamic(
  () => import('@dds/renderer').then((m) => m.SectionBatchRenderer),
  { ssr: false, loading: () => <p>Loading renderer...</p> },
);

class RenderBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean; error: string }
> {
  state = { hasError: false, error: '' };
  static getDerivedStateFromError(err: Error) {
    return { hasError: true, error: err.message };
  }
  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

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
            <p style={{ opacity: 0.7 }}>Type: {section.type} | Layout: {section.display?.layout ?? 'default'}</p>

            <div style={{ marginTop: '1rem' }}>
              <RenderBoundary
                fallback={
                  <pre style={{ padding: '1rem', background: '#f5f5f5', borderRadius: 4, overflow: 'auto', fontSize: '0.8rem' }}>
                    {JSON.stringify(section, null, 2)}
                  </pre>
                }
              >
                <SectionBatchRenderer sections={[section]} />
              </RenderBoundary>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
