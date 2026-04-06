import type { DomainConfig } from '../config/domains';
import { SubscribeForm } from '@dds/auth/subscribe';

const DEFAULT_ICON = '𒌓';

const flipCSS = `
@keyframes dds-landing-flipIn {
  from { transform: perspective(600px) rotateY(360deg); opacity: 0; }
  to   { transform: perspective(600px) rotateY(0deg);   opacity: 1; }
}
`;

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
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: flipCSS }} />
      {displayIcon && (
        <div
          style={{
            position: 'relative',
            width: 80,
            height: 80,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 32,
            animation: 'dds-landing-flipIn 0.8s ease-out forwards',
            backfaceVisibility: 'hidden',
          }}
        >
          {/* Outer shadow layer — pushed back */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              border: '3px solid #000',
              borderRadius: 12,
              transform: 'translate(4px, 4px)',
              opacity: 0.08,
            }}
          />
          {/* Mid shadow layer */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              border: '3px solid #000',
              borderRadius: 12,
              transform: 'translate(2px, 2px)',
              opacity: 0.15,
            }}
          />
          {/* Main border */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              border: '3px solid #000',
              borderRadius: 12,
            }}
          />
          <span
            aria-hidden
            style={{
              position: 'relative',
              fontSize: 'clamp(1.5rem, 4vw, 2.25rem)',
              color: '#000',
              lineHeight: 1,
              zIndex: 1,
            }}
          >
            {displayIcon}
          </span>
        </div>
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
        <div style={{ textAlign: 'center', maxWidth: 560, padding: '0 20px' }}>
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
    </main>
  );
}
