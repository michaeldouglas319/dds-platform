/**
 * Globe Event types — shared across all visualization and data layers
 * Single source of truth for conflict event data structures
 */

export interface GlobeEventRow {
  id?: string
  source: string
  external_id: string
  lat: number
  lon: number
  weight: number
  name: string
  url: string | null
  tag: string | null
  date: string | null
}

export interface SourceResult {
  name: string
  count: number
  success: boolean
  duration: number
}

export interface AggregationResponse {
  aggregated: number
  updated: number
  sources: SourceResult[]
}

export interface ArmsEventsResponse {
  events: GlobeEventRow[]
  count?: number
  error?: string
}
