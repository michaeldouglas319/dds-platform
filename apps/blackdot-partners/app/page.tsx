'use client';

import { BrandHeading } from '@dds/ui';
import { DOMAINS, ABUNDANCE_DOMAINS, BLACKDOT_DOMAINS, LIVE_DOMAINS, COMING_SOON_DOMAINS } from '@dds/config/domains';

// ─── Icons (24×24 stroke SVGs) ───────────────────────────────────

const icon = (d: string) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const icons: Record<string, React.ReactNode> = {
  layers: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" />
    </svg>
  ),
  code: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
    </svg>
  ),
  flask: icon('M9 3h6M10 3v6.5L4 20h16l-6-10.5V3'),
  server: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="8" rx="2" /><rect x="2" y="14" width="20" height="8" rx="2" /><circle cx="6" cy="6" r="0.5" fill="currentColor" /><circle cx="6" cy="18" r="0.5" fill="currentColor" />
    </svg>
  ),
  trending: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
    </svg>
  ),
  palette: icon('M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.93 0 1.65-.75 1.65-1.69 0-.44-.18-.83-.44-1.12-.29-.29-.44-.65-.44-1.13 0-.92.75-1.67 1.67-1.67H17c3.05 0 5.56-2.5 5.56-5.56C22.56 6.01 17.96 2 12 2z'),
  star: icon('M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z'),
  bag: icon('M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0'),
  window: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="18" rx="2" /><line x1="2" y1="9" x2="22" y2="9" />
    </svg>
  ),
  book: icon('M4 19.5A2.5 2.5 0 016.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z'),
  cpu: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="4" width="16" height="16" rx="2" /><rect x="9" y="9" width="6" height="6" />
    </svg>
  ),
  users: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </svg>
  ),
  globe: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
    </svg>
  ),
  briefcase: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
    </svg>
  ),
  monitor: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  ),
  building: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2" /><path d="M9 22v-4h6v4" /><line x1="9" y1="6" x2="9.01" y2="6" /><line x1="15" y1="6" x2="15.01" y2="6" /><line x1="9" y1="10" x2="9.01" y2="10" /><line x1="15" y1="10" x2="15.01" y2="10" /><line x1="9" y1="14" x2="9.01" y2="14" /><line x1="15" y1="14" x2="15.01" y2="14" />
    </svg>
  ),
  heart: icon('M20.42 4.58a5.4 5.4 0 00-7.65 0l-.77.78-.77-.78a5.4 5.4 0 00-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z'),
  diamond: icon('M12 2l10 10-10 10L2 12z'),
};

const categoryIcon: Record<string, string> = {
  flagship: 'star', infrastructure: 'server', commerce: 'bag', saas: 'window',
  creative: 'palette', knowledge: 'book', developer: 'code', technology: 'cpu',
  community: 'users', regional: 'globe', services: 'briefcase', digital: 'monitor',
  corporate: 'building', experimental: 'flask', partnerships: 'heart', investment: 'trending',
};

// ─── Tile ────────────────────────────────────────────────────────

function Tile({ icon: ic, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div style={{
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 12,
      padding: '1.5rem 1rem',
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '0.5rem',
    }}>
      <div style={{ color: 'rgba(255,255,255,0.35)' }}>{ic}</div>
      <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'rgba(255,255,255,0.7)' }}>{label}</span>
    </div>
  );
}

function LinkTile({ icon: ic, label, href, badge }: { icon: React.ReactNode; label: string; href: string; badge?: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" style={{
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 12,
      padding: '1.5rem 1rem',
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '0.5rem',
      textDecoration: 'none',
      color: 'inherit',
    }}>
      <div style={{ color: 'rgba(255,255,255,0.35)' }}>{ic}</div>
      <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'rgba(255,255,255,0.7)' }}>{label}</span>
      {badge && (
        <span style={{
          fontSize: '0.65rem',
          fontWeight: 600,
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          color: badge === 'live' ? '#34d399' : 'rgba(255,255,255,0.3)',
        }}>
          {badge === 'live' ? 'Live' : 'Soon'}
        </span>
      )}
    </a>
  );
}

// ─── Page ────────────────────────────────────────────────────────

export default function Home() {
  return (
    <main style={{ maxWidth: 1000, margin: '0 auto', padding: '0 1.5rem' }}>

      {/* Hero */}
      <section style={{
        minHeight: '50vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        gap: '1rem',
        padding: '6rem 0 4rem',
      }}>
        <BrandHeading>BlackDot</BrandHeading>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 700, margin: 0 }}>
          Partners
        </h1>
        <p style={{ fontSize: '1.2rem', fontWeight: 500, color: 'rgba(255,255,255,0.6)', margin: 0 }}>
          Bring Your Expertise
        </p>
        <p style={{ maxWidth: '36rem', fontSize: '0.95rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.7, margin: 0 }}>
          The engineering backbone of the Age of Abundance ecosystem. Infrastructure, tools, and platforms powering {DOMAINS.length}+ domains.
        </p>
      </section>

      {/* What We Build */}
      <section style={{ padding: '3rem 0' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, textAlign: 'center', marginBottom: '2rem' }}>
          What We Build
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '0.75rem',
        }}>
          <Tile icon={icons.layers} label="Platform" />
          <Tile icon={icons.code} label="Dev Tools" />
          <Tile icon={icons.flask} label="Creative Lab" />
          <Tile icon={icons.server} label="Infrastructure" />
        </div>
      </section>

      {/* Ecosystem */}
      <section style={{ padding: '3rem 0' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, textAlign: 'center', marginBottom: '2rem' }}>
          Ecosystem
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
          gap: '0.75rem',
        }}>
          {DOMAINS.map((d) => (
            <LinkTile
              key={d.domain}
              icon={icons[categoryIcon[d.category ?? ''] ?? 'diamond'] ?? icons.diamond}
              label={d.label}
              href={d.url}
              badge={d.status}
            />
          ))}
        </div>
      </section>

      {/* Stats */}
      <section style={{
        padding: '3rem 0',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
        gap: '2rem',
        textAlign: 'center',
      }}>
        {[
          { v: DOMAINS.length, l: 'Domains' },
          { v: LIVE_DOMAINS.length, l: 'Live' },
          { v: COMING_SOON_DOMAINS.length, l: 'Coming Soon' },
          { v: ABUNDANCE_DOMAINS.length, l: 'Abundance' },
          { v: BLACKDOT_DOMAINS.length, l: 'BlackDot' },
        ].map((s) => (
          <div key={s.l}>
            <div style={{ fontSize: '2rem', fontWeight: 700 }}>{s.v}</div>
            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>{s.l}</div>
          </div>
        ))}
      </section>

      {/* Build Together */}
      <section style={{ padding: '3rem 0' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, textAlign: 'center', marginBottom: '0.5rem' }}>
          Build Together
        </h2>
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', marginBottom: '2rem', maxWidth: '32rem', marginLeft: 'auto', marginRight: 'auto' }}>
          Open to partnerships, integrations, and collaborations across the ecosystem.
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '0.75rem',
        }}>
          <LinkTile icon={icons.code} label="Developers" href="https://blackdot.dev" />
          <LinkTile icon={icons.heart} label="Partners" href="https://blackdot.partners" />
          <LinkTile icon={icons.trending} label="Investors" href="https://blackdot.capital" />
          <LinkTile icon={icons.palette} label="Creatives" href="https://blackdot.space" />
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '4rem 0 6rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>
          Ready to Join?
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', maxWidth: '28rem', margin: '0 auto 2rem', lineHeight: 1.7 }}>
          Join our founding membership or reach out to discuss partnership opportunities.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="https://theageofabundance.ai" style={{
            padding: '0.6rem 1.5rem', background: '#7c3aed', color: 'white',
            textDecoration: 'none', borderRadius: 8, fontWeight: 600, fontSize: '0.9rem',
          }}>
            Join the Ecosystem
          </a>
          <a href="mailto:partners@blackdot.dev" style={{
            padding: '0.6rem 1.5rem', border: '1px solid rgba(255,255,255,0.15)',
            background: 'transparent', color: 'white', textDecoration: 'none',
            borderRadius: 8, fontWeight: 600, fontSize: '0.9rem',
          }}>
            Contact Us
          </a>
        </div>
      </section>
    </main>
  );
}
