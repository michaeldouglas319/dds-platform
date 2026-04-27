/**
 * Icon System Mappings
 *
 * Comprehensive mappings for the DDS icon system:
 * - Cuneiform glyphs (Unicode U+12000–U+12FFF, Sumerian)
 * - SVG icon suggestions from Lucide (battle-tested open-source library)
 * - HTML entity fallbacks (→ ✓ — etc.)
 *
 * **Usage Patterns:**
 * - AppChip component renders cuneiform glyphs with auto-flip to badge icons
 * - Lucide suggestions are integrated via icon package or custom SVG paths
 * - Fallbacks ensure graceful degradation across browsers
 *
 * **Rendering Notes:**
 * - Cuneiform requires: font-size 32px+, antialiasing, and proper line-height
 * - Theme colors via CSS custom properties: --color-brand-primary, --color-brand-accent
 * - Size scaling: 16px (text label) to 128px (display feature)
 * - All glyphs tested in Firefox, Chrome, Safari (Unicode block U+12000 support)
 */

import type { CuneiformEntry } from './cuneiform';

/**
 * Icon suggestion entry pairing cuneiform with recommended Lucide icon
 * for fallback or alternative rendering contexts.
 */
export interface IconMapping {
  /** Cuneiform glyph (U+12000–U+12FFF) */
  glyph: string;
  /** Sumerian name/transliteration */
  name: string;
  /** English meaning */
  meaning: string;
  /** Recommended Lucide icon name (kebab-case) */
  lucideIcon: string;
  /** HTML entity fallback (e.g., '→', '✓', '∞') */
  entityFallback?: string;
  /** ASCII text fallback for minimal environments */
  asciFallback?: string;
  /** Brief description for tooltips */
  description: string;
}

/**
 * Master icon mapping registry.
 * Maps each vertical to its cuneiform representation with cascading fallbacks.
 */
export const ICON_MAPPINGS: Record<string, IconMapping> = {
  // ── Brands ─────────────────────────────────────────────
  abundance: {
    glyph: '𒄑',
    name: 'GIŠ',
    meaning: 'Tree of life · Abundance',
    lucideIcon: 'leaf',
    entityFallback: '🌱',
    asciFallback: '[*]',
    description: 'Post-scarcity civilization and shared flourishing',
  },
  blackdot: {
    glyph: '𒀀',
    name: 'A',
    meaning: 'Origin · Water · Seed',
    lucideIcon: 'droplet',
    entityFallback: '●',
    asciFallback: '[.]',
    description: 'Capital and investment network',
  },
  michaeldouglas: {
    glyph: '𒈠',
    name: 'MA',
    meaning: 'Personal seal · Mark',
    lucideIcon: 'user-circle',
    entityFallback: '◆',
    asciFallback: '[M]',
    description: 'Personal portfolio and identity',
  },

  // ── Commerce ───────────────────────────────────────────
  shop: {
    glyph: '𒃵',
    name: 'GAR',
    meaning: 'Marketplace · To set in place',
    lucideIcon: 'store',
    entityFallback: '🛍️',
    asciFallback: '[S]',
    description: 'Retail marketplace and commerce',
  },
  store: {
    glyph: '𒃻',
    name: 'GÁ',
    meaning: 'Storehouse · Granary',
    lucideIcon: 'warehouse',
    entityFallback: '📦',
    asciFallback: '[W]',
    description: 'Product repository and inventory',
  },
  capital: {
    glyph: '𒆬',
    name: 'KÙ',
    meaning: 'Silver · Precious · Sacred',
    lucideIcon: 'landmark',
    entityFallback: '💎',
    asciFallback: '[C]',
    description: 'Financial institutions and capital',
  },

  // ── Creative ───────────────────────────────────────────
  actor: {
    glyph: '𒇽',
    name: 'LÚ',
    meaning: 'Person · Performer',
    lucideIcon: 'user',
    entityFallback: '👤',
    asciFallback: '[A]',
    description: 'Talent, performance, and creators',
  },
  art: {
    glyph: '𒌓',
    name: 'UD',
    meaning: 'Light · Radiance · Beauty',
    lucideIcon: 'palette',
    entityFallback: '🎨',
    asciFallback: '[A]',
    description: 'Visual art, design, and aesthetics',
  },
  studio: {
    glyph: '𒈾',
    name: 'NA',
    meaning: 'Stone · Craft · Monument',
    lucideIcon: 'box',
    entityFallback: '🎬',
    asciFallback: '[S]',
    description: 'Production studio and creative workspace',
  },

  // ── Knowledge ──────────────────────────────────────────
  wiki: {
    glyph: '𒉈',
    name: 'NÍG',
    meaning: 'Archive · Thing of record',
    lucideIcon: 'book-open',
    entityFallback: '📚',
    asciFallback: '[W]',
    description: 'Knowledge base and collaborative encyclopedia',
  },
  info: {
    glyph: '𒁾',
    name: 'DUB',
    meaning: 'Tablet · Written record',
    lucideIcon: 'file-text',
    entityFallback: 'ℹ️',
    asciFallback: '[i]',
    description: 'Documentation, information, and resources',
  },

  // ── Infrastructure ─────────────────────────────────────
  net: {
    glyph: '𒊓',
    name: 'SA',
    meaning: 'Net · Sinew · Connection',
    lucideIcon: 'network',
    entityFallback: '🕸️',
    asciFallback: '[N]',
    description: 'Network protocols and connectivity',
  },
  org: {
    glyph: '𒌷',
    name: 'URU',
    meaning: 'City · Community · Gathering',
    lucideIcon: 'users',
    entityFallback: '👥',
    asciFallback: '[O]',
    description: 'Organizations, communities, and collectives',
  },
  site: {
    glyph: '𒆍',
    name: 'KÁ',
    meaning: 'Gate · Portal · Entrance',
    lucideIcon: 'door-open',
    entityFallback: '🚪',
    asciFallback: '[S]',
    description: 'Websites and web properties',
  },
  online: {
    glyph: '𒀯',
    name: 'MUL',
    meaning: 'Star · Beacon · Radiance',
    lucideIcon: 'radio-tower',
    entityFallback: '⭐',
    asciFallback: '[O]',
    description: 'Online presence and digital beacon',
  },
  cloud: {
    glyph: '𒅎',
    name: 'IM',
    meaning: 'Wind · Storm · Sky',
    lucideIcon: 'cloud',
    entityFallback: '☁️',
    asciFallback: '[C]',
    description: 'Cloud computing and infrastructure',
  },

  // ── Technology ─────────────────────────────────────────
  dev: {
    glyph: '𒁲',
    name: 'DIM',
    meaning: 'To craft · To build',
    lucideIcon: 'hammer',
    entityFallback: '🔨',
    asciFallback: '[D]',
    description: 'Software development and engineering',
  },
  tech: {
    glyph: '𒌝',
    name: 'UM',
    meaning: 'Tool · Craft · Mechanism',
    lucideIcon: 'wrench',
    entityFallback: '⚙️',
    asciFallback: '[T]',
    description: 'Technology, tools, and technical systems',
  },
  ai: {
    glyph: '𒊮',
    name: 'ŠÀ',
    meaning: 'Heart · Mind · Intelligence',
    lucideIcon: 'brain',
    entityFallback: '🧠',
    asciFallback: '[A]',
    description: 'Artificial intelligence and machine learning',
  },
  app: {
    glyph: '𒀸',
    name: 'AŠ',
    meaning: 'Unity · The one',
    lucideIcon: 'square',
    entityFallback: '▢',
    asciFallback: '[+]',
    description: 'Application platforms and software',
  },

  // ── Community & Regional ───────────────────────────────
  space: {
    glyph: '𒀭',
    name: 'AN',
    meaning: 'Heaven · Sky · Cosmos',
    lucideIcon: 'rocket',
    entityFallback: '🚀',
    asciFallback: '[S]',
    description: 'Space, exploration, and cosmic vision',
  },
  agency: {
    glyph: '𒂍',
    name: 'É',
    meaning: 'House · Estate · Organization',
    lucideIcon: 'briefcase',
    entityFallback: '🏢',
    asciFallback: '[A]',
    description: 'Agencies, consultancies, and service providers',
  },
  partners: {
    glyph: '𒁀',
    name: 'BA',
    meaning: 'To give · To share',
    lucideIcon: 'handshake',
    entityFallback: '🤝',
    asciFallback: '[P]',
    description: 'Partnerships and collaborative networks',
  },
  asia: {
    glyph: '𒆠',
    name: 'KI',
    meaning: 'Earth · Land · Place',
    lucideIcon: 'globe',
    entityFallback: '🌏',
    asciFallback: '[A]',
    description: 'Asia and regional geography',
  },
  xyz: {
    glyph: '𒌋',
    name: 'U',
    meaning: 'Totality · The whole',
    lucideIcon: 'infinity',
    entityFallback: '∞',
    asciFallback: '[X]',
    description: 'Experimental domains and speculative projects',
  },
};

/**
 * Lucide icon name suggestions grouped by function.
 * Use these for fallback or complementary rendering.
 *
 * **Patterns:**
 * - Commerce: store, shopping-cart, package, box, warehouse, gift
 * - Creative: palette, paintbrush, camera, film, music, feather
 * - Knowledge: book-open, book, file-text, database, layers, map
 * - Infrastructure: globe, network, server, cpu, hard-drive
 * - Technology: hammer, wrench, gear, cog, zap, circuit-board
 * - Community: users, user-plus, user-check, heart, share, link
 * - Regional: globe, map, compass, world, flag, landmark
 */
export const LUCIDE_ICON_SUGGESTIONS: Record<string, string[]> = {
  commerce: ['store', 'shopping-cart', 'package', 'box', 'warehouse', 'gift', 'truck'],
  creative: ['palette', 'paintbrush', 'camera', 'film', 'music', 'feather', 'sparkles'],
  knowledge: ['book-open', 'book', 'file-text', 'database', 'layers', 'map', 'search'],
  infrastructure: ['globe', 'network', 'server', 'cpu', 'hard-drive', 'radio-tower', 'wifi'],
  technology: ['hammer', 'wrench', 'gear', 'cog', 'zap', 'circuit-board', 'cpu'],
  community: ['users', 'user-plus', 'user-check', 'heart', 'share', 'link', 'share-2'],
  regional: ['globe', 'map', 'compass', 'world', 'flag', 'landmark', 'map-pin'],
  other: ['star', 'lightbulb', 'target', 'rocket', 'shield', 'unlock', 'eye'],
};

/**
 * HTML entity fallbacks for environments that don't support:
 * - Unicode cuneiform (U+12000–U+12FFF)
 * - Emoji rendering
 * - Custom fonts
 *
 * **Rendering:**
 * Use in `fallback` attribute on icon containers:
 * ```tsx
 * <span role="img" aria-label="Shop">
 *   𒃵 (attempts cuneiform)
 *   <span title="fallback">🛍️</span>
 * </span>
 * ```
 *
 * **Legacy Support (pre-2020 browsers):**
 * Use ASCII fallbacks for terminal-like or minimal environments:
 * ```tsx
 * const iconDisplay = isCuneiformSupported() ? glyph : asciFallback;
 * ```
 */
export const ENTITY_FALLBACKS: Record<string, string> = {
  arrow: '→',
  checkmark: '✓',
  cross: '✕',
  bullet: '•',
  asterisk: '∗',
  infinity: '∞',
  division: '÷',
  multiply: '×',
  plus: '+',
  minus: '−',
  equals: '=',
  notequals: '≠',
  lessthan: '<',
  greaterthan: '>',
  lte: '≤',
  gte: '≥',
  copyright: '©',
  registered: '®',
  trademark: '™',
  paragraph: '¶',
  section: '§',
  dagger: '†',
  doubleDagger: '‡',
  ellipsis: '…',
  degree: '°',
  prime: '′',
  doublePrime: '″',
  pilcrow: '¶',
  questionmark: '?',
  exclamation: '!',
};

/**
 * **Theme Color Integration**
 *
 * AppChip and icon components use CSS custom properties for theming:
 *
 * ```css
 * :root {
 *   --color-brand-primary: hsl(0, 100%, 50%);
 *   --color-brand-accent: hsl(0, 100%, 60%);
 *   --color-bg-primary: hsl(0, 0%, 100%);
 *   --color-text-primary: hsl(0, 0%, 0%);
 * }
 *
 * [data-theme="dark"] {
 *   --color-brand-primary: hsl(0, 100%, 60%);
 *   --color-brand-accent: hsl(0, 100%, 40%);
 *   --color-bg-primary: hsl(0, 0%, 10%);
 *   --color-text-primary: hsl(0, 0%, 90%);
 * }
 * ```
 *
 * **9 Theme Colors (from DDS):**
 * - `--theme-red` / `--color-red-500`
 * - `--theme-orange` / `--color-orange-500`
 * - `--theme-yellow` / `--color-yellow-500`
 * - `--theme-green` / `--color-green-500`
 * - `--theme-blue` / `--color-blue-500`
 * - `--theme-purple` / `--color-purple-500`
 * - `--theme-pink` / `--color-pink-500`
 * - `--theme-gray` / `--color-gray-500`
 * - `--theme-slate` / `--color-slate-500`
 *
 * **AppChip Badge Background:**
 * ```tsx
 * const badgeBg = 'color-mix(in srgb, var(--color-brand-primary) 12%, transparent)';
 * const badgeBorder = 'color-mix(in srgb, var(--color-brand-primary) 25%, transparent)';
 * ```
 */
export const THEME_COLORS = [
  'red',
  'orange',
  'yellow',
  'green',
  'blue',
  'purple',
  'pink',
  'gray',
  'slate',
] as const;

export type ThemeColor = (typeof THEME_COLORS)[number];

/**
 * Helper function to get icon mapping for a vertical
 */
export function getIconMapping(vertical: string): IconMapping | undefined {
  return ICON_MAPPINGS[vertical.toLowerCase()];
}

/**
 * Helper function to get a Lucide icon suggestion for a category
 */
export function getLucideSuggestion(category: keyof typeof LUCIDE_ICON_SUGGESTIONS, index = 0): string {
  const suggestions = LUCIDE_ICON_SUGGESTIONS[category];
  return suggestions?.[index % suggestions.length] ?? 'circle';
}

/**
 * Helper to check if cuneiform glyphs are likely to render
 * (simple heuristic: browser supports Unicode range U+12000–U+12FFF)
 */
export function isCuneiformSupported(): boolean {
  // Test by checking if a cuneiform glyph renders with non-zero width
  if (typeof document === 'undefined') return true; // SSR — assume supported
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return false;

  ctx.font = '32px "Segoe UI Symbol", Arial Unicode MS, sans-serif';
  const w1 = ctx.measureText('𒀀').width; // U+12000 (A)
  const w2 = ctx.measureText('?').width; // Fallback

  // If glyph renders the same as fallback, cuneiform is likely not supported
  return w1 > w2;
}

/**
 * Helper to render glyph with fallback chain
 */
export function renderIconWithFallback(
  mapping: IconMapping,
  options: {
    preferEmoji?: boolean;
    preferAscii?: boolean;
    preferLucide?: boolean;
  } = {}
): string {
  if (options.preferAscii && mapping.asciFallback) return mapping.asciFallback;
  if (options.preferEmoji && mapping.entityFallback) return mapping.entityFallback;
  if (options.preferLucide) return mapping.lucideIcon;

  // Default: cuneiform → emoji → ASCII
  if (isCuneiformSupported()) return mapping.glyph;
  if (mapping.entityFallback) return mapping.entityFallback;
  return mapping.asciFallback ?? '[?]';
}
