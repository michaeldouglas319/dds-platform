'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { PartnershipPitch } from '@dds/ui';
import type { UniversalSection } from '@dds/types';
import siteConfig from '../data/site.config.json';
import type { ConflictEvent, DebugSettings } from '../components/PoimandresScene';
import { defaultDebugSettings } from '../components/PoimandresScene';
import DebugPanel from '../components/DebugPanel';

const PoimandresScene = dynamic(() => import('../components/PoimandresScene'), {
  ssr: false,
});


export default function Home() {
  const homePage = siteConfig.pages.find((p: { path: string }) => p.path === '/');
  const sections = (homePage?.sections ?? []) as UniversalSection[];
  const app = siteConfig.app as Record<string, unknown>;
  const label = app.label as string | undefined;
  const [hero] = sections;

  const [events, setEvents] = useState<ConflictEvent[]>([]);
  const [debug, setDebug] = useState<DebugSettings>(defaultDebugSettings);

  // Debug panel: visible in dev by default, hidden in production unless
  // either NEXT_PUBLIC_SHOW_DEBUG=1 is set or the URL contains ?debug=1.
  const [showDebug, setShowDebug] = useState<boolean>(
    process.env.NODE_ENV !== 'production',
  );
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const q = new URLSearchParams(window.location.search);
    const flag =
      process.env.NEXT_PUBLIC_SHOW_DEBUG === '1' || q.get('debug') === '1';
    if (flag) setShowDebug(true);
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/events')
      .then((r) => r.json())
      .then((data: { events?: ConflictEvent[] }) => {
        if (!cancelled) setEvents(data.events ?? []);
      })
      .catch(() => {
        if (!cancelled) setEvents([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main>
      {/* ── Fixed 3D backdrop — the whole interface scrolls over it ─ */}
      <div className="scene-backdrop">
        <PoimandresScene events={events} debug={debug} />
      </div>

      {/* ── Live debug panel — dev-only by default ─── */}
      {showDebug && (
        <DebugPanel
          settings={debug}
          onChange={setDebug}
          onReset={() => setDebug(defaultDebugSettings)}
          eventCount={events.length}
        />
      )}

      {/* ── Hero content ─── */}
      <div className="hero-area">
        <h1
          style={{
            fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
            fontWeight: 700,
            margin: '1.5rem 0 0',
            letterSpacing: '-0.02em',
            lineHeight: 1,
            textAlign: 'center',
          }}
        >
          <span style={{ display: 'block', color: '#0a0a0a' }}>BlackDot</span>
          <span
            style={{
              display: 'block',
              color: '#0a0a0a',
              opacity: 0.25,
              fontWeight: 300,
              fontSize: '0.55em',
              letterSpacing: '0.04em',
              marginTop: '0.25em',
            }}
          >
            partners
          </span>
        </h1>
        {hero && (
          <div style={{ marginTop: '2rem', maxWidth: '40rem' }}>
            {hero.subject?.subtitle && (
              <p style={{ fontSize: '1.25rem', opacity: 0.6, marginBottom: '1rem' }}>
                {hero.subject.subtitle}
              </p>
            )}
            {hero.content?.body && (
              <p
                style={{
                  fontSize: '1.25rem',
                  opacity: 0.8,
                  lineHeight: 1.7,
                  fontStyle: 'italic',
                }}
              >
                {hero.content.body}
              </p>
            )}
          </div>
        )}
      </div>

      {/* ── Registration ─── */}
      <div id="partner">
        <PartnershipPitch
          headline="Join the Wait List"
          subheadline="Or show your interest by registering for a Partnership."
          stats={[]}
          tiers={[]}
          registerEndpoint="/api/register-partner"
        />
      </div>
    </main>
  );
}
