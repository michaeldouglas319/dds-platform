'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { SignIn, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { AppChip, getCuneiformByTLD, extractTLD } from '@dds/icons';
import { DOMAINS } from '@dds/config/domains';
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

      {/* ── Sign in / account ─── */}
      <div
        id="sign-in"
        style={{
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
          padding: '4rem 1.5rem 6rem',
        }}
      >
        <SignedOut>
          <SignIn routing="hash" />
        </SignedOut>
        <SignedIn>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1.5rem',
              textAlign: 'center',
              maxWidth: '52rem',
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
                gap: '1.25rem',
                width: '100%',
                marginBottom: '1rem',
              }}
            >
              {DOMAINS.map((d) => {
                const tld = extractTLD(d.domain);
                const entry = getCuneiformByTLD(tld);
                if (!entry) return null;
                return (
                  <a
                    key={d.domain}
                    href={d.url}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      background: 'rgba(255,255,255,0.35)',
                      backdropFilter: 'blur(14px) saturate(160%)',
                      WebkitBackdropFilter: 'blur(14px) saturate(160%)',
                      border: '1px solid rgba(255,255,255,0.4)',
                      boxShadow: '0 4px 24px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.5)',
                      borderRadius: 14,
                      padding: '1.5rem 1rem',
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.5rem',
                      textDecoration: 'none',
                      color: 'inherit',
                    }}
                  >
                    <AppChip
                      entry={entry}
                      size={52}
                      tooltip={false}
                      badgeBg="#ffffff"
                      badgeBorder="rgba(0,0,0,0.1)"
                    />
                    <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'rgba(0,0,0,0.7)' }}>
                      {d.label}
                    </span>
                  </a>
                );
              })}
            </div>
            <h2
              style={{
                fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
                fontWeight: 600,
                margin: 0,
                letterSpacing: '-0.01em',
              }}
            >
              Thank you
            </h2>
            <p style={{ fontSize: '1.125rem', opacity: 0.75, lineHeight: 1.6, margin: 0 }}>
              You&rsquo;re on the list. We&rsquo;ll be in touch as partnership slots open up.
            </p>
            <UserButton afterSignOutUrl="/" />
          </div>
        </SignedIn>
      </div>
    </main>
  );
}
