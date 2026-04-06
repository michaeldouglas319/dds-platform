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
  'theageofabundance.shop':   { renderer: 'landing', icon: '𒀀' },  // A₂ — exchange
  'theageofabundance.cloud':  { renderer: 'landing', icon: '𒀁' },  // cloud/sky
  'theageofabundance.store':  { renderer: 'landing', icon: '𒀂' },  // container
  'theageofabundance.app':    { renderer: 'landing', icon: '𒀃' },  // instrument
  'theageofabundance.wiki':   { renderer: 'landing', icon: '𒀄' },  // tablet/record
  'theageofabundance.info':   { renderer: 'landing', icon: '𒀅' },  // voice/word
  'theageofabundance.agency': { renderer: 'landing', icon: '𒀆' },  // authority
  'theageofabundance.actor':  { renderer: 'landing', icon: '𒀇' },  // person/hero
  'theageofabundance.ai':     { renderer: 'landing', icon: '𒀈' },  // mind/thought
  'theageofabundance.net':    { renderer: 'landing', icon: '𒀉' },  // web/bind
  'theageofabundance.org':    { renderer: 'landing', icon: '𒀋' },  // assembly
  'theageofabundance.studio': { renderer: 'landing', icon: '𒀌' },  // workshop
  'theageofabundance.space':  { renderer: 'landing', icon: '𒀍' },  // cosmos

  // ── Age of Abundance ──────────────────────────────────
  'ageofabundance.shop':   { renderer: 'landing', icon: '𒀎' },  // trade
  'ageofabundance.store':  { renderer: 'landing', icon: '𒀏' },  // house/storage
  'ageofabundance.art':    { renderer: 'landing', icon: '𒀐' },  // beauty/form
  'ageofabundance.asia':   { renderer: 'landing', icon: '𒀑' },  // east/sunrise
  'ageofabundance.wiki':   { renderer: 'landing', icon: '𒀒' },  // scribe
  'ageofabundance.dev':    { renderer: 'landing', icon: '𒀓' },  // create/build
  'ageofabundance.app':    { renderer: 'landing', icon: '𒁀' },  // craft
  'ageofabundance.space':  { renderer: 'landing', icon: '𒁁' },  // heaven
  'ageofabundance.online': { renderer: 'puck', icon: '𒁂' },     // life/presence
  'ageofabundance.site':   { renderer: 'puck', icon: '𒁃' },     // land/ground
  'ageofabundance.tech':   { renderer: 'landing', icon: '𒁄' },  // measure
  'ageofabundance.net':    { renderer: 'landing', icon: '𒁅' },  // connect
  'ageofabundance.info':   { renderer: 'landing', icon: '𒁆' },  // tell/announce
  'ageofabundance.agency': { renderer: 'landing', icon: '𒁇' },  // command
  'ageofabundance.actor':  { renderer: 'landing', icon: '𒁈' },  // warrior
  'ageofabundance.xyz':    { renderer: 'landing', icon: '𒁉' },  // mystery/unknown

  // ── Personal ──────────────────────────────────────────
  'michaeldouglas.app':    { renderer: 'landing', icon: '𒌓' },  // UD — sun/light (the original monogram)
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
