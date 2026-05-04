/**
 * Physics utility types and constants for character controller
 */

/**
 * Animation state representing character movement and action
 */
export enum AnimationState {
  Idle = 'idle',
  Walking = 'walking',
  Running = 'running',
  Jumping = 'jumping',
  Falling = 'falling',
  Landing = 'landing',
}

/**
 * Physics debug information for diagnostics
 */
export interface PhysicsDebugInfo {
  isGrounded: boolean
  velocity: { x: number; y: number; z: number }
  position: { x: number; y: number; z: number }
  rayHitDistance: number | null
  animationState: AnimationState
  moveInput: { x: number; z: number }
}

/**
 * Character physics configuration
 */
export interface CharacterPhysicsConfig {
  gravity: number
  bounce: number
  maxSpeed: number
  acceleration: number
  jumpForce: number
  raycastLength: number // Distance to detect ground
  raycastOffset: number // Vertical offset from capsule center
  velocityThreshold: number // Threshold for walk vs run
  jumpCooldown: number // Seconds between jumps
  landingFrames: number // Frames to show landing animation
}

/**
 * Default physics configuration with sensible values
 */
export const DEFAULT_PHYSICS_CONFIG: CharacterPhysicsConfig = {
  gravity: 9.81,
  bounce: 0.3,
  maxSpeed: 10,
  acceleration: 15,
  jumpForce: 7.5,
  raycastLength: 1.5,
  raycastOffset: 0.9, // Match capsule half-height
  velocityThreshold: 0.5,
  jumpCooldown: 0.3,
  landingFrames: 5,
}

/**
 * Get animation state based on velocity and grounding
 */
export function getAnimationState(
  velocity: { x: number; y: number; z: number },
  isGrounded: boolean,
  moveInput: { x: number; z: number },
  maxSpeed: number,
  velocityThreshold: number,
  wasJumping: boolean,
  landingCounter: number
): AnimationState {
  // Landing animation takes priority
  if (landingCounter > 0) {
    return AnimationState.Landing
  }

  // Falling when not grounded and moving downward
  if (!isGrounded && velocity.y < -0.1) {
    return AnimationState.Falling
  }

  // Jumping when moving upward
  if (!isGrounded && velocity.y > 0.1) {
    return AnimationState.Jumping
  }

  // Not moving
  const moveSpeed = Math.sqrt(moveInput.x ** 2 + moveInput.z ** 2)
  if (moveSpeed < velocityThreshold) {
    return AnimationState.Idle
  }

  // Determine if running or walking based on speed
  const currentSpeed = Math.sqrt(velocity.x ** 2 + velocity.z ** 2)
  return currentSpeed > maxSpeed * 0.7 ? AnimationState.Running : AnimationState.Walking
}

/**
 * Verify jump is valid (grounded, cooldown elapsed, not already jumping)
 */
export function isJumpValid(
  isGrounded: boolean,
  jumpCooldown: number,
  jumpCooldownMax: number,
  minCooldownThreshold: number = 0.01 // Small epsilon for floating point
): boolean {
  return isGrounded && jumpCooldown <= minCooldownThreshold
}

/**
 * Calculate smooth acceleration with lerp
 */
export function smoothAccelerate(
  current: number,
  target: number,
  acceleration: number,
  delta: number
): number {
  const t = Math.min(1, acceleration * delta)
  return current + (target - current) * t
}

/**
 * Normalize velocity to prevent diagonal speed boost
 */
export function normalizeMovement(x: number, z: number): { x: number; z: number } {
  const length = Math.sqrt(x * x + z * z)
  if (length === 0) return { x: 0, z: 0 }
  return { x: x / length, z: z / length }
}

/**
 * Debug info for console logging
 */
export function formatPhysicsDebugInfo(info: PhysicsDebugInfo): string {
  return `
╔════ Physics Debug ════╗
║ Grounded: ${info.isGrounded ? '✓' : '✗'}
║ State: ${info.animationState}
║ Velocity: [${info.velocity.x.toFixed(2)}, ${info.velocity.y.toFixed(2)}, ${info.velocity.z.toFixed(2)}]
║ Position: [${info.position.x.toFixed(2)}, ${info.position.y.toFixed(2)}, ${info.position.z.toFixed(2)}]
║ Ray Hit: ${info.rayHitDistance ? info.rayHitDistance.toFixed(3) : 'none'}
║ Move Input: [${info.moveInput.x.toFixed(2)}, ${info.moveInput.z.toFixed(2)}]
╚═══════════════════════╝
  `.trim()
}
