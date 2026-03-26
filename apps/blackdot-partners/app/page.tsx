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
          maxWidth: '50rem',
          fontSize: '1.1rem',
          opacity: 0.8,
          lineHeight: 1.6
        }}>
          The engineering backbone of the Age of Abundance ecosystem. We build the infrastructure, tools, and platforms that power 24+ domains of abundance.
        </p>
      </section>

      {/* Platform Overview */}
      <section style={{
        padding: '6rem 2rem',
        background: 'rgba(139,92,246,0.03)',
        borderTop: '1px solid rgba(139,92,246,0.2)',
        borderBottom: '1px solid rgba(139,92,246,0.2)'
      }}>
        <div style={{
          maxWidth: '1000px',
          margin: '0 auto'
        }}>
          <h2 style={{
            fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
            fontWeight: 700,
            marginBottom: '3rem',
            textAlign: 'center'
          }}>
            What We Build
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '2rem'
          }}>
            {[
              {
                title: 'Universal Platform',
                description: 'DDS (Dynamic Domain System) — a config-driven rendering engine that powers all 24 domains from a single codebase.'
              },
              {
                title: 'Developer Tools',
                description: 'Open-source SDKs, APIs, and infrastructure for building abundance-native applications at scale.'
              },
              {
                title: 'Creative Laboratory',
                description: 'Experiments at the intersection of design, technology, and human creativity. From prototypes to production.'
              },
              {
                title: 'Shared Infrastructure',
                description: 'Authentication, analytics, content management, and deployment pipelines — unified across the ecosystem.'
              }
            ].map((item, i) => (
              <div key={i} style={{
                padding: '2rem',
                borderRadius: '8px',
                border: '1px solid rgba(139,92,246,0.3)',
                background: 'rgba(139,92,246,0.08)'
              }}>
                <h3 style={{
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  marginBottom: '1rem',
                  color: '#a78bfa'
                }}>
                  {item.title}
                </h3>
                <p style={{
                  margin: 0,
                  opacity: 0.8,
                  lineHeight: 1.6,
                  fontSize: '0.95rem'
                }}>
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
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
          The Ecosystem ({DOMAINS.length} Domains)
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

      {/* Collaboration Section */}
      <section style={{
        padding: '6rem 2rem',
        background: 'linear-gradient(135deg, rgba(139,92,246,0.1) 0%, rgba(139,92,246,0.05) 100%)',
        borderTop: '1px solid rgba(139,92,246,0.2)'
      }}>
        <div style={{
          maxWidth: '900px',
          margin: '0 auto'
        }}>
          <h2 style={{
            fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
            fontWeight: 700,
            marginBottom: '2rem',
            textAlign: 'center'
          }}>
            Let's Build Together
          </h2>

          <p style={{
            fontSize: '1.1rem',
            opacity: 0.85,
            lineHeight: 1.8,
            marginBottom: '3rem',
            textAlign: 'center'
          }}>
            BlackDot is open to partnerships, integrations, and collaborations. Whether you're a developer, designer, partner, or investor — we're interested in building the future of abundance with you.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.5rem',
            marginBottom: '3rem'
          }}>
            {[
              {
                title: 'Developers',
                text: 'Build on our open-source SDKs and APIs. Access our shared infrastructure and contribute to the platform.',
                link: 'https://blackdot.dev'
              },
              {
                title: 'Partners',
                text: 'Integrate with the Age of Abundance ecosystem. Reach 24 domains and millions of users.',
                link: 'https://blackdot.partners'
              },
              {
                title: 'Investors',
                text: 'Discover investment opportunities across our verticals and participate in our growth.',
                link: 'https://blackdot.capital'
              },
              {
                title: 'Creatives',
                text: 'Collaborate on design, art, and innovation projects. Push the boundaries of what\'s possible.',
                link: 'https://blackdot.space'
              }
            ].map((opportunity, i) => (
              <a
                key={i}
                href={opportunity.link}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: '2rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(139,92,246,0.4)',
                  background: 'rgba(139,92,246,0.1)',
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(139,92,246,0.8)';
                  e.currentTarget.style.background = 'rgba(139,92,246,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(139,92,246,0.4)';
                  e.currentTarget.style.background = 'rgba(139,92,246,0.1)';
                }}
              >
                <h3 style={{
                  fontSize: '1rem',
                  fontWeight: 600,
                  color: '#a78bfa',
                  margin: 0
                }}>
                  {opportunity.title}
                </h3>
                <p style={{
                  margin: 0,
                  opacity: 0.8,
                  fontSize: '0.9rem',
                  lineHeight: 1.5
                }}>
                  {opportunity.text}
                </p>
                <div style={{
                  marginTop: 'auto',
                  fontSize: '0.8rem',
                  opacity: 0.6
                }}>
                  Explore →
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Contact/Join CTA */}
      <section style={{
        padding: '6rem 2rem',
        textAlign: 'center'
      }}>
        <h2 style={{
          fontSize: '2rem',
          fontWeight: 700,
          marginBottom: '2rem'
        }}>
          Ready to Join?
        </h2>
        <p style={{
          maxWidth: '40rem',
          margin: '0 auto 3rem',
          opacity: 0.7,
          lineHeight: 1.6
        }}>
          Start with The Age of Abundance to join our founding membership, or reach out directly to discuss partnership opportunities.
        </p>
        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
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
            Join the Ecosystem →
          </a>
          <a href="mailto:partners@blackdot.dev" style={{
            display: 'inline-block',
            padding: '0.75rem 2rem',
            border: '1px solid rgba(139,92,246,0.5)',
            background: 'transparent',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '8px',
            fontWeight: 600,
            transition: 'all 0.3s ease'
          }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(139,92,246,0.8)';
              e.currentTarget.style.background = 'rgba(139,92,246,0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(139,92,246,0.5)';
              e.currentTarget.style.background = 'transparent';
            }}
          >
            Contact Partners
          </a>
        </div>
      </section>
    </main>
  );
}
