'use client'

import { useMemo, useState } from 'react'
import Map, { Marker, Popup } from 'react-map-gl'
import Supercluster from 'supercluster'
import type { GlobePoint } from '@dds/globe'
import 'mapbox-gl/dist/mapbox-gl.css'

type GlobeEventRow = GlobePoint & {
  source: string
  external_id: string
}

type ArmsMapSceneProps = {
  filteredEvents: GlobeEventRow[]
  selectedIndex: number | null
  onPointSelect?: (event: GlobeEventRow, index: number) => void
}

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''

export function ArmsMapScene({
  filteredEvents,
  selectedIndex,
  onPointSelect,
}: ArmsMapSceneProps) {
  const [zoom, setZoom] = useState(1.5)
  const [lat, setLat] = useState(20)
  const [lon, setLon] = useState(0)

  const { clusters, supercluster } = useMemo(() => {
    const sc = new Supercluster({
      radius: 80,
      maxZoom: 16,
      minZoom: 0,
    })

    const features = filteredEvents.map((event, idx) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [event.lon, event.lat] },
      properties: {
        index: idx,
        name: event.name,
        tag: event.tag,
        weight: event.weight,
        ...event,
      },
    }))

    sc.load(features)
    const clustersData = sc.getClusters([lon - 180, lat - 85, lon + 180, lat + 85], Math.floor(zoom))

    return { clusters: clustersData, supercluster: sc }
  }, [filteredEvents, zoom, lat, lon])

  return (
    <Map
      initialViewState={{ latitude: lat, longitude: lon, zoom: zoom }}
      style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}
      mapStyle="mapbox://styles/mapbox/dark-v11"
      mapboxAccessToken={MAPBOX_TOKEN}
      onMove={(evt) => {
        setLat(evt.viewState.latitude)
        setLon(evt.viewState.longitude)
        setZoom(evt.viewState.zoom)
      }}
    >
      {clusters.map((cluster) => {
        const [lng, lat] = cluster.geometry.coordinates as [number, number]
        const { cluster: isCluster, point_count: count } = cluster.properties as any

        if (isCluster) {
          const clusterRadius = 30 + (count / filteredEvents.length) * 20
          return (
            <Marker
              key={`cluster-${cluster.id}`}
              latitude={lat}
              longitude={lng}
              onClick={(e) => {
                e.originalEvent.stopPropagation()
                const expansionZoom = supercluster.getClusterExpansionZoom(cluster.id as number)
                setZoom(expansionZoom)
                setLat(lat)
                setLon(lng)
              }}
            >
              <div
                style={{
                  width: clusterRadius * 2,
                  height: clusterRadius * 2,
                  borderRadius: '50%',
                  background: 'rgba(255, 87, 34, 0.8)',
                  border: '2px solid #ff3355',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                }}
              >
                {count}
              </div>
            </Marker>
          )
        }

        const event = cluster.properties as GlobeEventRow & { index: number }
        const color = event.tag === 'lethal' ? '#ff3355' : '#ff9933'

        return (
          <Marker
            key={`point-${event.index}`}
            latitude={lat}
            longitude={lng}
            onClick={() => onPointSelect?.(event, event.index)}
          >
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                background: color,
                border: selectedIndex === event.index ? '3px solid #fff' : '2px solid rgba(255,255,255,0.6)',
                cursor: 'pointer',
                boxShadow: `0 0 8px ${color}`,
              }}
            />
          </Marker>
        )
      })}
    </Map>
  )
}
