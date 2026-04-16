'use client'

import { useMemo, useRef } from 'react'
import { Instance, Instances } from '@react-three/drei'
import { type Group, Vector3 } from 'three'
import type { GlobePoint, DebugSettings } from '../types'
import { latLonToVec3 } from '../math/lat-lon'
import { resolveColor } from '../category-colors'

type PreparedPoint = {
  pos: Vector3
  baseScale: number
  color: string
  lookAt: Vector3
}

type GlobePointsProps = {
  events: GlobePoint[]
  radius: number
  debug: Pick<
    DebugSettings,
    'pointBaseSize' | 'pointWeightScale' | 'pointColor' | 'showHalos' | 'haloColor' | 'haloOpacity'
  >
  /** When set, highlight this index with a larger scale + custom color. */
  focusedIndex?: number | null
  focusColor?: string
  focusScaleMultiplier?: number
  /** Per-category tint applied when no explicit color on event. Falls back to debug.pointColor. */
  useCategoryColors?: boolean
  onPointEnter?: (index: number, event: GlobePoint) => void
  onPointLeave?: (index: number, event: GlobePoint) => void
  onPointSelect?: (index: number, event: GlobePoint) => void
}

export function GlobePoints({
  events,
  radius,
  debug,
  focusedIndex = null,
  focusColor = '#ff3355',
  focusScaleMultiplier = 2.4,
  useCategoryColors = false,
  onPointEnter,
  onPointLeave,
  onPointSelect,
}: GlobePointsProps) {
  const coreGroupRef = useRef<Group>(null)
  const haloGroupRef = useRef<Group>(null)

  const points = useMemo<PreparedPoint[]>(() => {
    return events.map((e) => {
      const pos = latLonToVec3(e.lat, e.lon, radius)
      const baseScale = Math.min(
        0.5,
        debug.pointBaseSize + Math.log10(e.weight + 1) * debug.pointWeightScale,
      )
      const color = useCategoryColors ? resolveColor(e, debug.pointColor) : debug.pointColor
      const normal = pos.clone().normalize()
      const lookAt = pos.clone().add(normal)
      return { pos, baseScale, color, lookAt }
    })
  }, [
    events,
    radius,
    debug.pointBaseSize,
    debug.pointWeightScale,
    debug.pointColor,
    useCategoryColors,
  ])

  if (points.length === 0) return null

  const interactive = Boolean(onPointEnter || onPointLeave || onPointSelect)

  return (
    <group>
      <group ref={coreGroupRef}>
        <Instances limit={Math.max(points.length, 1)} range={points.length}>
          <sphereGeometry args={[1, 12, 12]} />
          <meshBasicMaterial toneMapped={false} />
          {points.map((p, i) => {
            const isFocused = focusedIndex === i
            const scale = isFocused ? p.baseScale * focusScaleMultiplier : p.baseScale
            const color = isFocused ? focusColor : p.color
            return (
              <Instance
                key={`c-${i}`}
                position={p.pos}
                scale={scale}
                color={color}
                {...(interactive
                  ? {
                      onPointerOver: (e: any) => {
                        e.stopPropagation()
                        onPointEnter?.(i, events[i])
                      },
                      onPointerOut: (e: any) => {
                        e.stopPropagation()
                        onPointLeave?.(i, events[i])
                      },
                      onClick: (e: any) => {
                        e.stopPropagation()
                        onPointSelect?.(i, events[i])
                      },
                    }
                  : {})}
              />
            )
          })}
        </Instances>
      </group>
      {debug.showHalos && (
        <group ref={haloGroupRef}>
          <Instances limit={Math.max(points.length, 1)} range={points.length}>
            <ringGeometry args={[1.6, 2.2, 24]} />
            <meshBasicMaterial
              color={debug.haloColor}
              toneMapped={false}
              transparent
              opacity={debug.haloOpacity}
              depthWrite={false}
            />
            {points.map((p, i) => (
              <Instance
                key={`h-${i}`}
                position={p.pos}
                scale={
                  focusedIndex === i ? p.baseScale * focusScaleMultiplier : p.baseScale
                }
                onUpdate={(self) => self.lookAt(p.lookAt)}
              />
            ))}
          </Instances>
        </group>
      )}
    </group>
  )
}
