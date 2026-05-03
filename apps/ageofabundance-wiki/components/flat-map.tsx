'use client'

import { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import { MapboxOverlay } from '@deck.gl/mapbox'
import { ScatterplotLayer } from '@deck.gl/layers'
import 'maplibre-gl/dist/maplibre-gl.css'
import './flat-map.css'

type GlobeEventRow = {
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

export interface FlatMapProps {
  events: GlobeEventRow[]
  selectedEventId?: string | null
  onEventSelect?: (event: GlobeEventRow) => void
  basemap?: 'satellite' | 'positron' | 'dark'
  onBasemapChange?: (basemap: 'satellite' | 'positron' | 'dark') => void
}

const BASEMAP_STYLES = {
  positron: 'https://tiles.openfreemap.org/styles/positron',
  dark: 'https://tiles.openfreemap.org/styles/dark',
  satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
}

/**
 * FlatMap - High-performance 2D map with deck.gl and basemap toggle
 * Renders globe events as geospatial points with multiple basemap styles
 */
export function FlatMap({
  events,
  selectedEventId,
  onEventSelect,
  basemap = 'positron',
  onBasemapChange,
}: FlatMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<maplibregl.Map | null>(null)
  const overlay = useRef<MapboxOverlay | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!mapContainer.current) return

    try {
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: BASEMAP_STYLES[basemap],
        center: [0, 20],
        zoom: 2,
        pitch: 0,
        bearing: 0,
      })

      map.current.on('load', () => {
        setLoading(false)
        overlay.current = new MapboxOverlay({ layers: [] })
        map.current?.addControl(overlay.current)
      })

      return () => {
        if (map.current) map.current.remove()
      }
    } catch (err) {
      console.error('[flat-map]', err)
      setLoading(false)
    }
  }, [basemap])

  // Update layers when events change
  useEffect(() => {
    if (!overlay.current || !events.length) return

    const validEvents = events.filter((e) => e.lat !== 0 || e.lon !== 0)
    if (!validEvents.length) {
      overlay.current.setProps({ layers: [] })
      return
    }

    const features = validEvents.map((event) => ({
      position: [event.lon, event.lat] as [number, number],
      size: Math.max(event.weight * 0.5, 8),
      color: getEventColor(event.tag),
      properties: event,
    }))

    const layer = new ScatterplotLayer({
      id: 'events-scatter',
      data: features,
      pickable: true,
      radiusScale: 6,
      radiusMinPixels: 4,
      radiusMaxPixels: 100,
      getPosition: (d: any) => d.position as [number, number],
      getRadius: (d: any) => d.size as number,
      getFillColor: (d: any) =>
        [...(d.color as [number, number, number]), 200] as [number, number, number, number],
      getLineColor: (d: any) => [255, 255, 255] as [number, number, number],
      getLineWidth: (d: any) => (d.properties.id === selectedEventId ? 3 : 1) as number,
      onHover: (info: any) => {
        if (mapContainer.current) {
          mapContainer.current.style.cursor = info.object ? 'pointer' : 'grab'
        }
      },
      onClick: (info: any) => {
        if (info.object?.properties && onEventSelect) {
          onEventSelect(info.object.properties)
        }
      },
    })

    overlay.current.setProps({ layers: [layer] })
  }, [events, selectedEventId, onEventSelect])

  return (
    <div className="flat-map">
      <div className="flat-map__container" ref={mapContainer} />

      {loading && (
        <div className="flat-map__loading">
          <div className="flat-map__spinner" />
          <p>Loading map...</p>
        </div>
      )}

      <div className="flat-map__controls">
        <div className="flat-map__basemap-toggle">
          {(['positron', 'dark', 'satellite'] as const).map((style) => (
            <button
              key={style}
              className={`flat-map__basemap-btn ${basemap === style ? 'active' : ''}`}
              onClick={() => onBasemapChange?.(style)}
              title={`Switch to ${style}`}
            >
              {style === 'positron' && '🗺️'}
              {style === 'dark' && '🌙'}
              {style === 'satellite' && '🛰️'}
            </button>
          ))}
        </div>
      </div>

      <div className="flat-map__info">
        <p>{events.length} events</p>
      </div>
    </div>
  )
}

function getEventColor(tag: string | null): [number, number, number] {
  const colors: Record<string, [number, number, number]> = {
    geopolitical: [255, 100, 100],
    military: [255, 80, 80],
    disaster: [255, 150, 0],
    news: [100, 150, 255],
    social: [100, 255, 100],
    'tech-news': [255, 200, 100],
  }
  return colors[tag || ''] || [150, 150, 150]
}
