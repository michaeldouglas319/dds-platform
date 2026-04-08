'use client';

import dynamic from 'next/dynamic';
import { BrandHeading, PartnershipPitch } from '@dds/ui';
import { AppChip, getCuneiformByTLD } from '@dds/icons';
import type { UniversalSection } from '@dds/types';
import siteConfig from '../data/site.config.json';

const PoimandresScene = dynamic(() => import('../components/PoimandresScene'), {
  ssr: false,
});

export default function Home() {
  const homePage = siteConfig.pages.find((p: { path: string }) => p.path === '/');
  const sections = (homePage?.sections ?? []) as UniversalSection[];
  const app = siteConfig.app as Record<string, unknown>;
  const label = app.label as string | undefined;

  const cuneiform = getCuneiformByTLD('partners');
  const [hero] = sections;

  return (
    <main>
      {/* ── Hero — Poimandres R3F scene behind content ──── */}
      <div className="hero-area">
        <PoimandresScene />
        {cuneiform && (
          <AppChip entry={cuneiform} size={72} flipDelay={900} flipDuration={800} />
        )}
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
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                  justifyContent: 'center',
                  marginTop: '1.5rem',
                }}
              >
                {hero.content.highlights.map((h: string) => (
                  <span
                    key={h}
                    style={{
                      padding: '0.35rem 0.85rem',
                      borderRadius: '9999px',
                      border: '1px solid rgba(255,255,255,0.15)',
                      fontSize: '0.85rem',
                      opacity: 0.7,
                    }}
                  >
                    {h}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Registration — the only other public element ──── */}
      <div id="partner">
        <PartnershipPitch
          headline="Bring Your Expertise. Let's Make It Ours."
          subheadline="BlackDot grows through the people who build it. Share what you do best — engineering, strategy, capital, creative, community — and become part of the collective."
          stats={[
            { value: '1', label: 'Unified Platform' },
            { value: '9', label: 'Theme Variants' },
            { value: '∞', label: 'Possibilities' },
          ]}
          registerEndpoint="/api/register-partner"
        />
      </div>
    </main>
  );
}
