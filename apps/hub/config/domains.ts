/**
 * DDS Hub — Domain Registry
 *
 * Maps each domain to its renderer type and config.
 * Add an entry here to override the default landing for any domain.
 * Domains not listed fall back to 'landing' (white room + domain name).
 *
 * Renderer types map to ARCHITECTURE.md package assignments.
 * Each type is scaffolded in renderers/ and ready to implement.
 */

export type RendererType =
  | 'landing'   // white room — default
  | 'puck'      // Puck visual builder (.site, .online)
  | 'wiki'      // Fumadocs (.wiki)
  | 'shop'      // Medusa.js (.shop)
  | 'gallery'   // react-photo-album (.art)
  | 'docs'      // Scalar (.net, blackdot.dev)
  | 'dashboard' // Recharts + TanStack (.app)
  | 'blog'      // Keystatic (.dev)
  | 'community' // Supabase Realtime (.space)
  | 'tech'      // Sandpack + Shiki (.tech)

export interface DomainConfig {
  renderer: RendererType
  /** Override the display label (defaults to the domain itself) */
  label?: string
  /** Icon displayed above the dot. Defaults to cuneiform monogram 𒌓 */
  icon?: string | false
  /** Header section content (universal schema subject/content) */
  header?: {
    title: string
    subtitle?: string
    slogan?: string
  }
  /** Arbitrary renderer-specific config */
  options?: Record<string, unknown>
}

// ---------------------------------------------------------------------------
// Registry — domain → config
// Add entries as each domain gets built out.
// ---------------------------------------------------------------------------
// ═══════════════════════════════════════════════════════════
// Cuneiform Icon Assignments
// Each domain gets a unique Sumerian glyph. These are the
// ancient layer — modern icons will overlay/transition later.
// ═══════════════════════════════════════════════════════════

const REGISTRY: Record<string, DomainConfig> = {
  // ── Black Dot ─────────────────────────────────────────
  'blackdot.capital': {
    renderer: 'landing',
    icon: '𒀭',  // AN — god/sky/wealth
    header: {
      title: 'Black Dot Capital',
      subtitle: 'Strategic Investment & Venture Architecture',
      slogan: 'Where conviction meets capital.',
    },
  },
  'blackdot.partners': {
    renderer: 'landing',
    icon: '𒁹',  // DIŠ — unity/one
    header: {
      title: 'Black Dot Partners',
      subtitle: 'Design, Engineering & Growth',
      slogan: 'Building what matters.',
    },
  },
  'blackdot.dev': {
    renderer: 'landing',
    icon: '𒌋',  // U — foundation/base
    header: {
      title: 'Black Dot Dev',
      subtitle: 'Developer Platform & API',
      slogan: 'The infrastructure layer.',
    },
  },
  'blackdot.space': {
    renderer: 'landing',
    icon: '𒀊',  // A — water/origin
    header: {
      title: 'Black Dot Space',
      subtitle: 'Creative Lab & Experiments',
      slogan: 'Ideas without boundaries.',
    },
  },

  // ── The Age of Abundance ──────────────────────────────
  'theageofabundance.shop':   { renderer: 'landing', icon: '𒀀', header: { title: 'theageofabundance.shop', slogan: 'Abundant goods, delivered.' } },
  'theageofabundance.cloud':  { renderer: 'landing', icon: '𒀁', header: { title: 'theageofabundance.cloud', slogan: 'Infinite infrastructure.' } },
  'theageofabundance.store':  { renderer: 'landing', icon: '𒀂', header: { title: 'theageofabundance.store', slogan: 'Everything, always available.' } },
  'theageofabundance.app':    { renderer: 'landing', icon: '𒀃', header: { title: 'theageofabundance.app', slogan: 'Your abundance, daily.' } },
  'theageofabundance.wiki':   { renderer: 'landing', icon: '𒀄', header: { title: 'theageofabundance.wiki', slogan: 'Collective knowledge.' } },
  'theageofabundance.info':   { renderer: 'landing', icon: '𒀅', header: { title: 'theageofabundance.info', slogan: 'Signal over noise.' } },
  'theageofabundance.agency': { renderer: 'landing', icon: '𒀆', header: { title: 'theageofabundance.agency', slogan: 'Sovereign execution.' } },
  'theageofabundance.actor':  { renderer: 'landing', icon: '𒀇', header: { title: 'theageofabundance.actor', slogan: 'Talent without limits.' } },
  'theageofabundance.ai':     { renderer: 'landing', icon: '𒀈', header: { title: 'theageofabundance.ai', slogan: 'Intelligence, abundant.' } },
  'theageofabundance.net':    { renderer: 'landing', icon: '𒀉', header: { title: 'theageofabundance.net', slogan: 'Connected abundance.' } },
  'theageofabundance.org':    { renderer: 'landing', icon: '𒀋', header: { title: 'theageofabundance.org', slogan: 'The mission.' } },
  'theageofabundance.studio': { renderer: 'landing', icon: '𒀌', header: { title: 'theageofabundance.studio', slogan: 'Where work ships.' } },
  'theageofabundance.space':  { renderer: 'landing', icon: '𒀍', header: { title: 'theageofabundance.space', slogan: 'Room to grow.' } },

  // ── Age of Abundance ──────────────────────────────────
  'ageofabundance.shop':   { renderer: 'landing', icon: '𒀎', header: { title: 'ageofabundance.shop', slogan: 'Commerce, reimagined.' } },
  'ageofabundance.store':  { renderer: 'landing', icon: '𒀏', header: { title: 'ageofabundance.store', slogan: 'Supply meets demand.' } },
  'ageofabundance.art':    { renderer: 'landing', icon: '𒀐', header: { title: 'ageofabundance.art', slogan: 'Beauty in surplus.' } },
  'ageofabundance.asia':   { renderer: 'landing', icon: '𒀑', header: { title: 'ageofabundance.asia', slogan: 'Eastern abundance.' } },
  'ageofabundance.wiki':   { renderer: 'landing', icon: '𒀒', header: { title: 'ageofabundance.wiki', slogan: 'Open knowledge.' } },
  'ageofabundance.dev':    { renderer: 'landing', icon: '𒀓', header: { title: 'ageofabundance.dev', slogan: 'Build the future.' } },
  'ageofabundance.app':    { renderer: 'landing', icon: '𒁀', header: { title: 'ageofabundance.app', slogan: 'Tools for everyone.' } },
  'ageofabundance.space':  { renderer: 'landing', icon: '𒁁', header: { title: 'ageofabundance.space', slogan: 'Explore freely.' } },
  'ageofabundance.online': { renderer: 'puck', icon: '𒁂', header: { title: 'ageofabundance.online', slogan: 'Always on.' } },
  'ageofabundance.site':   { renderer: 'puck', icon: '𒁃', header: { title: 'ageofabundance.site', slogan: 'Your ground.' } },
  'ageofabundance.tech':   { renderer: 'landing', icon: '𒁄', header: { title: 'ageofabundance.tech', slogan: 'Deep technology.' } },
  'ageofabundance.net':    { renderer: 'landing', icon: '𒁅', header: { title: 'ageofabundance.net', slogan: 'The network.' } },
  'ageofabundance.info':   { renderer: 'landing', icon: '𒁆', header: { title: 'ageofabundance.info', slogan: 'Truth, sourced.' } },
  'ageofabundance.agency': { renderer: 'landing', icon: '𒁇', header: { title: 'ageofabundance.agency', slogan: 'Agency for all.' } },
  'ageofabundance.actor':  { renderer: 'landing', icon: '𒁈', header: { title: 'ageofabundance.actor', slogan: 'Play your part.' } },
  'ageofabundance.xyz':    { renderer: 'landing', icon: '𒁉', header: { title: 'ageofabundance.xyz', slogan: 'The unknown.' } },

  // ── Personal ──────────────────────────────────────────
  'michaeldouglas.app':    { renderer: 'landing', icon: '𒌓', header: { title: 'michaeldouglas.app', slogan: 'By Michael Douglas.' } }
};

// ---------------------------------------------------------------------------
// Resolver
// ---------------------------------------------------------------------------
export function getDomainConfig(host: string): DomainConfig & { domain: string } {
  const domain = host
    .toLowerCase()
    .replace(/:\d+$/, '')     // strip port
    .replace(/^www\./, '');   // strip www

  const config = REGISTRY[domain] ?? { renderer: 'landing' };
  return { ...config, domain };
}
