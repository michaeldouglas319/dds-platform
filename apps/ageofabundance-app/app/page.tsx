'use client';

import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton, useUser } from '@clerk/nextjs';
import { BrandHeading } from '@dds/ui';
import { useFormInput } from '@dds/hooks';
import siteConfig from '../data/site.config.json';

const homePage = siteConfig.pages.find((p: { path: string }) => p.path === '/');
const sections = homePage?.sections ?? [];
const hero = sections[0];
const twoFutures = sections[1];
const sectorsContact = sections[2];

/* ─── Contact form ─── */
function ContactForm() {
  const name = useFormInput('');
  const email = useFormInput('');
  const message = useFormInput('');
  const { user } = useUser();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Wire to API endpoint
    alert(`Thanks ${name.value || user?.firstName || 'there'}! We'll be in touch.`);
  };

  return (
    <form onSubmit={handleSubmit} className="contact-form">
      <h3>Get in Touch</h3>
      <input
        type="text"
        placeholder="Name"
        value={name.value}
        onChange={name.onChange}
        required
      />
      <input
        type="email"
        placeholder="Email"
        value={email.value}
        onChange={email.onChange}
        required
      />
      <textarea
        placeholder="Message"
        rows={4}
        value={message.value}
        onChange={message.onChange}
        required
      />
      <button type="submit">Send</button>
    </form>
  );
}

/* ─── Section 1: Hero (public) ─── */
function HeroSection() {
  return (
    <section className="hero-area" id="hero">
      <BrandHeading>{(siteConfig.app as Record<string, unknown>).label as string}</BrandHeading>

      {hero && (
        <div className="hero-content">
          <h1 className="hero-hook">{hero.subject?.title}</h1>
          {hero.content?.body && (
            <p className="hero-body">{hero.content.body}</p>
          )}
          {hero.content?.highlights && (
            <div className="hero-pills">
              {(hero.content.highlights as string[]).map((h: string) => (
                <span key={h} className="pill">{h}</span>
              ))}
            </div>
          )}

          <div className="hero-cta">
            <SignedOut>
              <SignUpButton mode="modal">
                <button className="btn-primary">Join the Movement</button>
              </SignUpButton>
              <SignInButton mode="modal">
                <button className="btn-secondary">Sign In</button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <a href="#two-futures" className="btn-primary">Explore Futures</a>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>
        </div>
      )}
    </section>
  );
}

/* ─── Section 2: Two Futures (auth-gated) ─── */
function TwoFuturesSection() {
  const highlights = (twoFutures?.content?.highlights ?? []) as Array<{
    subtitle: string;
    description: string;
  }>;

  return (
    <section className="section-two-futures" id="two-futures">
      <div className="section-header">
        <h2>{twoFutures?.subject?.title}</h2>
        <p className="section-subtitle">{twoFutures?.subject?.subtitle}</p>
        {twoFutures?.content?.body && (
          <p className="section-body">{twoFutures.content.body}</p>
        )}
      </div>

      <div className="futures-grid">
        {highlights.map((h) => (
          <div
            key={h.subtitle}
            className={`future-card ${h.subtitle.includes('Utopia') ? 'utopia' : 'extraction'}`}
          >
            <h3>{h.subtitle}</h3>
            <p>{h.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── Section 3: Sectors + Contact + Registration (auth-gated) ─── */
function SectorsContactSection() {
  const items = (sectorsContact?.content?.items ?? []) as string[];

  return (
    <section className="section-sectors" id="sectors">
      <div className="section-header">
        <h2>{sectorsContact?.subject?.title}</h2>
        <p className="section-subtitle">{sectorsContact?.subject?.subtitle}</p>
        {sectorsContact?.content?.body && (
          <p className="section-body">{sectorsContact.content.body}</p>
        )}
      </div>

      <div className="sectors-grid">
        {items.map((item: string) => {
          const [label, domain] = item.split(' — ');
          return (
            <div key={item} className="sector-card">
              <span className="sector-label">{label}</span>
              {domain && <span className="sector-domain">{domain}</span>}
            </div>
          );
        })}
      </div>

      <div className="contact-registration-row">
        <ContactForm />
        <div className="clerk-registration">
          <h3>Clerk Registration</h3>
          <p>Create your account to access the full platform, track sectors, and stay ahead of both futures.</p>
          <SignedOut>
            <SignUpButton mode="modal">
              <button className="btn-primary">Register Now</button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <div className="registered-badge">
              <UserButton afterSignOutUrl="/" />
              <span>You&apos;re registered</span>
            </div>
          </SignedIn>
        </div>
      </div>
    </section>
  );
}

/* ─── Page ─── */
export default function Home() {
  return (
    <main>
      <HeroSection />

      <SignedIn>
        <TwoFuturesSection />
        <SectorsContactSection />
      </SignedIn>

      <SignedOut>
        <section className="auth-gate">
          <div className="auth-gate-content">
            <h2>See what&apos;s behind the umbrella</h2>
            <p>Sign in to explore both futures, browse umbrella sectors, and register as a clerk.</p>
            <div className="auth-gate-buttons">
              <SignUpButton mode="modal">
                <button className="btn-primary">Create Account</button>
              </SignUpButton>
              <SignInButton mode="modal">
                <button className="btn-secondary">Sign In</button>
              </SignInButton>
            </div>
          </div>
        </section>
      </SignedOut>
    </main>
  );
}
