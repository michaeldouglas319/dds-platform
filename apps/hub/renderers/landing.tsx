import type { DomainConfig } from '../config/domains';
import { SubscribeForm } from '@dds/auth/subscribe';

export function LandingRenderer({ domain }: DomainConfig & { domain: string }) {
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
      <div
        style={{
          width: 10,
          height: 10,
          borderRadius: '50%',
          background: '#000',
          marginBottom: 40,
        }}
      />
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
      <SubscribeForm domain={domain} />
    </main>
  );
}
