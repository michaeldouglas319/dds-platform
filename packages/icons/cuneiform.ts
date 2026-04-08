/**
 * Cuneiform Icon Registry
 *
 * Each TLD/vertical maps to a Sumerian cuneiform logogram.
 * The glyph is a Unicode character from the Cuneiform block (U+12000–U+1254F).
 * Designed as monochrome masks — render with CSS `color` or `mask-image`.
 */

export interface CuneiformEntry {
  /** The Unicode cuneiform character */
  glyph: string;
  /** Unicode codepoint (e.g. U+1202D) */
  codepoint: string;
  /** Sumerian transliteration */
  name: string;
  /** English meaning — shown in tooltip */
  meaning: string;
  /** The TLD or brand this maps to */
  vertical: string;
  /** Category for grouping */
  category: 'brand' | 'commerce' | 'creative' | 'knowledge' | 'infrastructure' | 'technology' | 'community' | 'regional' | 'experimental';
}

/**
 * Master cuneiform registry — one symbol per vertical concept.
 * Keyed by TLD extension or brand name.
 */
export const CUNEIFORM: Record<string, CuneiformEntry> = {
  // ── Brands ─────────────────────────────────────────────
  abundance: {
    glyph: '𒄑',
    codepoint: 'U+12111',
    name: 'GIŠ',
    meaning: 'Tree of life · Abundance',
    vertical: 'abundance',
    category: 'brand',
  },
  blackdot: {
    glyph: '𒀀',
    codepoint: 'U+12000',
    name: 'A',
    meaning: 'Origin · Water · Seed',
    vertical: 'blackdot',
    category: 'brand',
  },
  michaeldouglas: {
    glyph: '𒈠',
    codepoint: 'U+12220',
    name: 'MA',
    meaning: 'Personal seal · Mark',
    vertical: 'michaeldouglas',
    category: 'brand',
  },

  // ── Commerce ───────────────────────────────────────────
  shop: {
    glyph: '𒃵',
    codepoint: 'U+120F5',
    name: 'GAR',
    meaning: 'Marketplace · To set in place',
    vertical: 'shop',
    category: 'commerce',
  },
  store: {
    glyph: '𒃻',
    codepoint: 'U+120FB',
    name: 'GÁ',
    meaning: 'Storehouse · Granary',
    vertical: 'store',
    category: 'commerce',
  },

  // ── Creative ───────────────────────────────────────────
  actor: {
    glyph: '𒇽',
    codepoint: 'U+121FD',
    name: 'LÚ',
    meaning: 'Person · Performer',
    vertical: 'actor',
    category: 'creative',
  },
  art: {
    glyph: '𒌓',
    codepoint: 'U+12313',
    name: 'UD',
    meaning: 'Light · Radiance · Beauty',
    vertical: 'art',
    category: 'creative',
  },
  studio: {
    glyph: '𒈾',
    codepoint: 'U+1223E',
    name: 'NA',
    meaning: 'Stone · Craft · Monument',
    vertical: 'studio',
    category: 'creative',
  },

  // ── Knowledge ──────────────────────────────────────────
  wiki: {
    glyph: '𒉈',
    codepoint: 'U+12248',
    name: 'NÍG',
    meaning: 'Archive · Thing of record',
    vertical: 'wiki',
    category: 'knowledge',
  },
  info: {
    glyph: '𒁾',
    codepoint: 'U+1207E',
    name: 'DUB',
    meaning: 'Tablet · Written record',
    vertical: 'info',
    category: 'knowledge',
  },

  // ── Infrastructure ─────────────────────────────────────
  net: {
    glyph: '𒊓',
    codepoint: 'U+12293',
    name: 'SA',
    meaning: 'Net · Sinew · Connection',
    vertical: 'net',
    category: 'infrastructure',
  },
  org: {
    glyph: '𒌷',
    codepoint: 'U+12337',
    name: 'URU',
    meaning: 'City · Community · Gathering',
    vertical: 'org',
    category: 'infrastructure',
  },
  site: {
    glyph: '𒆍',
    codepoint: 'U+1218D',
    name: 'KÁ',
    meaning: 'Gate · Portal · Entrance',
    vertical: 'site',
    category: 'infrastructure',
  },
  online: {
    glyph: '𒀯',
    codepoint: 'U+1202F',
    name: 'MUL',
    meaning: 'Star · Beacon · Radiance',
    vertical: 'online',
    category: 'infrastructure',
  },
  cloud: {
    glyph: '𒅎',
    codepoint: 'U+1214E',
    name: 'IM',
    meaning: 'Wind · Storm · Sky',
    vertical: 'cloud',
    category: 'infrastructure',
  },

  // ── Technology ─────────────────────────────────────────
  dev: {
    glyph: '𒁲',
    codepoint: 'U+12072',
    name: 'DIM',
    meaning: 'To craft · To build',
    vertical: 'dev',
    category: 'technology',
  },
  tech: {
    glyph: '𒌝',
    codepoint: 'U+1231D',
    name: 'UM',
    meaning: 'Tool · Craft · Mechanism',
    vertical: 'tech',
    category: 'technology',
  },
  ai: {
    glyph: '𒊮',
    codepoint: 'U+122AE',
    name: 'ŠÀ',
    meaning: 'Heart · Mind · Intelligence',
    vertical: 'ai',
    category: 'technology',
  },
  app: {
    glyph: '𒀸',
    codepoint: 'U+12038',
    name: 'AŠ',
    meaning: 'Unity · The one',
    vertical: 'app',
    category: 'technology',
  },

  // ── Community & Regional ───────────────────────────────
  space: {
    glyph: '𒀭',
    codepoint: 'U+1202D',
    name: 'AN',
    meaning: 'Heaven · Sky · Cosmos',
    vertical: 'space',
    category: 'community',
  },
  agency: {
    glyph: '𒂍',
    codepoint: 'U+1208D',
    name: 'É',
    meaning: 'House · Estate · Organization',
    vertical: 'agency',
    category: 'community',
  },
  partners: {
    glyph: '𒁀',
    codepoint: 'U+12040',
    name: 'BA',
    meaning: 'To give · To share',
    vertical: 'partners',
    category: 'community',
  },
  asia: {
    glyph: '𒆠',
    codepoint: 'U+121A0',
    name: 'KI',
    meaning: 'Earth · Land · Place',
    vertical: 'asia',
    category: 'regional',
  },
  capital: {
    glyph: '𒆬',
    codepoint: 'U+121AC',
    name: 'KÙ',
    meaning: 'Silver · Precious · Sacred',
    vertical: 'capital',
    category: 'commerce',
  },

  // ── Experimental ───────────────────────────────────────
  xyz: {
    glyph: '𒌋',
    codepoint: 'U+1230B',
    name: 'U',
    meaning: 'Totality · The whole',
    vertical: 'xyz',
    category: 'experimental',
  },
};

/** Get cuneiform entry by TLD extension (e.g. "shop", "dev", "ai") */
export function getCuneiformByTLD(tld: string): CuneiformEntry | undefined {
  return CUNEIFORM[tld.toLowerCase().replace(/^\./, '')];
}

/** Extract TLD from a domain string (e.g. "blackdot.partners" → "partners") */
export function extractTLD(domain: string): string {
  const parts = domain.split('.');
  return parts[parts.length - 1];
}

/** Get cuneiform entry for a full domain */
export function getCuneiformForDomain(domain: string): CuneiformEntry | undefined {
  const tld = extractTLD(domain);
  return getCuneiformByTLD(tld);
}

/** Get all entries for a category */
export function getCuneiformByCategory(category: CuneiformEntry['category']): CuneiformEntry[] {
  return Object.values(CUNEIFORM).filter(e => e.category === category);
}

/** All verticals as an ordered array */
export const CUNEIFORM_LIST: CuneiformEntry[] = Object.values(CUNEIFORM);

/** Just the glyphs, for quick iteration */
export const GLYPHS: Record<string, string> = Object.fromEntries(
  Object.entries(CUNEIFORM).map(([k, v]) => [k, v.glyph])
);
