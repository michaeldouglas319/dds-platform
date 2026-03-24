'use client';

import { SectionBatchRenderer } from '@dds/renderer';
import type { UniversalSection } from '@dds/types';
import siteConfig from '../data/site.config.json';

export default function Home() {
  const homePage = siteConfig.pages.find((p: { path: string }) => p.path === '/');
  const sections = (homePage?.sections ?? []) as UniversalSection[];

  const [hero, ...rest] = sections;

  return (
    <main>
      {/* Hero — full viewport with ambient glow */}
      <div className="hero-area">
        {/* Brand title with gradient */}
        <h1 style={{
          fontSize: 'clamp(3rem, 8vw, 6rem)',
          fontWeight: 800,
          letterSpacing: '-0.04em',
          lineHeight: 1.0,
          margin: 0,
          textAlign: 'center',
        }}>
          <span style={{ opacity: 0.25, fontWeight: 300, fontSize: '0.4em', display: 'block', marginBottom: '0.3em' }}>
            The
          </span>
          <span style={{ opacity: 0.45, fontWeight: 400 }}>Age of</span>
          <br />
          <span style={{
            background: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 50%, #ec4899 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Abundance
          </span>
        </h1>

        {/* BlackDot + Michael Douglas attribution */}
        <p style={{
          fontSize: '0.75rem',
          fontFamily: 'var(--font-mono)',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--text-quaternary)',
          marginTop: '1rem',
        }}>
          A <span style={{ color: 'var(--text-tertiary)' }}>BlackDot</span> Company · <span style={{ color: 'var(--text-tertiary)' }}>Michael Douglas</span>
        </p>

        {/* Subtitle */}
        {hero && (
          <div style={{ marginTop: '2rem', maxWidth: '40rem', textAlign: 'center' }}>
            <p style={{
              fontSize: 'clamp(1rem, 2vw, 1.25rem)',
              color: 'var(--text-secondary)',
              marginBottom: '0.5rem',
              lineHeight: 1.6,
            }}>
              {hero.content?.body}
            </p>

            {/* Highlight pills */}
            {hero.content?.highlights && (
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.5rem',
                justifyContent: 'center',
                marginTop: '2rem',
              }}>
                {hero.content.highlights.map((h: string) => (
                  <span key={h} style={{
                    padding: '0.35rem 0.9rem',
                    borderRadius: '9999px',
                    border: '1px solid var(--border)',
                    fontSize: '0.8rem',
                    fontFamily: 'var(--font-mono)',
                    letterSpacing: '0.03em',
                    color: 'var(--text-tertiary)',
                    background: 'var(--bg-surface)',
                  }}>
                    {h}
                  </span>
                ))}
              </div>
            )}

            {/* CTA buttons — Stripe dual pattern */}
            <div style={{
              display: 'flex',
              gap: '0.75rem',
              justifyContent: 'center',
              marginTop: '3rem',
              flexWrap: 'wrap',
            }}>
              <a href="/vision" style={{
                padding: '0.75rem 2rem',
                borderRadius: '8px',
                background: '#fafafa',
                color: '#0a0a0a',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '0.9375rem',
              }}>
                Enter the Experience →
              </a>
              <a href="/showcase" style={{
                padding: '0.75rem 2rem',
                borderRadius: '8px',
                border: '1px solid var(--border-hover)',
                background: 'transparent',
                color: 'var(--text-secondary)',
                textDecoration: 'none',
                fontWeight: 500,
                fontSize: '0.9375rem',
              }}>
                View Showcase
              </a>
            </div>
          </div>
        )}

        {/* Scroll indicator */}
        <div style={{
          position: 'absolute',
          bottom: '2.5rem',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.5rem',
          animation: 'float 2.5s ease-in-out infinite',
        }}>
          <span style={{
            fontSize: '0.7rem',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: 'var(--text-quaternary)',
            fontFamily: 'var(--font-mono)',
          }}>
            Scroll
          </span>
          <div style={{
            width: '1px',
            height: '2rem',
            background: 'linear-gradient(to bottom, var(--text-quaternary), transparent)',
          }} />
        </div>
      </div>

      {/* Sections via DDS renderer */}
      <SectionBatchRenderer sections={rest} />

      {/* Keyframes */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateX(-50%) translateY(0); opacity: 0.5; }
          50% { transform: translateX(-50%) translateY(8px); opacity: 0.2; }
        }
      `}</style>
    </main>
  );
}
