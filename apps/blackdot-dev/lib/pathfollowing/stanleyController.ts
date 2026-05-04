import * as THREE from 'three'
import { SplinePath } from './splinePath'
import { StanleyControllerParams, PathFollowingState } from './types'

/**
 * Stanley method path follower
 *
 * The Stanley controller combines two error signals:
 * 1. Heading error: angle between vehicle heading and path tangent
 * 2. Cross-track error: perpendicular distance from path
 *
 * Steering = heading_error + atan2(lateral_gain * cross_track_error / speed)
 *
 * Reference: Thrun, S. et al. "Stanley: The Robot that Won the DARPA Grand Challenge"
 */
export class StanleyController {
  private path: SplinePath
  private params: StanleyControllerParams
  private currentT: number = 0
  private speed: number = 1

  constructor(path: SplinePath, params: Partial<StanleyControllerParams> = {}) {
    this.path = path
    this.params = {
      lookAheadDistance: params.lookAheadDistance ?? 5,
      lateralGain: params.lateralGain ?? 1.0,
      headingGain: params.headingGain ?? 0.5,
      maxSteering: params.maxSteering ?? Math.PI / 4 // 45 degrees
    }
  }

  /**
   * Update controller state and return steering command
   */
  compute(
    position: THREE.Vector3,
    heading: THREE.Vector3,
    speed: number
  ): PathFollowingState & { steeringCommand: number } {
    this.speed = Math.max(0.1, speed) // Avoid division by zero

    // Find closest point on path
    const closest = this.path.getClosestPoint(position, 0.01)
    this.currentT = closest.t

    // Get look-ahead point
    const lookAheadT = this.path.getLookAheadParameter(
      closest.t,
      this.params.lookAheadDistance
    )

    // Compute heading error (angle between vehicle and path)
    const pathTangent = this.path.getTangentAt(lookAheadT)
    const headingNorm = heading.normalize()
    const headingError = this.getHeadingError(headingNorm, pathTangent)

    // Compute cross-track error
    const crossTrackError = this.path.getCrossTrackError(position, lookAheadT)

    // Stanley law: steering = heading_error + atan(k_e * cte / v)
    const lateralTerm = Math.atan2(
      this.params.lateralGain * crossTrackError,
      this.speed
    )

    const steeringCommand = this.clamp(
      headingError + lateralTerm,
      -this.params.maxSteering,
      this.params.maxSteering
    )

    return {
      currentPoint: closest.point,
      currentTangent: pathTangent,
      currentCurvature: this.path.getCurvatureAt(lookAheadT),
      pathParameter: lookAheadT,
      crossTrackError,
      headingError,
      steeringCommand
    }
  }

  /**
   * Get heading error as signed angle in radians
   * Positive = need to turn left, Negative = need to turn right
   */
  private getHeadingError(vehicleHeading: THREE.Vector3, pathTangent: THREE.Vector3): number {
    // Normalize both vectors
    const v = vehicleHeading.normalize()
    const t = pathTangent.normalize()

    // Get angle using atan2 for proper quadrant
    const cross = v.clone().cross(t)
    const dot = v.dot(t)

    // Clamp dot product to [-1, 1] to avoid acos domain errors
    const angle = Math.atan2(cross.length(), dot)

    // Determine sign from cross product
    const sign = cross.y >= 0 ? 1 : -1
    return sign * angle
  }

  /**
   * Clamp value to range [min, max]
   */
  private clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value))
  }

  /**
   * Update controller parameters
   */
  setParams(params: Partial<StanleyControllerParams>): void {
    this.params = { ...this.params, ...params }
  }

  /**
   * Get current parameters
   */
  getParams(): StanleyControllerParams {
    return { ...this.params }
  }

  /**
   * Get current progress along path (0 to 1)
   */
  getProgress(): number {
    return this.currentT
  }

  /**
   * Check if path is complete
   */
  isComplete(): boolean {
    return this.currentT >= 0.99
  }
}

/**
 * Pure Pursuit controller (simpler alternative to Stanley)
 *
 * Follows a fixed look-ahead distance and steers toward that point
 */
export class PurePursuitController {
  private path: SplinePath
  private lookAheadDistance: number
  private currentT: number = 0

  constructor(path: SplinePath, lookAheadDistance: number = 5) {
    this.path = path
    this.lookAheadDistance = lookAheadDistance
  }

  compute(
    position: THREE.Vector3,
    vehicleHeading: THREE.Vector3,
    speed: number
  ): PathFollowingState & { steeringCommand: number } {
    // Find closest point on path
    const closest = this.path.getClosestPoint(position, 0.01)
    this.currentT = closest.t

    // Get look-ahead point
    const lookAheadT = this.path.getLookAheadParameter(
      closest.t,
      this.lookAheadDistance
    )
    const lookAheadPoint = this.path.getPointAt(lookAheadT)

    // Vector from vehicle to look-ahead point
    const toLookAhead = lookAheadPoint.clone().sub(position)
    const distanceToLookAhead = toLookAhead.length()

    // Angle to steer toward look-ahead point
    const desiredHeading = toLookAhead.normalize()
    const vehicleHeadingNorm = vehicleHeading.normalize()

    const cross = vehicleHeadingNorm.clone().cross(desiredHeading)
    const dot = vehicleHeadingNorm.dot(desiredHeading)
    const steeringCommand = Math.atan2(cross.length(), dot)

    // Determine sign from cross product
    const sign = (cross.y >= 0 ? 1 : -1)

    return {
      currentPoint: closest.point,
      currentTangent: this.path.getTangentAt(lookAheadT),
      currentCurvature: this.path.getCurvatureAt(lookAheadT),
      pathParameter: lookAheadT,
      crossTrackError: closest.distance,
      headingError: sign * steeringCommand,
      steeringCommand: sign * steeringCommand
    }
  }

  setLookAheadDistance(distance: number): void {
    this.lookAheadDistance = Math.max(0.5, distance)
  }

  getProgress(): number {
    return this.currentT
  }

  isComplete(): boolean {
    return this.currentT >= 0.99
  }
}
