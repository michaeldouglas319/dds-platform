'use client';

import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';
import { BrandHeading } from '@dds/ui';
import siteConfig from '../data/site.config.json';

const homePage = siteConfig.pages.find((p: { path: string }) => p.path === '/');
const sections = homePage?.sections ?? [];
const hero = sections[0];

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
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>
        </div>
      )}
    </section>
  );
}

/* ─── Section 2: Membership Confirmation ─── */
function MembershipSection() {
  return (
    <section className="membership-section" id="membership" style={{
      padding: '6rem 2rem',
      textAlign: 'center',
      minHeight: '60vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '2rem'
    }}>
      <SignedOut>
        <h2>Join the Founding Membership</h2>
        <p style={{ maxWidth: '40rem', margin: '0 auto', opacity: 0.8, lineHeight: 1.6 }}>
          Get early access, founding member pricing, and direct influence on what we build next.
        </p>
        <SignUpButton mode="modal">
          <button className="btn-primary" style={{ marginTop: '1rem' }}>Create Account →</button>
        </SignUpButton>
      </SignedOut>

      <SignedIn>
        <h2>You're In</h2>
        <p style={{ maxWidth: '40rem', margin: '0 auto', opacity: 0.8, lineHeight: 1.6 }}>
          You're part of the founding membership. More details coming soon.
        </p>
        <UserButton afterSignOutUrl="/" />
      </SignedIn>
    </section>
  );
}

/* ─── Page ─── */
export default function Home() {
  return (
    <main>
      <HeroSection />
      <MembershipSection />
    </main>
  );
}
