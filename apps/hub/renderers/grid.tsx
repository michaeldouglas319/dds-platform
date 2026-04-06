import type { DomainConfig } from '../config/domains';
import { UNIQUE_APPS } from '../config/domains';
import { SubscribeForm } from '@dds/auth/subscribe';

const flipCSS = `
@keyframes flipIn {
  from { transform: perspective(600px) rotateY(360deg); opacity: 0; }
  to   { transform: perspective(600px) rotateY(0deg);   opacity: 1; }
}
`;

function Tile({ domain, icon, header, index }: {
  domain: string;
  icon?: string | false;
  header?: { title: string; subtitle?: string };
  index: number;
}) {
  const tld = domain.split('.').pop();

  return (
    <a
      href={`https://${domain}`}
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
        animation: `flipIn 0.6s ease-out ${index * 0.05}s both`,
        backfaceVisibility: 'hidden' as const,
        minHeight: 140,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = '';
        e.currentTarget.style.boxShadow = '';
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
      <style dangerouslySetInnerHTML={{ __html: flipCSS }} />

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
        {UNIQUE_APPS.map((app, i) => (
          <Tile
            key={app.domain}
            domain={app.domain}
            icon={app.icon}
            header={app.header}
            index={i}
          />
        ))}
      </div>

      <div style={{ marginTop: 48 }}>
        <SubscribeForm domain={domain} />
      </div>
    </main>
  );
}
