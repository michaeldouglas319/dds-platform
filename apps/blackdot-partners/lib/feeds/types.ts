/**
 * Shared shape for every globe event, regardless of source.
 * Feeds normalize their source-specific data into this shape.
 * The scene reads `tag` to pick per-event color via CATEGORY_COLORS.
 */
export type GlobeEvent = {
  /** Stable unique id scoped to source (e.g. UCDP event id, USGS event code) */
  externalId: string;
  source: 'ucdp' | 'usgs' | 'reliefweb';
  lat: number;
  lon: number;
  /** Severity / magnitude / fatality count — whatever each feed considers weight */
  weight: number;
  name: string;
  url?: string;
  /** Category keyword — maps to CATEGORY_COLORS in PoimandresScene */
  tag: string;
  /** ISO 8601 date string */
  date?: string;
};
