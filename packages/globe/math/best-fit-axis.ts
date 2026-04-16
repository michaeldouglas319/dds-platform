import { Vector3 } from 'three'

/**
 * Best-fit rotation axis via 3x3 covariance + power iteration + deflation.
 * Returns the smallest eigenvector — normal to the plane of maximum variance.
 */
export function bestFitRotationAxis(points: Vector3[]): Vector3 {
  if (points.length < 3) return new Vector3(0, 1, 0)
  const vecs = points.map((p) => p.clone().normalize())
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
  let e1 = new Vector3(0.577, 0.577, 0.577)
  for (let i = 0; i < 40; i++) e1.copy(mul(e1)).normalize()
  let e2 = new Vector3(0.707, -0.707, 0)
  e2.sub(e1.clone().multiplyScalar(e2.dot(e1))).normalize()
  for (let i = 0; i < 40; i++) {
    e2.copy(mul(e2))
    e2.sub(e1.clone().multiplyScalar(e2.dot(e1)))
    e2.normalize()
  }
  return new Vector3().crossVectors(e1, e2).normalize()
}
