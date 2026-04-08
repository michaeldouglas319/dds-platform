'use client'

import { Suspense, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Instance, Instances, useTexture } from '@react-three/drei'
import type { Group } from 'three'
import { BackSide, BufferAttribute, BufferGeometry, Vector3 } from 'three'

export type ConflictEvent = {
  lat: number
  lon: number
  weight: number
  name?: string
  url?: string
  /** Direct hex override; wins over tag lookup if set. */
  color?: string
  /** Free-form keyword tag; matched against CATEGORY_COLORS. */
  tag?: string
}

/**
 * Keyword → color map. Producers attach a `tag` to each event;
 * the scene looks it up here. Unknown tags fall through to white.
 * Always shown, never discarded.
 */
export const CATEGORY_COLORS: Readonly<Record<string, string>> = {
  lethal: '#ff3355',
  protest: '#ff9933',
  political: '#aa33ff',
  infrastructure: '#3377ff',
  cyber: '#33ff99',
  displacement: '#ffdd33',
  famine: '#aa5533',
  disease: '#eeeeee',
  disaster: '#33ccff',
  science: '#000000',
}

function resolveColor(e: ConflictEvent, fallback: string): string {
  if (e.color) return e.color
  if (e.tag && CATEGORY_COLORS[e.tag]) return CATEGORY_COLORS[e.tag]
  return fallback
}

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
  globeRotationSpeed: number
}

// Defaults matched to the reference earth.html (radius-relative):
// size=0.014, k=3, lift=0.003, arc #66ccff — here our globe radius is 10, so
// the relative values become pointBaseSize=0.14 and arcLift=1.003.
export const defaultDebugSettings: DebugSettings = {
  pointBaseSize: 0.14,
  pointWeightScale: 0,
  pointColor: '#ffffff',
  showHalos: true,
  haloColor: '#000000',
  haloOpacity: 0.75,
  showArcs: true,
  arcK: 3,
  arcLift: 1.003,
  arcColor: '#66ccff',
  arcOpacity: 0.8,
  globeRotationSpeed: 0.03,
}

type PoimandresSceneProps = {
  events?: ConflictEvent[]
  debug?: DebugSettings
}

function latLonToVec3(lat: number, lon: number, radius: number): Vector3 {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lon + 180) * (Math.PI / 180)
  return new Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  )
}

/**
 * Best-fit rotation axis for a set of points on a unit sphere.
 *
 * Builds the 3x3 covariance matrix of the point positions, then uses
 * power iteration + deflation to find the three principal eigenvectors.
 * The SMALLEST eigenvector is normal to the plane of maximum variance —
 * i.e. the rotation axis whose equatorial sweep passes through the most
 * points. The globe's spin aligns to this axis so hotspots roll under
 * the camera naturally.
 */
function bestFitRotationAxis(points: Vector3[]): Vector3 {
  if (points.length < 3) return new Vector3(0, 1, 0)
  const vecs = points.map((p) => p.clone().normalize())
  // Symmetric 3x3 covariance (sum of outer products of unit vectors)
  let xx = 0, xy = 0, xz = 0, yy = 0, yz = 0, zz = 0
  for (const v of vecs) {
    xx += v.x * v.x
    xy += v.x * v.y
    xz += v.x * v.z
    yy += v.y * v.y
    yz += v.y * v.z
    zz += v.z * v.z
  }
  const mul = (v: Vector3): Vector3 =>
    new Vector3(
      xx * v.x + xy * v.y + xz * v.z,
      xy * v.x + yy * v.y + yz * v.z,
      xz * v.x + yz * v.y + zz * v.z,
    )
  // Power iteration — dominant (largest) eigenvector
  let e1 = new Vector3(0.577, 0.577, 0.577)
  for (let i = 0; i < 40; i++) e1.copy(mul(e1)).normalize()
  // Deflate: iterate orthogonal to e1 for the second eigenvector
  let e2 = new Vector3(0.707, -0.707, 0)
  e2.sub(e1.clone().multiplyScalar(e2.dot(e1))).normalize()
  for (let i = 0; i < 40; i++) {
    e2.copy(mul(e2))
    e2.sub(e1.clone().multiplyScalar(e2.dot(e1)))
    e2.normalize()
  }
  // Third axis = cross product of first two — this is the smallest eigenvector,
  // which is normal to the plane of maximum variance (our rotation axis).
  const e3 = new Vector3().crossVectors(e1, e2).normalize()
  return e3
}

function greatCircle(a: Vector3, b: Vector3, r: number, segs = 32): Vector3[] {
  const aN = a.clone().normalize()
  const bN = b.clone().normalize()
  const omega = Math.acos(Math.min(1, Math.max(-1, aN.dot(bN))))
  const sinO = Math.sin(omega) || 1e-6
  const pts: Vector3[] = []
  for (let i = 0; i <= segs; i++) {
    const t = i / segs
    const s1 = Math.sin((1 - t) * omega) / sinO
    const s2 = Math.sin(t * omega) / sinO
    pts.push(
      new Vector3(
        (aN.x * s1 + bN.x * s2) * r,
        (aN.y * s1 + bN.y * s2) * r,
        (aN.z * s1 + bN.z * s2) * r,
      ),
    )
  }
  return pts
}

type PreparedPoint = {
  pos: Vector3
  baseScale: number
  color: string
}

function ConflictPoints({
  events,
  radius,
  debug,
}: {
  events: ConflictEvent[]
  radius: number
  debug: DebugSettings
}) {
  const coreGroupRef = useRef<Group>(null)
  const haloGroupRef = useRef<Group>(null)

  const points = useMemo<PreparedPoint[]>(() => {
    // For now: every dot is the debug.pointColor (default white).
    // Tag-based coloring is intentionally bypassed; flip back to
    // resolveColor(e, debug.pointColor) when categories should drive color.
    return events.map((e) => {
      const pos = latLonToVec3(e.lat, e.lon, radius + 0.05)
      const baseScale = Math.min(
        0.5,
        debug.pointBaseSize + Math.log10(e.weight + 1) * debug.pointWeightScale,
      )
      return { pos, baseScale, color: debug.pointColor }
    })
  }, [events, radius, debug.pointBaseSize, debug.pointWeightScale, debug.pointColor])

  const arcGeometry = useMemo<BufferGeometry | null>(() => {
    if (!debug.showArcs || events.length < 2) return null
    const K = debug.arcK
    const arcLift = radius * debug.arcLift
    const arcEvents = events.slice(0, 500)
    const arcPositions: Vector3[] = arcEvents.map((e) =>
      latLonToVec3(e.lat, e.lon, arcLift),
    )
    const verts: number[] = []
    const seen = new Set<string>()
    for (let i = 0; i < arcPositions.length; i++) {
      // rank all others by distance, take K nearest
      const ranked: Array<{ j: number; d: number }> = []
      for (let j = 0; j < arcPositions.length; j++) {
        if (j === i) continue
        ranked.push({
          j,
          d: arcPositions[i].distanceToSquared(arcPositions[j]),
        })
      }
      ranked.sort((a, b) => a.d - b.d)
      for (let n = 0; n < Math.min(K, ranked.length); n++) {
        const j = ranked[n].j
        // dedupe: only draw each pair once
        const key = i < j ? `${i}-${j}` : `${j}-${i}`
        if (seen.has(key)) continue
        seen.add(key)
        const pts = greatCircle(arcPositions[i], arcPositions[j], arcLift, 48)
        for (let k = 0; k < pts.length - 1; k++) {
          verts.push(pts[k].x, pts[k].y, pts[k].z)
          verts.push(pts[k + 1].x, pts[k + 1].y, pts[k + 1].z)
        }
      }
    }
    const geom = new BufferGeometry()
    geom.setAttribute('position', new BufferAttribute(new Float32Array(verts), 3))
    return geom
  }, [events, radius, debug.showArcs, debug.arcK, debug.arcLift])

  if (points.length === 0) return null

  return (
    <group>
      <group ref={coreGroupRef}>
        <Instances limit={Math.max(points.length, 1)} range={points.length}>
          <sphereGeometry args={[1, 12, 12]} />
          <meshBasicMaterial
            toneMapped={false}
            transparent
            opacity={0.55}
            depthWrite={false}
          />
          {points.map((p, i) => (
            <Instance
              key={`c-${i}`}
              position={p.pos}
              scale={p.baseScale}
              color={p.color}
            />
          ))}
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
            {points.map((p, i) => {
              const normal = p.pos.clone().normalize()
              const lookAt = p.pos.clone().add(normal)
              return (
                <Instance
                  key={`h-${i}`}
                  position={p.pos}
                  scale={p.baseScale}
                  onUpdate={(self) => self.lookAt(lookAt)}
                />
              )
            })}
          </Instances>
        </group>
      )}
      {arcGeometry && (
        <lineSegments geometry={arcGeometry}>
          <lineBasicMaterial
            color={debug.arcColor}
            transparent
            opacity={debug.arcOpacity}
            toneMapped={false}
          />
        </lineSegments>
      )}
    </group>
  )
}

// NASA / three.js example earth diffuse map
const EARTH_TEXTURE_URL =
  'https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg'

const GLOBE_RADIUS = 6

// Centered black dot — pushed far back behind everything; gentle vertical bob.
function BlackDot() {
  const ref = useRef<Group>(null)
  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y = -2 + Math.sin(state.clock.elapsedTime * 0.6) * 0.08
    }
  })
  return (
    <group ref={ref} position={[0, -2, -28]}>
      <mesh castShadow scale={0.45}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial color="#000000" roughness={0.25} metalness={0.05} />
      </mesh>
    </group>
  )
}

function Earth({
  events,
  debug,
}: {
  events: ConflictEvent[]
  debug: DebugSettings
}) {
  const texture = useTexture(EARTH_TEXTURE_URL)

  // Earth held stationary — no spin. Rotated slightly so North America/Atlantic
  // face the camera as the default view.
  return (
    <group position={[14, 4, -6]}>
      <group rotation={[0, -Math.PI / 4, 0]}>
        {/* Earth */}
        <mesh castShadow scale={GLOBE_RADIUS}>
          <sphereGeometry args={[1, 64, 64]} />
          <meshPhongMaterial map={texture} specular="#222222" shininess={12} />
        </mesh>
        {/* Atmosphere glow — backside sphere 2.5% larger */}
        <mesh scale={GLOBE_RADIUS * 1.025}>
          <sphereGeometry args={[1, 64, 64]} />
          <meshBasicMaterial color="#4aa3ff" transparent opacity={0.12} side={BackSide} />
        </mesh>
        <ConflictPoints events={events} radius={GLOBE_RADIUS} debug={debug} />
      </group>
    </group>
  )
}

export default function PoimandresScene({
  events = [],
  debug = defaultDebugSettings,
}: PoimandresSceneProps) {
  return (
    <Canvas
      shadows
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 35], fov: 28 }}
      style={{ position: 'absolute', inset: 0 }}
    >
      <color attach="background" args={['#f0f0f0']} />
      <fog attach="fog" args={['#f0f0f0', 60, 120]} />
      <hemisphereLight intensity={0.25} groundColor="#cccccc" />
      <ambientLight intensity={0.45} />
      {/* Key light — directional, casts the ground shadows for both spheres */}
      <directionalLight
        position={[12, 25, 18]}
        intensity={1.4}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={1}
        shadow-camera-far={80}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
        shadow-bias={-0.0005}
      />
      {/* Soft fill from the opposite side */}
      <directionalLight position={[-15, 10, -10]} intensity={0.3} />
      {/* Floor — receives shadows */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -8, 0]}>
        <planeGeometry args={[300, 300]} />
        <meshStandardMaterial color="#f4f4f4" roughness={0.95} />
      </mesh>
      {/* Ceiling — pure white plane facing down */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 30, 0]}>
        <planeGeometry args={[300, 300]} />
        <meshStandardMaterial color="#ffffff" roughness={1} side={BackSide} />
      </mesh>
      <BlackDot />
      <Suspense fallback={null}>
        <Earth events={events} debug={debug} />
      </Suspense>
    </Canvas>
  )
}
