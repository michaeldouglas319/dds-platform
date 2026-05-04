import * as THREE from 'three'

/**
 * Advanced Orientation System
 *
 * Handles precise orientation calculations including:
 * - Quaternion-based rotations (no gimbal lock)
 * - SLERP interpolation for smooth transitions
 * - Bank angle calculation from path curvature
 * - Multiple orientation methods for different use cases
 */

/**
 * Calculate orientation from velocity direction with optional bank angle
 * @param velocity Current velocity vector
 * @param pathCurvature Optional path curvature for banking
 * @param speed Current speed for banking calculation
 * @returns Quaternion representing orientation
 */
export function orientationFromVelocity(
  velocity: THREE.Vector3,
  pathCurvature: number = 0,
  speed: number = 1
): THREE.Quaternion {
  const direction = velocity.clone().normalize()

  // Calculate forward heading
  const forwardAxis = new THREE.Vector3(0, 0, -1) // Forward in Three.js is -Z
  const heading = getHeadingFromDirection(direction)

  // Calculate bank angle if curvature is provided
  const bankAngle = calculateBankAngle(pathCurvature, speed)

  // Combine heading and bank into quaternion
  return quaternionFromHeadingAndBank(heading, bankAngle)
}

/**
 * Calculate heading angle from a 3D direction vector
 * @param direction Normalized direction vector
 * @returns Heading in radians (0 to 2π)
 */
export function getHeadingFromDirection(direction: THREE.Vector3): number {
  const normalized = direction.normalize()
  const heading = Math.atan2(normalized.x, normalized.z)
  return heading < 0 ? heading + Math.PI * 2 : heading
}

/**
 * Calculate pitch angle from a 3D direction vector
 * @param direction Normalized direction vector
 * @returns Pitch in radians (-π/2 to π/2)
 */
export function getPitchFromDirection(direction: THREE.Vector3): number {
  const normalized = direction.normalize()
  const horizontal = Math.sqrt(normalized.x * normalized.x + normalized.z * normalized.z)
  return Math.atan2(normalized.y, horizontal)
}

/**
 * Calculate bank angle based on turn radius and speed
 * Uses aerodynamic formula: bank = atan(v²/(r*g))
 *
 * @param curvature Path curvature (1/radius)
 * @param speed Current speed
 * @param gravity Gravitational acceleration (default 9.81)
 * @returns Bank angle in radians
 */
export function calculateBankAngle(
  curvature: number,
  speed: number,
  gravity: number = 9.81
): number {
  if (curvature === 0 || speed === 0) return 0

  // Convert curvature to radius
  const radius = 1 / Math.max(curvature, 0.0001)

  // Bank angle: arctan(speed² / (radius * g))
  const bankRad = Math.atan((speed * speed) / (radius * gravity))

  // Limit bank angle to ±75 degrees
  const maxBank = (75 * Math.PI) / 180
  return Math.max(-maxBank, Math.min(maxBank, bankRad))
}

/**
 * Create quaternion from heading (yaw) and bank (roll) angles
 * @param heading Yaw angle in radians
 * @param bank Roll angle in radians
 * @param pitch Pitch angle in radians (default 0)
 * @returns Quaternion
 */
export function quaternionFromHeadingAndBank(
  heading: number,
  bank: number = 0,
  pitch: number = 0
): THREE.Quaternion {
  // Create Euler angles in XYZ order (roll, pitch, yaw)
  const euler = new THREE.Euler(bank, heading, pitch, 'YXZ')
  return new THREE.Quaternion().setFromEuler(euler)
}

/**
 * Create quaternion from Euler angles
 * @param roll Rotation around X axis (radians)
 * @param pitch Rotation around Y axis (radians)
 * @param yaw Rotation around Z axis (radians)
 * @param order Order of rotations (default 'XYZ')
 * @returns Quaternion
 */
export function quaternionFromEuler(
  roll: number,
  pitch: number,
  yaw: number,
  order: 'XYZ' | 'YXZ' | 'ZXY' = 'XYZ'
): THREE.Quaternion {
  const euler = new THREE.Euler(roll, pitch, yaw, order)
  return new THREE.Quaternion().setFromEuler(euler)
}

/**
 * Smoothly interpolate between two quaternions using SLERP
 * @param from Starting quaternion
 * @param to Target quaternion
 * @param t Interpolation factor (0 to 1)
 * @returns Interpolated quaternion
 */
export function slerpQuaternion(
  from: THREE.Quaternion,
  to: THREE.Quaternion,
  t: number
): THREE.Quaternion {
  const result = from.clone()
  return result.slerp(to, t)
}

/**
 * Calculate angular velocity needed to rotate from current to target orientation
 * @param current Current quaternion
 * @param target Target quaternion
 * @param deltaTime Time step in seconds
 * @returns Angular velocity as Vector3 (radians/second)
 */
export function calculateAngularVelocity(
  current: THREE.Quaternion,
  target: THREE.Quaternion,
  deltaTime: number
): THREE.Vector3 {
  // Get rotation from current to target
  const deltaQuat = target.clone().multiply(current.clone().invert())

  // Convert to axis-angle
  const axisAngle = new THREE.Vector4()
  axisAngle.setAxisAngleFromQuaternion(deltaQuat)

  // Extract axis and angle
  const axis = new THREE.Vector3(axisAngle.x, axisAngle.y, axisAngle.z).normalize()
  const angle = axisAngle.w

  // Angular velocity = angle / time
  const angularVelocity = axis.multiplyScalar((angle * 2) / deltaTime)

  return angularVelocity
}

/**
 * Convert quaternion to Euler angles
 * @param quaternion Input quaternion
 * @param order Rotation order (default 'XYZ')
 * @returns [roll, pitch, yaw] in radians
 */
export function getEulerFromQuaternion(
  quaternion: THREE.Quaternion,
  order: 'XYZ' | 'YXZ' | 'ZXY' = 'XYZ'
): [number, number, number] {
  const euler = new THREE.Euler().setFromQuaternion(quaternion, order)
  return [euler.x, euler.y, euler.z]
}

/**
 * Orientation controller for smooth rotations
 * Maintains current orientation and smoothly transitions to target
 */
export class OrientationController {
  private currentOrientation: THREE.Quaternion
  private targetOrientation: THREE.Quaternion
  private smoothingFactor: number // 0-1, where 1 = instant, 0 = very slow

  constructor(smoothingFactor: number = 0.1) {
    this.currentOrientation = new THREE.Quaternion()
    this.targetOrientation = new THREE.Quaternion()
    this.smoothingFactor = Math.max(0.01, Math.min(0.99, smoothingFactor))
  }

  /**
   * Set target orientation
   */
  setTarget(orientation: THREE.Quaternion | [number, number, number]): void {
    if (Array.isArray(orientation)) {
      this.targetOrientation = quaternionFromEuler(...orientation)
    } else {
      this.targetOrientation.copy(orientation)
    }
  }

  /**
   * Set target from velocity
   */
  setTargetFromVelocity(velocity: THREE.Vector3, curvature: number = 0): void {
    this.targetOrientation = orientationFromVelocity(velocity, curvature)
  }

  /**
   * Update and get current orientation
   * @param deltaTime Time since last update
   * @returns Current orientation
   */
  update(deltaTime: number): THREE.Quaternion {
    // Use SLERP for smooth interpolation
    const t = Math.min(this.smoothingFactor * (deltaTime * 60), 1) // Frame-rate independent
    this.currentOrientation.slerp(this.targetOrientation, t)
    return this.currentOrientation
  }

  /**
   * Get current orientation
   */
  getCurrent(): THREE.Quaternion {
    return this.currentOrientation.clone()
  }

  /**
   * Get target orientation
   */
  getTarget(): THREE.Quaternion {
    return this.targetOrientation.clone()
  }

  /**
   * Set smoothing factor
   */
  setSmoothing(factor: number): void {
    this.smoothingFactor = Math.max(0.01, Math.min(0.99, factor))
  }

  /**
   * Reset to identity orientation
   */
  reset(): void {
    this.currentOrientation.identity()
    this.targetOrientation.identity()
  }
}

/**
 * Calculate orientation for formation flying
 * @param leaderPosition Position of formation leader
 * @param memberPosition Position of formation member
 * @param offset Desired offset relative to leader
 * @returns Quaternion oriented toward leader with offset
 */
export function formationOrientation(
  leaderPosition: THREE.Vector3,
  memberPosition: THREE.Vector3,
  offset: THREE.Vector3
): THREE.Quaternion {
  // Vector from member to leader
  const toLeader = leaderPosition.clone().sub(memberPosition)

  // Apply offset rotation
  const offsetQuaternion = new THREE.Quaternion().setFromAxisAngle(
    new THREE.Vector3(0, 1, 0),
    Math.atan2(offset.x, offset.z)
  )

  return orientationFromVelocity(toLeader)
}

/**
 * Interpolate between multiple orientations with weights
 * Useful for blending multiple orientation influences
 * Uses SLERP for proper quaternion interpolation
 * @param orientations Array of quaternions
 * @param weights Array of blend weights (should sum to 1)
 * @returns Blended quaternion
 */
export function blendOrientations(
  orientations: THREE.Quaternion[],
  weights: number[]
): THREE.Quaternion {
  if (orientations.length === 0) return new THREE.Quaternion()
  if (orientations.length === 1) return orientations[0].clone()

  // Start with first orientation
  let result = orientations[0].clone()
  let cumulativeWeight = weights[0]

  // Blend in remaining orientations using SLERP
  for (let i = 1; i < orientations.length; i++) {
    // Normalize weights to blend between current result and next orientation
    const nextWeight = weights[i]
    const normalizedT = nextWeight / (cumulativeWeight + nextWeight)

    // Use SLERP to blend result with next orientation
    result.slerpQuaternions(result, orientations[i], normalizedT)

    cumulativeWeight += nextWeight
  }

  return result
}

/**
 * Get angular distance between two quaternions
 * Useful for checking if target orientation is reached
 * @param from Starting quaternion
 * @param to Target quaternion
 * @returns Angular distance in radians
 */
export function angularDistance(from: THREE.Quaternion, to: THREE.Quaternion): number {
  const deltaQuat = to.clone().multiply(from.clone().invert())
  return Math.acos(Math.max(-1, Math.min(1, deltaQuat.w))) * 2
}
