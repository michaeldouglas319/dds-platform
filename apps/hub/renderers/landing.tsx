import type { DomainConfig } from '../config/domains';
import { SubscribeForm } from '@dds/auth/subscribe';

// Default icon: cuneiform monogram from dds-renderer
const DEFAULT_ICON = '𒌓';

export function LandingRenderer({ domain, icon, header }: DomainConfig & { domain: string }) {
  const hasHeader = header?.title;
  const displayIcon = icon === false ? null : (icon ?? DEFAULT_ICON);

  return (
    <main
      style={{
        width: '100%',
        height: '100vh',
        background: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: 32,
          border: '4px solid #000',
          borderRadius: 12,
        }}
      >
        {displayIcon && (
          <span
            aria-hidden
            style={{
              fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
              color: '#000',
              marginBottom: 24,
              lineHeight: 1,
            }}
          >
            {displayIcon}
          </span>
        )}

        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: '#000',
            marginBottom: hasHeader ? 48 : 40,
          }}
        />

        {hasHeader ? (
          <div style={{ textAlign: 'center', maxWidth: 560 }}>
            <h1
              style={{
                fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
                fontWeight: 600,
                letterSpacing: '-0.02em',
                color: '#000',
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              {header.title}
            </h1>
            {header.subtitle && (
              <p
                style={{
                  fontSize: 'clamp(0.875rem, 2vw, 1.125rem)',
                  color: '#555',
                  margin: '12px 0 0',
                  fontWeight: 400,
                  letterSpacing: '0.02em',
                }}
              >
                {header.subtitle}
              </p>
            )}
            {header.slogan && (
              <p
                style={{
                  fontSize: 'clamp(0.75rem, 1.5vw, 0.875rem)',
                  color: '#999',
                  margin: '20px 0 0',
                  fontWeight: 400,
                  fontStyle: 'italic',
                  letterSpacing: '0.04em',
                }}
              >
                {header.slogan}
              </p>
            )}
          </div>
        ) : (
          <p
            style={{
              fontSize: 'clamp(1rem, 3vw, 1.5rem)',
              letterSpacing: '0.08em',
              color: '#000',
              margin: 0,
              fontWeight: 400,
            }}
          >
            {domain}
          </p>
        )}

        <SubscribeForm domain={domain} />
      </div>
    </main>
  );
}
