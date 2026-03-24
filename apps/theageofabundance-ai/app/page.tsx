'use client';

import { SectionBatchRenderer } from '@dds/renderer';
import { BrandHeading } from '@dds/ui';
import type { UniversalSection } from '@dds/types';
import siteConfig from '../data/site.config.json';

export default function Home() {
  const homePage = siteConfig.pages.find((p: { path: string }) => p.path === '/');
  const sections = (homePage?.sections ?? []) as UniversalSection[];
  const label = (siteConfig.app as Record<string, unknown>).label as string | undefined;

  // Split hero (first section) from the rest for layout control
  const [hero, ...rest] = sections;

  return (
    <main>
      {/* Hero — full viewport */}
      <div className="hero-area">
        <BrandHeading>{label}</BrandHeading>
        {hero && (
          <div style={{ marginTop: '2rem', maxWidth: '40rem' }}>
            {hero.subject?.subtitle && (
              <p style={{ fontSize: '1.25rem', opacity: 0.6, marginBottom: '1rem' }}>
                {hero.subject.subtitle}
              </p>
            )}
            {hero.content?.body && (
              <p style={{ fontSize: '1.1rem', opacity: 0.8, lineHeight: 1.7 }}>
                {hero.content.body}
              </p>
            )}
            {hero.content?.highlights && (
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.5rem',
                justifyContent: 'center',
                marginTop: '1.5rem',
              }}>
                {hero.content.highlights.map((h: string) => (
                  <span key={h} style={{
                    padding: '0.35rem 0.85rem',
                    borderRadius: '9999px',
                    border: '1px solid rgba(255,255,255,0.15)',
                    fontSize: '0.85rem',
                    opacity: 0.7,
                  }}>
                    {h}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Interactive experience link */}
      <div style={{
        textAlign: 'center',
        padding: '2rem',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.75rem',
        justifyContent: 'center',
      }}>
        <a href="/vision" style={{
          display: 'inline-block',
          padding: '0.8rem 2.5rem',
          borderRadius: '9999px',
          background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
          color: 'white',
          textDecoration: 'none',
          fontWeight: 600,
          fontSize: '1rem',
          letterSpacing: '0.02em',
        }}>
          Enter the Experience &rarr;
        </a>
        <a href="/playground" style={{
          display: 'inline-block',
          padding: '0.8rem 2rem',
          borderRadius: '9999px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          background: 'rgba(255, 255, 255, 0.05)',
          color: 'rgba(255, 255, 255, 0.85)',
          textDecoration: 'none',
          fontWeight: 500,
          fontSize: '0.9rem',
          letterSpacing: '0.02em',
          backdropFilter: 'blur(8px)',
        }}>
          Playground
        </a>
        <a href="/showcase" style={{
          display: 'inline-block',
          padding: '0.8rem 2rem',
          borderRadius: '9999px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          background: 'rgba(255, 255, 255, 0.05)',
          color: 'rgba(255, 255, 255, 0.85)',
          textDecoration: 'none',
          fontWeight: 500,
          fontSize: '0.9rem',
          letterSpacing: '0.02em',
          backdropFilter: 'blur(8px)',
        }}>
          Showcase
        </a>
      </div>

      {/* Remaining sections via DDS renderer */}
      <SectionBatchRenderer sections={rest} />
    </main>
  );
}
