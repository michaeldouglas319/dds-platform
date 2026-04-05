'use client';

import { useState } from 'react';

interface SubscribeFormProps {
  domain: string;
  /** POST endpoint for email submission. Defaults to /api/subscribe */
  action?: string;
}

/**
 * Email subscribe form for landing pages.
 * Submits email + domain to an API route.
 * Styled to match the white room aesthetic.
 */
export function SubscribeForm({ domain, action = '/api/subscribe' }: SubscribeFormProps) {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'submitting' | 'done' | 'error'>('idle');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;

    setState('submitting');
    try {
      const res = await fetch(action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, domain }),
      });
      setState(res.ok ? 'done' : 'error');
    } catch {
      setState('error');
    }
  }

  if (state === 'done') {
    return (
      <p style={{
        fontSize: '0.875rem',
        color: '#666',
        letterSpacing: '0.04em',
        marginTop: 32,
      }}>
        subscribed
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{
      display: 'flex',
      gap: 8,
      marginTop: 32,
      maxWidth: 360,
      width: '100%',
      padding: '0 20px',
    }}>
      <input
        type="email"
        required
        placeholder="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={state === 'submitting'}
        style={{
          flex: 1,
          padding: '10px 14px',
          border: '1px solid #ddd',
          borderRadius: 4,
          fontSize: '0.875rem',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          outline: 'none',
          color: '#000',
          background: '#fff',
          letterSpacing: '0.02em',
        }}
      />
      <button
        type="submit"
        disabled={state === 'submitting'}
        style={{
          padding: '10px 20px',
          background: '#000',
          color: '#fff',
          border: 'none',
          borderRadius: 4,
          fontSize: '0.875rem',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          cursor: state === 'submitting' ? 'wait' : 'pointer',
          letterSpacing: '0.04em',
          whiteSpace: 'nowrap',
        }}
      >
        {state === 'submitting' ? '...' : 'notify me'}
      </button>
    </form>
  );
}
