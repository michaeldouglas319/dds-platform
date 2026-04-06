'use client';

import { BrandHeading } from '@dds/ui';
import { DOMAINS, ABUNDANCE_DOMAINS, BLACKDOT_DOMAINS, LIVE_DOMAINS, COMING_SOON_DOMAINS } from '@dds/config/domains';

// ─── SVG Icon Components ─────────────────────────────────────────

function IconLayers() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  );
}

function IconCode() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}

function IconFlask() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 3h6" />
      <path d="M10 3v6.5L4 20h16l-6-10.5V3" />
      <path d="M8.5 14h7" />
    </svg>
  );
}

function IconServer() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
      <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
      <line x1="6" y1="6" x2="6.01" y2="6" />
      <line x1="6" y1="18" x2="6.01" y2="18" />
    </svg>
  );
}

function IconHandshake() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z" />
    </svg>
  );
}

function IconTrendingUp() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}

function IconPalette() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="13.5" cy="6.5" r="2" />
      <circle cx="17.5" cy="10.5" r="2" />
      <circle cx="8.5" cy="7.5" r="2" />
      <circle cx="6.5" cy="12.5" r="2" />
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
    </svg>
  );
}

function IconStar() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function IconShoppingBag() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}

function IconAppWindow() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="18" rx="2" />
      <line x1="2" y1="9" x2="22" y2="9" />
      <line x1="6" y1="6" x2="6.01" y2="6" />
      <line x1="10" y1="6" x2="10.01" y2="6" />
    </svg>
  );
}

function IconBook() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

function IconCpu() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <rect x="9" y="9" width="6" height="6" />
      <line x1="9" y1="1" x2="9" y2="4" />
      <line x1="15" y1="1" x2="15" y2="4" />
      <line x1="9" y1="20" x2="9" y2="23" />
      <line x1="15" y1="20" x2="15" y2="23" />
      <line x1="20" y1="9" x2="23" y2="9" />
      <line x1="20" y1="14" x2="23" y2="14" />
      <line x1="1" y1="9" x2="4" y2="9" />
      <line x1="1" y1="14" x2="4" y2="14" />
    </svg>
  );
}

function IconUsers() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function IconGlobe() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function IconBriefcase() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );
}

function IconMonitor() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  );
}

function IconBuilding() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
      <line x1="9" y1="6" x2="9.01" y2="6" />
      <line x1="15" y1="6" x2="15.01" y2="6" />
      <line x1="9" y1="10" x2="9.01" y2="10" />
      <line x1="15" y1="10" x2="15.01" y2="10" />
      <line x1="9" y1="14" x2="9.01" y2="14" />
      <line x1="15" y1="14" x2="15.01" y2="14" />
      <path d="M9 22v-4h6v4" />
    </svg>
  );
}

function IconDiamond() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l10 10-10 10L2 12z" />
    </svg>
  );
}

// ─── Icon Mapping ────────────────────────────────────────────────

const CATEGORY_ICONS: Record<string, () => JSX.Element> = {
  flagship: IconStar,
  infrastructure: IconServer,
  commerce: IconShoppingBag,
  saas: IconAppWindow,
  creative: IconPalette,
  knowledge: IconBook,
  developer: IconCode,
  technology: IconCpu,
  community: IconUsers,
  regional: IconGlobe,
  services: IconBriefcase,
  digital: IconMonitor,
  corporate: IconBuilding,
  experimental: IconFlask,
  partnerships: IconHandshake,
  investment: IconTrendingUp,
};

function getCategoryIcon(category?: string) {
  const Icon = category ? CATEGORY_ICONS[category] : undefined;
  return Icon ? <Icon /> : <IconDiamond />;
}

// ─── Tile Component ──────────────────────────────────────────────

function Tile({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/50 p-6 text-center backdrop-blur-sm transition-all hover:border-violet-500/40 hover:bg-neutral-800/60">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-violet-500/0 to-violet-500/5 opacity-0 transition-opacity group-hover:opacity-100" />
      <div className="relative mb-3 flex justify-center text-neutral-500 transition-colors group-hover:text-violet-400">
        {icon}
      </div>
      <span className="relative text-sm font-medium text-neutral-300 group-hover:text-white">
        {label}
      </span>
    </div>
  );
}

function LinkTile({ icon, label, href, status }: { icon: React.ReactNode; label: string; href: string; status?: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative block overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/50 p-6 text-center no-underline backdrop-blur-sm transition-all hover:border-violet-500/40 hover:bg-neutral-800/60"
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-violet-500/0 to-violet-500/5 opacity-0 transition-opacity group-hover:opacity-100" />
      <div className="relative mb-3 flex justify-center text-neutral-500 transition-colors group-hover:text-violet-400">
        {icon}
      </div>
      <span className="relative block text-sm font-medium text-neutral-300 group-hover:text-white">
        {label}
      </span>
      {status && (
        <span className={`relative mt-2 inline-block rounded px-2 py-0.5 text-xs ${
          status === 'live'
            ? 'bg-emerald-500/20 text-emerald-400'
            : 'bg-violet-500/20 text-violet-400'
        }`}>
          {status === 'live' ? 'Live' : 'Soon'}
        </span>
      )}
    </a>
  );
}

// ─── Page ────────────────────────────────────────────────────────

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-6 py-24 text-center">
        <BrandHeading>BlackDot</BrandHeading>
        <h1 className="text-[clamp(2rem,5vw,3.5rem)] font-bold">
          Partners
        </h1>
        <p className="max-w-xl text-lg leading-relaxed text-neutral-400">
          Bring Your Expertise
        </p>
        <p className="max-w-2xl text-base leading-relaxed text-neutral-500">
          The engineering backbone of the Age of Abundance ecosystem. We build the infrastructure, tools, and platforms that power {DOMAINS.length}+ domains of abundance.
        </p>
      </section>

      {/* What We Build */}
      <section className="border-y border-violet-500/20 bg-violet-500/[0.03] px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-12 text-center text-[clamp(1.8rem,4vw,2.5rem)] font-bold">
            What We Build
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Tile icon={<IconLayers />} label="Universal Platform" />
            <Tile icon={<IconCode />} label="Developer Tools" />
            <Tile icon={<IconFlask />} label="Creative Laboratory" />
            <Tile icon={<IconServer />} label="Shared Infrastructure" />
          </div>
        </div>
      </section>

      {/* The Ecosystem */}
      <section className="mx-auto w-full max-w-6xl px-6 py-16">
        <h2 className="mb-12 text-center text-2xl font-bold">
          The Ecosystem ({DOMAINS.length} Domains)
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {DOMAINS.map((domain) => (
            <LinkTile
              key={domain.domain}
              icon={getCategoryIcon(domain.category)}
              label={domain.label}
              href={domain.url}
              status={domain.status}
            />
          ))}
        </div>
      </section>

      {/* Summary Stats */}
      <section className="border-y border-white/10 bg-violet-500/5 px-6 py-16 text-center">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5">
          {[
            { value: DOMAINS.length, label: 'Total Domains' },
            { value: LIVE_DOMAINS.length, label: 'Live Now' },
            { value: COMING_SOON_DOMAINS.length, label: 'Coming Soon' },
            { value: ABUNDANCE_DOMAINS.length, label: 'Age of Abundance' },
            { value: BLACKDOT_DOMAINS.length, label: 'BlackDot' },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="mb-1 text-4xl font-bold">{stat.value}</div>
              <div className="text-sm text-neutral-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Let's Build Together */}
      <section className="border-t border-violet-500/20 bg-gradient-to-br from-violet-500/10 to-violet-500/5 px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-4 text-center text-[clamp(1.8rem,4vw,2.5rem)] font-bold">
            Let&apos;s Build Together
          </h2>
          <p className="mx-auto mb-12 max-w-2xl text-center text-base leading-relaxed text-neutral-400">
            BlackDot is open to partnerships, integrations, and collaborations. Whether you&apos;re a developer, designer, partner, or investor — we&apos;re interested in building the future of abundance with you.
          </p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <LinkTile icon={<IconCode />} label="Developers" href="https://blackdot.dev" />
            <LinkTile icon={<IconHandshake />} label="Partners" href="https://blackdot.partners" />
            <LinkTile icon={<IconTrendingUp />} label="Investors" href="https://blackdot.capital" />
            <LinkTile icon={<IconPalette />} label="Creatives" href="https://blackdot.space" />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24 text-center">
        <h2 className="mb-6 text-2xl font-bold">
          Ready to Join?
        </h2>
        <p className="mx-auto mb-10 max-w-lg text-neutral-500 leading-relaxed">
          Start with The Age of Abundance to join our founding membership, or reach out directly to discuss partnership opportunities.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <a
            href="https://theageofabundance.ai"
            className="inline-block rounded-lg bg-violet-600 px-6 py-3 font-semibold text-white transition-opacity hover:opacity-80"
          >
            Join the Ecosystem →
          </a>
          <a
            href="mailto:partners@blackdot.dev"
            className="inline-block rounded-lg border border-violet-500/50 bg-transparent px-6 py-3 font-semibold text-white transition-all hover:border-violet-500/80 hover:bg-violet-500/10"
          >
            Contact Partners
          </a>
        </div>
      </section>
    </main>
  );
}
