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
  /** Arbitrary renderer-specific config */
  options?: Record<string, unknown>
}

// ---------------------------------------------------------------------------
// Registry — domain → config
// Add entries as each domain gets built out.
// ---------------------------------------------------------------------------
const REGISTRY: Record<string, DomainConfig> = {
  // --- .site → Puck visual builder ---
  'ageofabundance.site': { renderer: 'puck' },

  // --- .online → Puck visual builder ---
  'ageofabundance.online': { renderer: 'puck' },

  // --- .wiki → Fumadocs (scaffold when ready) ---
  // 'ageofabundance.wiki':    { renderer: 'wiki' },
  // 'theageofabundance.wiki': { renderer: 'wiki' },

  // --- .shop → Medusa.js (scaffold when ready) ---
  // 'ageofabundance.shop':      { renderer: 'shop' },
  // 'theageofabundance.shop':   { renderer: 'shop' },
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
