import * as THREE from 'three'

/**
 * Wrapper around THREE.CatmullRomCurve3 providing path following utilities
 * Catmull-Rom curves provide smooth interpolation through waypoints with C1 continuity
 */
export class SplinePath {
  private curve: THREE.CatmullRomCurve3
  private curveLength: number
  private lengthCache: Map<number, number> = new Map()
  private CACHE_RESOLUTION = 0.01 // Cache every 1% of curve

  constructor(waypoints: THREE.Vector3[]) {
    if (waypoints.length < 2) {
      throw new Error('SplinePath requires at least 2 waypoints')
    }

    // CatmullRomCurve3 requires at least 4 points, so we duplicate endpoints
    const extendedPoints = [
      waypoints[0],
      ...waypoints,
      waypoints[waypoints.length - 1]
    ]

    this.curve = new THREE.CatmullRomCurve3(extendedPoints, false, 'centripetal')
    this.curveLength = this.curve.getLength()
    this.precomputeCache()
  }

  /**
   * Pre-compute arc length at regular intervals for faster lookups
   * Note: Three.js Curve.getLength() doesn't support parameter-based lookup,
   * so we cache the total length for repeated access
   */
  private precomputeCache(): void {
    // Cache the total curve length for quick access
    this.lengthCache.set(0, this.curveLength)
  }

  /**
   * Get point at parameter t (0 to 1)
   */
  getPointAt(t: number): THREE.Vector3 {
    return this.curve.getPointAt(t)
  }

  /**
   * Get tangent (direction) at parameter t
   */
  getTangentAt(t: number): THREE.Vector3 {
    return this.curve.getTangentAt(t).normalize()
  }

  /**
   * Get curvature at parameter t using finite differences
   * Curvature measures how sharply the path curves (0 = straight, higher = more curved)
   */
  getCurvatureAt(t: number): number {
    const dt = 0.001
    const p1 = this.curve.getPointAt(Math.max(0, t - dt))
    const p2 = this.curve.getPointAt(t)
    const p3 = this.curve.getPointAt(Math.min(1, t + dt))

    const v1 = p2.clone().sub(p1)
    const v2 = p3.clone().sub(p2)
    const a = v2.clone().sub(v1)

    const cross = v1.clone().cross(a)
    const numerator = cross.length()
    const denominator = Math.pow(v1.length(), 3)

    return denominator > 0.001 ? numerator / denominator : 0
  }

  /**
   * Get total length of the curve
   */
  getLength(): number {
    return this.curveLength
  }

  /**
   * Find closest point on curve to given position
   * Returns both the point and the parameter t
   */
  getClosestPoint(
    position: THREE.Vector3,
    resolution: number = 0.01
  ): {
    point: THREE.Vector3
    t: number
    distance: number
  } {
    let closestT = 0
    let closestDistance = Infinity
    let closestPoint = this.curve.getPointAt(0)

    for (let t = 0; t <= 1; t += resolution) {
      const point = this.curve.getPointAt(t)
      const distance = position.distanceTo(point)

      if (distance < closestDistance) {
        closestDistance = distance
        closestT = t
        closestPoint = point
      }
    }

    // Refine with binary search in the local vicinity
    return {
      point: closestPoint,
      t: closestT,
      distance: closestDistance
    }
  }

  /**
   * Get cross-track error (perpendicular distance from path to point)
   */
  getCrossTrackError(position: THREE.Vector3, t: number): number {
    const pathPoint = this.curve.getPointAt(t)
    const toPoint = position.clone().sub(pathPoint)
    const tangent = this.getTangentAt(t)

    // Cross product magnitude gives perpendicular distance
    return toPoint.clone().cross(tangent).length()
  }

  /**
   * Get heading error (angle between vehicle heading and path tangent)
   */
  getHeadingError(vehicleHeading: THREE.Vector3, t: number): number {
    const pathTangent = this.getTangentAt(t)
    const normalized = vehicleHeading.normalize()

    // Dot product gives cosine of angle
    const cosAngle = Math.max(-1, Math.min(1, normalized.dot(pathTangent)))
    const angle = Math.acos(cosAngle)

    // Use cross product to determine sign
    const cross = normalized.clone().cross(pathTangent)
    return Math.sign(cross.y || cross.z) * angle
  }

  /**
   * Get approximate arc length up to parameter t
   * Note: Three.js doesn't provide this directly, so we use linear approximation
   * For smooth curves, arc length is approximately proportional to parameter t
   */
  private getApproximateLength(t: number): number {
    return t * this.curveLength
  }

  /**
   * Get next waypoint parameter ahead of current position
   * Useful for look-ahead in path following
   */
  getLookAheadParameter(currentT: number, distance: number): number {
    const currentLength = this.getApproximateLength(currentT)
    const targetLength = currentLength + distance
    const maxLength = this.curveLength

    if (targetLength >= maxLength) {
      return 1
    }

    // Convert target length back to parameter t
    // Using linear approximation: t ≈ targetLength / totalLength
    let resultT = targetLength / maxLength

    // Refine with a few iterations of sampling nearby points
    for (let i = 0; i < 3; i++) {
      const sampleLength = this.getApproximateLength(resultT)
      if (Math.abs(sampleLength - targetLength) < 0.01 * this.curveLength) {
        break
      }

      // Adjust t based on the difference
      const error = targetLength - sampleLength
      resultT += (error / maxLength) * 0.1
      resultT = Math.max(currentT, Math.min(1, resultT))
    }

    return resultT
  }

  /**
   * Get parameter along curve from arc length (0 to getLength())
   * Inverse of arc length parameterization
   */
  getParameterAtDistance(distance: number): number {
    if (distance <= 0) return 0
    if (distance >= this.curveLength) return 1

    // Use linear approximation for parameter from distance
    // t ≈ distance / totalLength
    let t = distance / this.curveLength

    // Refine with iteration
    for (let i = 0; i < 5; i++) {
      const len = this.getApproximateLength(t)

      if (Math.abs(len - distance) < 0.01 * this.curveLength) {
        return t
      }

      // Adjust t based on error
      const error = distance - len
      t += (error / this.curveLength) * 0.5
      t = Math.max(0, Math.min(1, t))
    }

    return t
  }

  /**
   * Get visualization geometry (useful for debug rendering)
   */
  getGeometry(resolution: number = 100): THREE.BufferGeometry {
    const points = this.curve.getPoints(resolution)
    return new THREE.BufferGeometry().setFromPoints(points)
  }
}
