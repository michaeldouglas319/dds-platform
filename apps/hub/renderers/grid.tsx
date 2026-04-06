'use client';

import type { DomainConfig } from '../config/domains';
import { UNIQUE_APPS } from '../config/domains';
import { SubscribeForm } from '@dds/auth/subscribe';

// Scoped keyframe name to avoid collision with other renderers
const ANIM_NAME = 'dds-grid-flipIn';

const gridCSS = `
@keyframes ${ANIM_NAME} {
  from { transform: perspective(600px) rotateY(360deg); opacity: 0; }
  to   { transform: perspective(600px) rotateY(0deg);   opacity: 1; }
}
`;

// Seeded random from domain string — stable across renders, random across tiles
function hashDelay(domain: string): number {
  let h = 0;
  for (let i = 0; i < domain.length; i++) {
    h = ((h << 5) - h + domain.charCodeAt(i)) | 0;
  }
  return (Math.abs(h) % 800) / 1000; // 0–0.8s random delay
}

function Tile({ domain, icon, header }: {
  domain: string;
  icon?: string | false;
  header?: { title: string; subtitle?: string };
}) {
  const tld = domain.split('.').pop();
  const delay = hashDelay(domain);

  return (
    <a
      href={`https://${domain}`}
      className="dds-grid-tile"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        border: '2px solid #000',
        borderRadius: 12,
        textDecoration: 'none',
        color: '#000',
        background: '#fff',
        transition: 'transform 0.15s, box-shadow 0.15s',
        animation: `${ANIM_NAME} 0.6s ease-out ${delay}s both`,
        backfaceVisibility: 'hidden',
        minHeight: 140,
      }}
    >
      {icon && icon !== false && (
        <span
          aria-hidden
          style={{
            fontSize: '1.75rem',
            lineHeight: 1,
            marginBottom: 12,
            fontFamily: "'Noto Sans Cuneiform', sans-serif",
          }}
        >
          {icon}
        </span>
      )}
      <span style={{
        fontSize: '0.75rem',
        fontWeight: 600,
        letterSpacing: '0.06em',
        textAlign: 'center',
      }}>
        .{tld}
      </span>
      {header?.subtitle && (
        <span style={{
          fontSize: '0.625rem',
          color: '#999',
          marginTop: 6,
          letterSpacing: '0.04em',
          textAlign: 'center',
        }}>
          {header.subtitle}
        </span>
      )}
    </a>
  );
}

export function GridRenderer({ domain, header }: DomainConfig & { domain: string }) {
  return (
    <main
      style={{
        width: '100%',
        minHeight: '100vh',
        background: '#fff',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '60px 24px',
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: gridCSS + `
        .dds-grid-tile:hover {
          transform: translateY(-4px) !important;
          box-shadow: 0 8px 24px rgba(0,0,0,0.12);
        }
      `}} />

      {header && (
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h1 style={{
            fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
            fontWeight: 600,
            letterSpacing: '-0.02em',
            color: '#000',
            margin: 0,
          }}>
            {header.title}
          </h1>
          {header.subtitle && (
            <p style={{
              fontSize: '0.875rem',
              color: '#999',
              margin: '8px 0 0',
              letterSpacing: '0.04em',
            }}>
              {header.subtitle}
            </p>
          )}
        </div>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
          gap: 16,
          maxWidth: 800,
          width: '100%',
        }}
      >
        {UNIQUE_APPS.map((app) => (
          <Tile
            key={app.domain}
            domain={app.domain}
            icon={app.icon}
            header={app.header}
          />
        ))}
      </div>

      <div style={{ marginTop: 48 }}>
        <SubscribeForm domain={domain} />
      </div>
    </main>
  );
}
