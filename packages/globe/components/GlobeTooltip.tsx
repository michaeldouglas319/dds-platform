'use client'

import type { ReactNode } from 'react'
import { Html } from '@react-three/drei'
import { Vector3 } from 'three'
import type { GlobePoint } from '../types'
import { latLonToVec3 } from '../math/lat-lon'

type GlobeTooltipProps = {
  point: GlobePoint | null
  radius: number
  /** Extra radial offset so the tooltip sits above the point. */
  lift?: number
  /** Custom renderer. Falls back to a built-in glass card. */
  render?: (point: GlobePoint) => ReactNode
  distanceFactor?: number
}

const DEFAULT_LIFT = 0.6

export function GlobeTooltip({
  point,
  radius,
  lift = DEFAULT_LIFT,
  render,
  distanceFactor = 8,
}: GlobeTooltipProps) {
  if (!point) return null
  const pos = latLonToVec3(point.lat, point.lon, radius + lift)
  return (
    <Html
      position={[pos.x, pos.y, pos.z]}
      center
      distanceFactor={distanceFactor}
      zIndexRange={[5, 0]}
      style={{ pointerEvents: 'none' }}
    >
      {render ? render(point) : <DefaultCard point={point} />}
    </Html>
  )
}

function DefaultCard({ point }: { point: GlobePoint }) {
  return (
    <div
      style={{
        pointerEvents: 'auto',
        minWidth: 220,
        maxWidth: 320,
        padding: '0.75rem 0.95rem',
        borderRadius: 12,
        background: 'rgba(255, 255, 255, 0.82)',
        backdropFilter: 'blur(14px) saturate(160%)',
        WebkitBackdropFilter: 'blur(14px) saturate(160%)',
        border: '1px solid rgba(0, 0, 0, 0.08)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
        fontFamily: 'system-ui, sans-serif',
        color: '#111',
        fontSize: 12,
        lineHeight: 1.45,
        transform: 'translateY(-80px)',
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 4 }}>{point.name ?? 'Event'}</div>
      <div style={{ display: 'flex', gap: 10, opacity: 0.7, fontSize: 11 }}>
        <span>weight {point.weight.toLocaleString()}</span>
        {point.date && <span>{point.date}</span>}
      </div>
      {point.url && (
        <a
          href={point.url}
          target="_blank"
          rel="noreferrer"
          style={{
            display: 'inline-block',
            marginTop: 8,
            fontSize: 11,
            color: '#0a66ff',
            textDecoration: 'none',
            fontWeight: 500,
          }}
        >
          source ↗
        </a>
      )}
    </div>
  )
}
