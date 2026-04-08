'use client';

import { useState, type CSSProperties, type FormEvent } from 'react';

// ── Types ────────────────────────────────────────────────

export interface PartnershipTier {
  name: string;
  description: string;
  features: string[];
  highlight?: boolean;
}

export interface PartnershipPitchProps {
  /** Headline. Default: "Partner With Us" */
  headline?: string;
  /** Subheadline / value prop */
  subheadline?: string;
  /** Key stats to display */
  stats?: { value: string; label: string }[];
  /** Partnership tiers / offerings */
  tiers?: PartnershipTier[];
  /** Brand accent color. Default: #8b5cf6 */
  accent?: string;
  /** Called on successful registration */
  onRegister?: (data: RegistrationData) => void | Promise<void>;
  /** External registration endpoint (POST JSON) */
  registerEndpoint?: string;
  /** Hide the registration form */
  hideForm?: boolean;
  className?: string;
  style?: CSSProperties;
}

export interface RegistrationData {
  name: string;
  email: string;
  company?: string;
  interest: string;
  message?: string;
  method: 'email' | 'google';
}

// ── Defaults ────��────────────────────────────────────────

const DEFAULT_STATS = [
  { value: '34+', label: 'Live Domains' },
  { value: '1', label: 'Unified Platform' },
  { value: '∞', label: 'Possibilities' },
];

const DEFAULT_TIERS: PartnershipTier[] = [
  {
    name: 'Technology Partner',
    description: 'Integrate your tools and services across the entire ecosystem.',
    features: ['API access to all domains', 'Shared infrastructure', 'Co-branded presence', 'Technical support'],
  },
  {
    name: 'Strategic Partner',
    description: 'Deep collaboration on product, growth, and go-to-market.',
    features: ['Revenue sharing', 'Joint product development', 'Cross-promotion', 'Dedicated account team'],
    highlight: true,
  },
  {
    name: 'Investment Partner',
    description: 'Participate in the growth of the abundance economy.',
    features: ['Portfolio access', 'Board observer rights', 'Deal flow', 'Quarterly updates'],
  },
];

// ── Inline Auth Form ─────────────────────────────────────

function AuthRegisterForm({
  accent,
  onSubmit,
  endpoint,
}: {
  accent: string;
  onSubmit?: (data: RegistrationData) => void | Promise<void>;
  endpoint?: string;
}) {
  const [form, setForm] = useState({ name: '', email: '', company: '', interest: 'technology', message: '' });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const set = (field: string) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const submit = async (method: 'email' | 'google') => {
    if (!form.name || !form.email) return;

    const data: RegistrationData = { ...form, method };
    setStatus('submitting');

    try {
      if (endpoint) {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error(await res.text());
      }
      await onSubmit?.(data);
      setStatus('success');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong');
      setStatus('error');
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    submit('email');
  };

  const handleGoogle = () => {
    // Opens Google OAuth popup — Clerk/custom handler can intercept
    if (typeof window !== 'undefined' && (window as any).__dds_google_auth) {
      (window as any).__dds_google_auth().then((profile: { name: string; email: string }) => {
        setForm((f) => ({ ...f, name: profile.name, email: profile.email }));
        submit('google');
      });
    } else {
      // Fallback: just submit with google method flag
      submit('google');
    }
  };

  const inputStyle: CSSProperties = {
    width: '100%',
    padding: '0.75rem 1rem',
    borderRadius: 8,
    border: '1px solid rgba(255,255,255,0.12)',
    background: 'rgba(255,255,255,0.04)',
    color: 'inherit',
    fontSize: '0.9rem',
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
  };

  if (status === 'success') {
    return (
      <div style={{
        padding: '3rem 2rem',
        textAlign: 'center',
        borderRadius: 12,
        border: `1px solid ${accent}40`,
        background: `${accent}10`,
      }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>&#10003;</div>
        <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>Welcome aboard</h3>
        <p style={{ opacity: 0.7 }}>We'll be in touch at <strong>{form.email}</strong></p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: 480, margin: '0 auto' }}>
      {/* Google Sign-In Button */}
      <button
        type="button"
        onClick={handleGoogle}
        disabled={status === 'submitting'}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.75rem',
          padding: '0.75rem 1.5rem',
          borderRadius: 8,
          border: '1px solid rgba(255,255,255,0.15)',
          background: 'rgba(255,255,255,0.06)',
          color: 'inherit',
          fontSize: '0.9rem',
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'background 0.2s',
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Continue with Google
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', opacity: 0.3, fontSize: '0.8rem' }}>
        <div style={{ flex: 1, height: 1, background: 'currentColor' }} />
        or register with email
        <div style={{ flex: 1, height: 1, background: 'currentColor' }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <input style={inputStyle} placeholder="Name *" required value={form.name} onChange={set('name')} />
        <input style={inputStyle} placeholder="Company" value={form.company} onChange={set('company')} />
      </div>

      <input style={inputStyle} type="email" placeholder="Email *" required value={form.email} onChange={set('email')} />

      <select
        style={{ ...inputStyle, appearance: 'none' }}
        value={form.interest}
        onChange={set('interest')}
      >
        <option value="technology">Technology Partner</option>
        <option value="strategic">Strategic Partner</option>
        <option value="investment">Investment Partner</option>
        <option value="creative">Creative Collaboration</option>
        <option value="other">Other</option>
      </select>

      <textarea
        style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }}
        placeholder="Tell us about your interest (optional)"
        value={form.message}
        onChange={set('message')}
      />

      {status === 'error' && (
        <div style={{ color: '#ef4444', fontSize: '0.85rem' }}>{errorMsg}</div>
      )}

      <button
        type="submit"
        disabled={status === 'submitting'}
        style={{
          padding: '0.85rem 2rem',
          borderRadius: 8,
          border: 'none',
          background: accent,
          color: 'white',
          fontSize: '0.95rem',
          fontWeight: 600,
          cursor: 'pointer',
          opacity: status === 'submitting' ? 0.6 : 1,
          transition: 'opacity 0.2s',
        }}
      >
        {status === 'submitting' ? 'Registering...' : 'Register as Partner'}
      </button>

      <p style={{ fontSize: '0.75rem', opacity: 0.4, textAlign: 'center', margin: 0 }}>
        No redirect. Your data stays here. We'll reach out within 48 hours.
      </p>
    </form>
  );
}

// ── Main Component ───────────���───────────────────────────

export function PartnershipPitch({
  headline = 'Partner With Us',
  subheadline = 'Join the ecosystem powering the next era of abundance. One platform, infinite verticals, shared infrastructure.',
  stats = DEFAULT_STATS,
  tiers = DEFAULT_TIERS,
  accent = '#8b5cf6',
  onRegister,
  registerEndpoint,
  hideForm = false,
  className,
  style,
}: PartnershipPitchProps) {
  return (
    <section className={className} style={{ padding: '5rem 2rem', maxWidth: '1000px', margin: '0 auto', ...style }}>
      {/* Pitch Header */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 700, marginBottom: '1rem' }}>
          {headline}
        </h2>
        <p style={{ fontSize: '1.1rem', opacity: 0.75, lineHeight: 1.7, maxWidth: '40rem', margin: '0 auto' }}>
          {subheadline}
        </p>
      </div>

      {/* Stats Bar */}
      {stats.length > 0 && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '3rem',
          flexWrap: 'wrap',
          marginBottom: '3.5rem',
          padding: '1.5rem 0',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          {stats.map((s) => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, color: accent }}>{s.value}</div>
              <div style={{ fontSize: '0.8rem', opacity: 0.5 }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Tiers */}
      {tiers.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(auto-fit, minmax(${Math.min(280, 900 / tiers.length)}px, 1fr))`,
          gap: '1.25rem',
          marginBottom: '3.5rem',
        }}>
          {tiers.map((tier) => (
            <div
              key={tier.name}
              style={{
                padding: '2rem 1.75rem',
                borderRadius: 10,
                border: `1px solid ${tier.highlight ? accent + '60' : 'rgba(255,255,255,0.08)'}`,
                background: tier.highlight ? accent + '10' : 'rgba(255,255,255,0.02)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}
            >
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: tier.highlight ? accent : 'inherit', margin: 0 }}>
                {tier.name}
              </h3>
              <p style={{ margin: 0, opacity: 0.7, fontSize: '0.9rem', lineHeight: 1.5 }}>
                {tier.description}
              </p>
              <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.85rem', opacity: 0.65, lineHeight: 1.8 }}>
                {tier.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* Registration Form */}
      {!hideForm && (
        <div style={{ marginTop: '2rem' }}>
          <h3 style={{ textAlign: 'center', fontSize: '1.3rem', fontWeight: 700, marginBottom: '2rem' }}>
            Register Your Interest
          </h3>
          <AuthRegisterForm
            accent={accent}
            onSubmit={onRegister}
            endpoint={registerEndpoint}
          />
        </div>
      )}
    </section>
  );
}
