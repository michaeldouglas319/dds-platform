/**
 * Shared event shape for the globe. Matches the blackdot-partners
 * `ConflictEvent` so existing data flows through unmodified.
 */
export type GlobePoint = {
  /** Optional stable id — required when using the interactive carousel. */
  id?: string
  lat: number
  lon: number
  weight: number
  name?: string
  url?: string
  /** Direct hex override; wins over tag lookup. */
  color?: string
  /** Free-form keyword tag; matched against CATEGORY_COLORS. */
  tag?: string
  /** Optional ISO date — shown by default tooltip. */
  date?: string
}

export type ArcStyle = 'solid' | 'gradient' | 'pulse' | 'noise'

export type DebugSettings = {
  pointBaseSize: number
  pointWeightScale: number
  pointColor: string
  showHalos: boolean
  haloColor: string
  haloOpacity: number
  showArcs: boolean
  arcK: number
  arcLift: number
  arcColor: string
  arcOpacity: number
  arcStyle: ArcStyle
  globeRotationSpeed: number
}

export const defaultDebugSettings: DebugSettings = {
  pointBaseSize: 0.05,
  pointWeightScale: 0,
  pointColor: '#000000',
  showHalos: true,
  haloColor: '#ffffff',
  haloOpacity: 0.75,
  showArcs: true,
  arcK: 8,
  arcLift: 0.22,
  arcColor: '#000000',
  arcOpacity: 0.1,
  arcStyle: 'gradient',
  globeRotationSpeed: 0.69,
}
