import { Vector3 } from 'three'

/**
 * Great-circle arc anchored at the sphere surface on both endpoints,
 * bowing outward via a half-sine lift profile.
 */
export function greatCircle(
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
