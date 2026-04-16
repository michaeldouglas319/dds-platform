'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  BufferAttribute,
  BufferGeometry,
  Color,
  ShaderMaterial,
  Vector3,
  type ShaderMaterial as ShaderMaterialType,
} from 'three'
import type { ArcStyle, DebugSettings, GlobePoint } from '../types'
import { latLonToVec3 } from '../math/lat-lon'
import { greatCircle } from '../math/great-circle'

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
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  void main() {
    vT = aT; vSeed = aSeed; vRank = aRank; vWeight = aWeight;
    vec3 p = position;
    if (uStyle == 3) {
      float n = hash(vec2(aT * 53.0 + aSeed * 97.0, floor(uTime * 12.0)));
      float jitter = (n - 0.5) * 0.06 * (0.3 + 1.4 * aWeight);
      vec3 radial = normalize(p);
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
    float a = uOpacity * vRank;
    if (uStyle == 1) { a *= sin(3.14159265 * vT); }
    else if (uStyle == 2) {
      float bead = fract(uTime * 0.6 + vSeed);
      float dist = abs(vT - bead);
      dist = min(dist, 1.0 - dist);
      float pulse = exp(-dist * 30.0);
      a = uOpacity * (0.25 + 1.5 * pulse);
    } else if (uStyle == 3) {
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

type GlobeArcsProps = {
  events: GlobePoint[]
  radius: number
  debug: Pick<DebugSettings, 'showArcs' | 'arcK' | 'arcLift' | 'arcColor' | 'arcOpacity' | 'arcStyle'>
}

export function GlobeArcs({ events, radius, debug }: GlobeArcsProps) {
  const matRef = useRef<ShaderMaterialType>(null)

  const arcGeometry = useMemo<BufferGeometry | null>(() => {
    if (!debug.showArcs || events.length < 2) return null
    const K = debug.arcK
    const surfaceR = radius
    const maxLift = radius * debug.arcLift
    const arcEvents = events.slice(0, 500)
    const arcPositions: Vector3[] = arcEvents.map((e) =>
      latLonToVec3(e.lat, e.lon, surfaceR),
    )
    type PairCandidate = { i: number; j: number; d: number; w: number }
    const pairs: PairCandidate[] = []
    const seen = new Set<string>()
    for (let i = 0; i < arcPositions.length; i++) {
      const ranked: Array<{ j: number; d: number }> = []
      for (let j = 0; j < arcPositions.length; j++) {
        if (j === i) continue
        ranked.push({ j, d: arcPositions[i].distanceToSquared(arcPositions[j]) })
      }
      ranked.sort((a, b) => a.d - b.d)
      for (let n = 0; n < Math.min(K, ranked.length); n++) {
        const j = ranked[n].j
        const key = i < j ? `${i}-${j}` : `${j}-${i}`
        if (seen.has(key)) continue
        seen.add(key)
        const wMax = Math.max(arcEvents[i].weight, arcEvents[j].weight)
        pairs.push({ i, j, d: ranked[n].d, w: Math.log10(wMax + 1) })
      }
    }
    let dMin = Infinity, dMax = 0, wMin = Infinity, wMax = 0
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
    const weights: number[] = []
    const SEGS = 48
    let arcIndex = 0
    for (const pair of pairs) {
      const norm = 1 - (pair.d - dMin) / dSpan
      const closeness = 0.15 + 0.85 * norm
      const intensity = (pair.w - wMin) / wSpan
      const intensityBoost = 0.5 + 1.0 * intensity
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

  const material = useMemo(() => {
    return new ShaderMaterial({
      vertexShader: ARC_VERT,
      fragmentShader: ARC_FRAG,
      uniforms: {
        uTime: { value: 0 },
        uStyle: { value: STYLE_INT[debug.arcStyle] },
        uOpacity: { value: debug.arcOpacity },
        uColor: { value: new Color(debug.arcColor) },
      },
      transparent: true,
      depthWrite: false,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useMemo(() => {
    if (!material) return
    material.uniforms.uStyle.value = STYLE_INT[debug.arcStyle]
    material.uniforms.uOpacity.value = debug.arcOpacity
    ;(material.uniforms.uColor.value as Color).set(debug.arcColor)
  }, [material, debug.arcStyle, debug.arcOpacity, debug.arcColor])

  useFrame((state) => {
    if (matRef.current) matRef.current.uniforms.uTime.value = state.clock.elapsedTime
  })

  if (!arcGeometry) return null

  return (
    <lineSegments geometry={arcGeometry}>
      <primitive object={material} ref={matRef} attach="material" />
    </lineSegments>
  )
}
