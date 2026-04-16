'use client'

import { Suspense, useMemo, type ReactNode } from 'react'
import { Canvas } from '@react-three/fiber'
import { Vector3 } from 'three'
import type { GlobePoint, DebugSettings } from '../types'
import { defaultDebugSettings } from '../types'
import { latLonToVec3 } from '../math/lat-lon'
import { Globe } from './Globe'
import { GlobePoints } from './GlobePoints'
import { GlobeArcs } from './GlobeArcs'
import { GlobeTooltip } from './GlobeTooltip'

export type InteractiveGlobeSceneProps = {
  events: GlobePoint[]
  focusedIndex: number | null
  onPointSelect?: (index: number, event: GlobePoint) => void
  onPointEnter?: (index: number, event: GlobePoint) => void
  onPointLeave?: (index: number, event: GlobePoint) => void
  /** Override any debug knob (e.g. arcStyle, haloColor, pointColor). */
  debug?: Partial<DebugSettings>
  /** Tooltip content renderer — receives the focused event. */
  renderTooltip?: (point: GlobePoint) => ReactNode
  /** Show arcs (default true). */
  showArcs?: boolean
  /** Show halos (default true). */
  showHalos?: boolean
  /** Use category colors for points (default true in interactive view). */
  useCategoryColors?: boolean
  /** Override canvas background. Pass null for transparent. */
  background?: string | null
  /** Radius of the globe. Default 3. */
  radius?: number
  /** Camera position. Default sized for a contained widget. */
  cameraPosition?: [number, number, number]
  /** Camera FOV. Default 32. */
  cameraFov?: number
  /** Globe position offset. Default [0, 0, 0] (centered in widget). */
  globePosition?: [number, number, number]
  className?: string
  style?: React.CSSProperties
}

/**
 * Opinionated Canvas composition for the signed-in interactive view.
 * Contains its own lights; does NOT include floor/ceiling/fog.
 */
export function InteractiveGlobeScene({
  events,
  focusedIndex,
  onPointSelect,
  onPointEnter,
  onPointLeave,
  debug,
  renderTooltip,
  showArcs = true,
  showHalos = true,
  useCategoryColors = true,
  background = null,
  radius = 3,
  cameraPosition = [0, 0, 12],
  cameraFov = 32,
  globePosition = [0, 0, 0],
  className,
  style,
}: InteractiveGlobeSceneProps) {
  const settings: DebugSettings = useMemo(
    () => ({ ...defaultDebugSettings, ...debug }),
    [debug],
  )

  const focusPosition = useMemo<Vector3 | null>(() => {
    if (focusedIndex === null || focusedIndex === undefined) return null
    const e = events[focusedIndex]
    if (!e) return null
    return latLonToVec3(e.lat, e.lon, radius)
  }, [events, focusedIndex, radius])

  const focused = focusedIndex !== null && focusedIndex !== undefined ? events[focusedIndex] : null

  return (
    <Canvas
      shadows
      dpr={[1, 1.5]}
      camera={{ position: cameraPosition, fov: cameraFov }}
      className={className}
      style={{ position: 'absolute', inset: 0, ...style }}
      gl={{ alpha: background === null }}
    >
      {background !== null && <color attach="background" args={[background]} />}
      <hemisphereLight intensity={0.35} groundColor="#cccccc" />
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 12, 8]} intensity={1.0} />
      <directionalLight position={[-10, 8, 6]} intensity={0.6} />
      <Suspense fallback={null}>
        <Globe
          radius={radius}
          rotationSpeed={settings.globeRotationSpeed}
          focusPosition={focusPosition}
          tiltDeg={23}
          position={globePosition}
        >
          <GlobePoints
            events={events}
            radius={radius}
            debug={{
              pointBaseSize: settings.pointBaseSize,
              pointWeightScale: settings.pointWeightScale,
              pointColor: settings.pointColor,
              showHalos,
              haloColor: settings.haloColor,
              haloOpacity: settings.haloOpacity,
            }}
            focusedIndex={focusedIndex ?? null}
            useCategoryColors={useCategoryColors}
            onPointSelect={onPointSelect}
            onPointEnter={onPointEnter}
            onPointLeave={onPointLeave}
          />
          {showArcs && (
            <GlobeArcs
              events={events}
              radius={radius}
              debug={{
                showArcs,
                arcK: settings.arcK,
                arcLift: settings.arcLift,
                arcColor: settings.arcColor,
                arcOpacity: settings.arcOpacity,
                arcStyle: settings.arcStyle,
              }}
            />
          )}
          <GlobeTooltip point={focused} radius={radius} render={renderTooltip} />
        </Globe>
      </Suspense>
    </Canvas>
  )
}
