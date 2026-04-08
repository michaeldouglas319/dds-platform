'use client'

import { Suspense, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Instance, Instances, useTexture } from '@react-three/drei'
import type { Group } from 'three'
import { BackSide, BufferAttribute, BufferGeometry, Color, ShaderMaterial, Vector3 } from 'three'
import type { ShaderMaterial as ShaderMaterialType } from 'three'

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

// Defaults matched to the reference earth.html (radius-relative):
// size=0.014, k=3, lift=0.003, arc #66ccff — here our globe radius is 10, so
// the relative values become pointBaseSize=0.14 and arcLift=1.003.
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

/**
 * Great-circle arc that ANCHORS at the sphere surface on both endpoints
 * and bows outward in the middle. Endpoints are at `surfaceR`, midpoint at
 * `surfaceR + maxLift`. Profile is a half-sine so the curve smoothly leaves
 * and meets the surface tangent-like, intersecting the globe at the points.
 */
function greatCircle(
  a: Vector3,
  b: Vector3,
  surfaceR: number,
  segs = 32,
  maxLift = 0,
): Vector3[] {
  const aN = a.clone().normalize()
  const bN = b.clone().normalize()
  const omega = Math.acos(Math.min(1, Math.max(-1, aN.dot(bN))))
  const sinO = Math.sin(omega) || 1e-6
  const pts: Vector3[] = []
  for (let i = 0; i <= segs; i++) {
    const t = i / segs
    const s1 = Math.sin((1 - t) * omega) / sinO
    const s2 = Math.sin(t * omega) / sinO
    // Lift profile: 0 at endpoints, maxLift at midpoint, smooth half-sine
    const r = surfaceR + maxLift * Math.sin(Math.PI * t)
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

// ─── Arc shader ────────────────────────────────────────────────────────────
// Single material that switches between solid/gradient/pulse/noise via a
// `uStyle` int uniform. `aT` is per-vertex parametric position 0..1 along
// the arc; `aSeed` is a per-arc random scalar so noise/pulse desync.
const ARC_VERT = /* glsl */ `
  attribute float aT;
  attribute float aSeed;
  attribute float aRank;
  attribute float aWeight;
  varying float vT;
  varying float vSeed;
  varying float vRank;
  varying float vWeight;
  uniform int uStyle;
  uniform float uTime;

  // tiny hash for electric jitter
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  void main() {
    vT = aT;
    vSeed = aSeed;
    vRank = aRank;
    vWeight = aWeight;
    vec3 p = position;

    // Style 3 = noise: jitter the line laterally based on a hash of position+time
    // Heavier-weight arcs jitter more — reads as "energetic" / unstable.
    if (uStyle == 3) {
      float n = hash(vec2(aT * 53.0 + aSeed * 97.0, floor(uTime * 12.0)));
      float jitter = (n - 0.5) * 0.06 * (0.3 + 1.4 * aWeight);
      // perpendicular-ish offset using normal of the position vector (radial)
      vec3 radial = normalize(p);
      // produce two arbitrary tangents in the plane perpendicular to radial
      vec3 t1 = normalize(cross(radial, vec3(0.0, 1.0, 0.0) + 0.001));
      vec3 t2 = cross(radial, t1);
      p += (t1 * jitter + t2 * jitter * 0.7);
    }

    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`

const ARC_FRAG = /* glsl */ `
  precision highp float;
  varying float vT;
  varying float vSeed;
  varying float vRank;
  varying float vWeight;
  uniform int uStyle;
  uniform float uTime;
  uniform float uOpacity;
  uniform vec3 uColor;

  void main() {
    // Closeness rank scales every style: nearest neighbors render strongest,
    // furthest in the K-set fade quietly into the background.
    float a = uOpacity * vRank;

    // Style 1 = gradient: half-sine bell along the arc (faded ends, bright middle)
    if (uStyle == 1) {
      a *= sin(3.14159265 * vT);
    }

    // Style 2 = pulse: a bead travels along each arc, brighter than the line
    else if (uStyle == 2) {
      // Position of the bead in 0..1, offset by per-arc seed
      float bead = fract(uTime * 0.6 + vSeed);
      float dist = abs(vT - bead);
      // wrap distance around the arc (so it loops smoothly)
      dist = min(dist, 1.0 - dist);
      float pulse = exp(-dist * 30.0);
      a = uOpacity * (0.25 + 1.5 * pulse);
    }

    // Style 3 = noise: pulsing flicker per arc
    else if (uStyle == 3) {
      float flick = 0.6 + 0.4 * sin(uTime * 8.0 + vSeed * 25.0);
      a *= flick;
    }

    gl_FragColor = vec4(uColor, clamp(a, 0.0, 1.0));
  }
`

const STYLE_INT: Record<ArcStyle, number> = {
  solid: 0,
  gradient: 1,
  pulse: 2,
  noise: 3,
}

function ArcLines({
  geometry,
  color,
  opacity,
  style,
}: {
  geometry: BufferGeometry
  color: string
  opacity: number
  style: ArcStyle
}) {
  const matRef = useRef<ShaderMaterialType>(null)

  // Build the material once and reuse — uniforms update via useFrame.
  const material = useMemo(() => {
    return new ShaderMaterial({
      vertexShader: ARC_VERT,
      fragmentShader: ARC_FRAG,
      uniforms: {
        uTime: { value: 0 },
        uStyle: { value: STYLE_INT[style] },
        uOpacity: { value: opacity },
        uColor: { value: new Color(color) },
      },
      transparent: true,
      depthWrite: false,
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Sync uniforms with prop changes (style/color/opacity).
  useMemo(() => {
    if (!material) return
    material.uniforms.uStyle.value = STYLE_INT[style]
    material.uniforms.uOpacity.value = opacity
    ;(material.uniforms.uColor.value as Color).set(color)
  }, [material, style, color, opacity])

  // Drive uTime each frame for animated variants.
  useFrame((state) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = state.clock.elapsedTime
    }
  })

  return (
    <lineSegments geometry={geometry}>
      <primitive object={material} ref={matRef} attach="material" />
    </lineSegments>
  )
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
    // Anchor point centers exactly on the sphere surface so each marker
    // half-protrudes — visually contacting the globe instead of floating.
    const POINT_ALTITUDE = radius
    return events.map((e) => {
      const pos = latLonToVec3(e.lat, e.lon, POINT_ALTITUDE)
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
    const surfaceR = radius
    // arcLift is now a direct multiplier: 0 = flat on surface, 1.5 = bow up
    // to 1.5× radius above the surface at the apex.
    const maxLift = radius * debug.arcLift
    const arcEvents = events.slice(0, 500)
    const arcPositions: Vector3[] = arcEvents.map((e) =>
      latLonToVec3(e.lat, e.lon, surfaceR),
    )
    // ─── Pass 1: collect every (i,j) pair we'll draw, with distance + weight ─
    type PairCandidate = { i: number; j: number; d: number; w: number }
    const pairs: PairCandidate[] = []
    const seen = new Set<string>()
    for (let i = 0; i < arcPositions.length; i++) {
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
        const key = i < j ? `${i}-${j}` : `${j}-${i}`
        if (seen.has(key)) continue
        seen.add(key)
        // Pair "intensity" — log of the heavier endpoint's fatality count.
        // Log compresses the wild range (1..10000+) so the visualization
        // doesn't get dominated by 2-3 mass-casualty events.
        const wMax = Math.max(arcEvents[i].weight, arcEvents[j].weight)
        pairs.push({ i, j, d: ranked[n].d, w: Math.log10(wMax + 1) })
      }
    }

    // ─── Pass 2: normalize BOTH distance and weight across the whole graph ───
    let dMin = Infinity
    let dMax = 0
    let wMin = Infinity
    let wMax = 0
    for (const p of pairs) {
      if (p.d < dMin) dMin = p.d
      if (p.d > dMax) dMax = p.d
      if (p.w < wMin) wMin = p.w
      if (p.w > wMax) wMax = p.w
    }
    const dSpan = Math.max(dMax - dMin, 1e-6)
    const wSpan = Math.max(wMax - wMin, 1e-6)

    const verts: number[] = []
    const ts: number[] = []
    const seeds: number[] = []
    const ranks: number[] = []
    // Per-vertex normalized weight (severity) — exposed to the shader so
    // noise/pulse modes can also drive jitter or brightness from intensity.
    const weights: number[] = []
    const SEGS = 48
    let arcIndex = 0
    for (const pair of pairs) {
      // Normalized closeness (1 = closest, 0 = farthest) — drives base lift.
      const norm = 1 - (pair.d - dMin) / dSpan
      const closeness = 0.15 + 0.85 * norm
      // Normalized intensity (1 = heaviest pair, 0 = lightest) — boosts lift
      // multiplicatively so high-fatality pairs arch noticeably higher.
      const intensity = (pair.w - wMin) / wSpan
      const intensityBoost = 0.5 + 1.0 * intensity // 0.5..1.5
      const arcLiftThis = maxLift * closeness * intensityBoost
      const pts = greatCircle(
        arcPositions[pair.i],
        arcPositions[pair.j],
        surfaceR,
        SEGS,
        arcLiftThis,
      )
      const seed = (arcIndex * 0.6180339887) % 1
      arcIndex++
      for (let k = 0; k < pts.length - 1; k++) {
        const t0 = k / (pts.length - 1)
        const t1 = (k + 1) / (pts.length - 1)
        verts.push(pts[k].x, pts[k].y, pts[k].z)
        verts.push(pts[k + 1].x, pts[k + 1].y, pts[k + 1].z)
        ts.push(t0, t1)
        seeds.push(seed, seed)
        ranks.push(closeness, closeness)
        weights.push(intensity, intensity)
      }
    }
    const geom = new BufferGeometry()
    geom.setAttribute('position', new BufferAttribute(new Float32Array(verts), 3))
    geom.setAttribute('aT', new BufferAttribute(new Float32Array(ts), 1))
    geom.setAttribute('aSeed', new BufferAttribute(new Float32Array(seeds), 1))
    geom.setAttribute('aRank', new BufferAttribute(new Float32Array(ranks), 1))
    geom.setAttribute('aWeight', new BufferAttribute(new Float32Array(weights), 1))
    return geom
  }, [events, radius, debug.showArcs, debug.arcK, debug.arcLift])

  if (points.length === 0) return null

  return (
    <group>
      <group ref={coreGroupRef}>
        <Instances limit={Math.max(points.length, 1)} range={points.length}>
          <sphereGeometry args={[1, 12, 12]} />
          <meshBasicMaterial toneMapped={false} />
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
        <ArcLines
          geometry={arcGeometry}
          color={debug.arcColor}
          opacity={debug.arcOpacity}
          style={debug.arcStyle}
        />
      )}
    </group>
  )
}

// NASA / three.js example earth diffuse map
const EARTH_TEXTURE_URL =
  'https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg'

const GLOBE_RADIUS = 3

// Centered black dot — small, intimate, gentle vertical bob.
function BlackDot() {
  const ref = useRef<Group>(null)
  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y = -1 + Math.sin(state.clock.elapsedTime * 0.6) * 0.04
    }
  })
  return (
    <group ref={ref} position={[0, -1, -8]}>
      <mesh castShadow scale={0.12}>
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
  const spinRef = useRef<Group>(null)
  const texture = useTexture(EARTH_TEXTURE_URL)

  useFrame((_, delta) => {
    if (spinRef.current) spinRef.current.rotation.y += delta * debug.globeRotationSpeed
  })

  return (
    <group position={[0, 6, -12]} rotation={[(23 * Math.PI) / 180, 0, 0]}>
      <group ref={spinRef} rotation={[0, -Math.PI / 4, 0]}>
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
      {/* Right key light — directional, casts ground shadows */}
      <directionalLight
        position={[12, 25, 18]}
        intensity={1.1}
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
      {/* Left key light — mirrored, equal intensity, also casts shadows */}
      <directionalLight
        position={[-12, 25, 18]}
        intensity={1.1}
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
