import type { DomainConfig } from '../config/domains';
import { UNIQUE_APPS } from '../config/domains';
import { SubscribeForm } from '@dds/auth/subscribe';

export function GridRenderer({ domain, header }: DomainConfig & { domain: string }) {
  return (
    <main style={{
      width: '100%',
      minHeight: '100vh',
      background: '#fff',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '60px 24px',
    }}>
      {header && (
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#000', margin: 0 }}>
            {header.title}
          </h1>
          {header.subtitle && (
            <p style={{ fontSize: '0.8rem', color: '#999', marginTop: 6 }}>{header.subtitle}</p>
          )}
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
        gap: 12,
        maxWidth: 700,
        width: '100%',
      }}>
        {UNIQUE_APPS.map((app) => {
          const tld = app.domain.split('.').pop();
          return (
            <a
              key={app.domain}
              href={`https://${app.domain}`}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 16,
                border: '1.5px solid #000',
                borderRadius: 10,
                textDecoration: 'none',
                color: '#000',
                background: '#fff',
                minHeight: 100,
              }}
            >
              {app.icon && (
                <span style={{ fontSize: '1.5rem', lineHeight: 1, marginBottom: 8 }}>
                  {app.icon}
                </span>
              )}
              <span style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.04em' }}>
                .{tld}
              </span>
              {app.header?.subtitle && (
                <span style={{ fontSize: '0.55rem', color: '#aaa', marginTop: 4 }}>
                  {app.header.subtitle}
                </span>
              )}
            </a>
          );
        })}
      </div>

      <div style={{ marginTop: 40 }}>
        <SubscribeForm domain={domain} />
      </div>
    </main>
  );
}
