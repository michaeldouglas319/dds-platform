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
  | 'grid'      // tile grid of all apps
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
  'blackdot.capital':  { renderer: 'landing', icon: '𒀭', header: { title: 'Black Dot Capital', subtitle: 'Finance' } },
  'blackdot.partners': { renderer: 'grid', icon: '𒁹', header: { title: 'Black Dot Partners', subtitle: 'Business' } },
  'blackdot.dev':      { renderer: 'landing', icon: '𒌋', header: { title: 'Black Dot Dev', subtitle: 'Developer Tools' } },
  'blackdot.space':    { renderer: 'landing', icon: '𒀊', header: { title: 'Black Dot Space', subtitle: 'Graphics & Design' } },

  // ── The Age of Abundance ──────────────────────────────
  'theageofabundance.shop':   { renderer: 'landing', icon: '𒀀', header: { title: 'theageofabundance.shop', subtitle: 'Shopping' } },
  'theageofabundance.cloud':  { renderer: 'landing', icon: '𒀁', header: { title: 'theageofabundance.cloud', subtitle: 'Utilities' } },
  'theageofabundance.store':  { renderer: 'landing', icon: '𒀂', header: { title: 'theageofabundance.store', subtitle: 'Shopping' } },
  'theageofabundance.app':    { renderer: 'landing', icon: '𒀃', header: { title: 'theageofabundance.app', subtitle: 'Productivity' } },
  'theageofabundance.wiki':   { renderer: 'landing', icon: '𒀄', header: { title: 'theageofabundance.wiki', subtitle: 'Reference' } },
  'theageofabundance.info':   { renderer: 'landing', icon: '𒀅', header: { title: 'theageofabundance.info', subtitle: 'Reference' } },
  'theageofabundance.agency': { renderer: 'landing', icon: '𒀆', header: { title: 'theageofabundance.agency', subtitle: 'Business' } },
  'theageofabundance.actor':  { renderer: 'landing', icon: '𒀇', header: { title: 'theageofabundance.actor', subtitle: 'Entertainment' } },
  'theageofabundance.ai':     { renderer: 'landing', icon: '𒀈', header: { title: 'theageofabundance.ai', subtitle: 'Productivity' } },
  'theageofabundance.net':    { renderer: 'landing', icon: '𒀉', header: { title: 'theageofabundance.net', subtitle: 'Social Networking' } },
  'theageofabundance.org':    { renderer: 'landing', icon: '𒀋', header: { title: 'theageofabundance.org', subtitle: 'Lifestyle' } },
  'theageofabundance.studio': { renderer: 'landing', icon: '𒀌', header: { title: 'theageofabundance.studio', subtitle: 'Graphics & Design' } },
  'theageofabundance.space':  { renderer: 'landing', icon: '𒀍', header: { title: 'theageofabundance.space', subtitle: 'Social Networking' } },

  // ── Age of Abundance ──────────────────────────────────
  'ageofabundance.shop':   { renderer: 'landing', icon: '𒀎', header: { title: 'ageofabundance.shop', subtitle: 'Shopping' } },
  'ageofabundance.store':  { renderer: 'landing', icon: '𒀏', header: { title: 'ageofabundance.store', subtitle: 'Shopping' } },
  'ageofabundance.art':    { renderer: 'landing', icon: '𒀐', header: { title: 'ageofabundance.art', subtitle: 'Photo & Video' } },
  'ageofabundance.asia':   { renderer: 'landing', icon: '𒀑', header: { title: 'ageofabundance.asia', subtitle: 'Travel' } },
  'ageofabundance.wiki':   { renderer: 'landing', icon: '𒀒', header: { title: 'ageofabundance.wiki', subtitle: 'Education' } },
  'ageofabundance.dev':    { renderer: 'landing', icon: '𒀓', header: { title: 'ageofabundance.dev', subtitle: 'Developer Tools' } },
  'ageofabundance.app':    { renderer: 'landing', icon: '𒁀', header: { title: 'ageofabundance.app', subtitle: 'Productivity' } },
  'ageofabundance.space':  { renderer: 'landing', icon: '𒁁', header: { title: 'ageofabundance.space', subtitle: 'Social Networking' } },
  'ageofabundance.online': { renderer: 'puck', icon: '𒁂', header: { title: 'ageofabundance.online', subtitle: 'Lifestyle' } },
  'ageofabundance.site':   { renderer: 'puck', icon: '𒁃', header: { title: 'ageofabundance.site', subtitle: 'Utilities' } },
  'ageofabundance.tech':   { renderer: 'landing', icon: '𒁄', header: { title: 'ageofabundance.tech', subtitle: 'Developer Tools' } },
  'ageofabundance.net':    { renderer: 'landing', icon: '𒁅', header: { title: 'ageofabundance.net', subtitle: 'Social Networking' } },
  'ageofabundance.info':   { renderer: 'landing', icon: '𒁆', header: { title: 'ageofabundance.info', subtitle: 'Reference' } },
  'ageofabundance.agency': { renderer: 'landing', icon: '𒁇', header: { title: 'ageofabundance.agency', subtitle: 'Business' } },
  'ageofabundance.actor':  { renderer: 'landing', icon: '𒁈', header: { title: 'ageofabundance.actor', subtitle: 'Entertainment' } },
  'ageofabundance.xyz':    { renderer: 'landing', icon: '𒁉', header: { title: 'ageofabundance.xyz', subtitle: 'Lifestyle' } },

  // ── Personal ──────────────────────────────────────────
  'michaeldouglas.app':    { renderer: 'landing', icon: '𒌓', header: { title: 'michaeldouglas.app', subtitle: 'Productivity' } }
};

// ---------------------------------------------------------------------------
// Unique apps (exclude theageofabundance.* defensive mirrors)
// ---------------------------------------------------------------------------
export const UNIQUE_APPS = Object.entries(REGISTRY)
  .filter(([domain]) => !domain.startsWith('theageofabundance.'))
  .map(([domain, config]) => ({ domain, ...config }));

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
