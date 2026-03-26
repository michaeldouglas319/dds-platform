'use client';

import { BrandHeading } from '@dds/ui';
import { DOMAINS, ABUNDANCE_DOMAINS, BLACKDOT_DOMAINS, LIVE_DOMAINS, COMING_SOON_DOMAINS } from '@dds/config/domains';

export default function Home() {
  return (
    <main>
      {/* Hero Section */}
      <section style={{
        padding: '6rem 2rem',
        textAlign: 'center',
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '2rem'
      }}>
        <BrandHeading>BlackDot</BrandHeading>
        <h1 style={{
          fontSize: 'clamp(2rem, 5vw, 3.5rem)',
          fontWeight: 700,
          marginBottom: '1rem'
        }}>
          Partners
        </h1>
        <p style={{
          maxWidth: '40rem',
          fontSize: '1.1rem',
          opacity: 0.8,
          lineHeight: 1.6
        }}>
          Explore the complete ecosystem of BlackDot and Age of Abundance properties.
        </p>
      </section>

      {/* All Domains Grid */}
      <section style={{
        padding: '4rem 2rem',
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%'
      }}>
        <h2 style={{
          fontSize: '2rem',
          fontWeight: 700,
          marginBottom: '3rem',
          textAlign: 'center'
        }}>
          All Domains ({DOMAINS.length})
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem',
          marginBottom: '4rem'
        }}>
          {DOMAINS.map((domain) => (
            <a
              key={domain.domain}
              href={domain.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '2rem',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                background: 'rgba(255,255,255,0.02)',
                backdropFilter: 'blur(10px)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
              }}
            >
              <div>
                <div style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  opacity: 0.6,
                  marginBottom: '0.5rem'
                }}>
                  {domain.brand === 'blackdot' ? '● BlackDot' : '∞ Age of Abundance'}
                </div>
                <h3 style={{
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  margin: 0,
                  marginBottom: '0.5rem'
                }}>
                  {domain.label}
                </h3>
                <p style={{
                  margin: 0,
                  fontSize: '0.9rem',
                  opacity: 0.7,
                  wordBreak: 'break-all'
                }}>
                  {domain.domain}
                </p>
              </div>
              <div style={{
                marginTop: 'auto',
                paddingTop: '1rem',
                borderTop: '1px solid rgba(255,255,255,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.8rem'
              }}>
                <span style={{
                  padding: '0.25rem 0.75rem',
                  borderRadius: '4px',
                  background: domain.status === 'live' ? 'rgba(34,197,94,0.2)' : 'rgba(139,92,246,0.2)',
                  color: domain.status === 'live' ? '#22c55e' : '#a78bfa'
                }}>
                  {domain.status === 'live' ? '● Live' : '○ Coming Soon'}
                </span>
                {domain.category && (
                  <span style={{ opacity: 0.6 }}>
                    {domain.category}
                  </span>
                )}
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Summary Stats */}
      <section style={{
        padding: '4rem 2rem',
        background: 'rgba(139,92,246,0.05)',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        textAlign: 'center'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '2rem'
        }}>
          <div>
            <div style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              {DOMAINS.length}
            </div>
            <div style={{ opacity: 0.7 }}>Total Domains</div>
          </div>
          <div>
            <div style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              {LIVE_DOMAINS.length}
            </div>
            <div style={{ opacity: 0.7 }}>Live Now</div>
          </div>
          <div>
            <div style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              {COMING_SOON_DOMAINS.length}
            </div>
            <div style={{ opacity: 0.7 }}>Coming Soon</div>
          </div>
          <div>
            <div style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              {ABUNDANCE_DOMAINS.length}
            </div>
            <div style={{ opacity: 0.7 }}>Age of Abundance</div>
          </div>
          <div>
            <div style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              {BLACKDOT_DOMAINS.length}
            </div>
            <div style={{ opacity: 0.7 }}>BlackDot</div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: '6rem 2rem',
        textAlign: 'center'
      }}>
        <h2 style={{
          fontSize: '2rem',
          fontWeight: 700,
          marginBottom: '2rem'
        }}>
          Ready to Explore?
        </h2>
        <p style={{
          maxWidth: '40rem',
          margin: '0 auto 2rem',
          opacity: 0.7,
          lineHeight: 1.6
        }}>
          Start with The Age of Abundance AI to join our founding membership and gain early access to the entire ecosystem.
        </p>
        <a href="https://theageofabundance.ai" style={{
          display: 'inline-block',
          padding: '0.75rem 2rem',
          background: '#8b5cf6',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '8px',
          fontWeight: 600,
          transition: 'opacity 0.3s ease'
        }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
        >
          Join the Movement →
        </a>
      </section>
    </main>
  );
}
