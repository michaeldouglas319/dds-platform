import * as THREE from 'three';

/**
 * Orientation utilities for particle movement and path following
 */

export interface Orientation {
  rotation: THREE.Euler;
  quaternion: THREE.Quaternion;
  forward: THREE.Vector3;
  up: THREE.Vector3;
  right: THREE.Vector3;
}

/**
 * Calculate orientation from direction vector (look-at)
 */
export function orientationFromDirection(
  direction: THREE.Vector3,
  up: THREE.Vector3 = new THREE.Vector3(0, 1, 0)
): Orientation {
  const forward = direction.clone().normalize();
  const right = forward.clone().cross(up).normalize();
  const correctedUp = right.clone().cross(forward).normalize();

  const quaternion = new THREE.Quaternion();
  quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), forward);
  
  // Adjust for up vector
  const upQuat = new THREE.Quaternion();
  upQuat.setFromUnitVectors(
    new THREE.Vector3(0, 1, 0).applyQuaternion(quaternion),
    correctedUp
  );
  quaternion.multiply(upQuat);

  const rotation = new THREE.Euler();
  rotation.setFromQuaternion(quaternion);

  return {
    rotation,
    quaternion,
    forward,
    up: correctedUp,
    right,
  };
}

/**
 * Calculate orientation from two points (look from A to B)
 */
export function orientationFromPoints(
  from: THREE.Vector3,
  to: THREE.Vector3,
  up: THREE.Vector3 = new THREE.Vector3(0, 1, 0)
): Orientation {
  const direction = to.clone().sub(from).normalize();
  return orientationFromDirection(direction, up);
}

/**
 * Smoothly interpolate between two orientations
 */
export function lerpOrientation(
  start: Orientation,
  end: Orientation,
  t: number
): Orientation {
  const quaternion = new THREE.Quaternion();
  quaternion.slerpQuaternions(start.quaternion, end.quaternion, t);

  const rotation = new THREE.Euler();
  rotation.setFromQuaternion(quaternion);

  const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(quaternion);
  const up = new THREE.Vector3(0, 1, 0).applyQuaternion(quaternion);
  const right = forward.clone().cross(up).normalize();

  return {
    rotation,
    quaternion,
    forward,
    up,
    right,
  };
}

/**
 * Calculate orientation for path following (look ahead)
 */
export function orientationForPathFollowing(
  currentPos: THREE.Vector3,
  targetPos: THREE.Vector3,
  lookAheadDistance: number = 5.0,
  up: THREE.Vector3 = new THREE.Vector3(0, 1, 0)
): Orientation {
  // Look ahead along path
  const direction = targetPos.clone().sub(currentPos);
  const distance = direction.length();
  
  // If close to target, use direction as-is
  // Otherwise, look ahead by lookAheadDistance
  if (distance > lookAheadDistance) {
    direction.normalize().multiplyScalar(lookAheadDistance);
    const lookAheadPos = currentPos.clone().add(direction);
    return orientationFromPoints(currentPos, lookAheadPos, up);
  }
  
  return orientationFromPoints(currentPos, targetPos, up);
}

/**
 * Apply orientation to an Object3D
 */
export function applyOrientation(
  object: THREE.Object3D,
  orientation: Orientation
): void {
  object.quaternion.copy(orientation.quaternion);
  object.rotation.copy(orientation.rotation);
}

/**
 * Calculate bank angle for turning (roll based on turn rate)
 */
export function calculateBankAngle(
  currentDirection: THREE.Vector3,
  targetDirection: THREE.Vector3,
  maxBankAngle: number = Math.PI / 6 // 30 degrees
): number {
  const turnAngle = currentDirection.angleTo(targetDirection);
  const normalizedTurn = Math.min(turnAngle / Math.PI, 1.0); // Normalize to 0-1
  return normalizedTurn * maxBankAngle;
}

/**
 * Create orientation with bank angle (for aircraft-like movement)
 */
export function orientationWithBank(
  direction: THREE.Vector3,
  bankAngle: number,
  up: THREE.Vector3 = new THREE.Vector3(0, 1, 0)
): Orientation {
  const baseOrientation = orientationFromDirection(direction, up);
  
  // Apply bank (roll) rotation
  const bankQuaternion = new THREE.Quaternion();
  bankQuaternion.setFromAxisAngle(direction.normalize(), bankAngle);
  
  const finalQuaternion = baseOrientation.quaternion.clone();
  finalQuaternion.multiply(bankQuaternion);
  
  const rotation = new THREE.Euler();
  rotation.setFromQuaternion(finalQuaternion);
  
  const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(finalQuaternion);
  const finalUp = new THREE.Vector3(0, 1, 0).applyQuaternion(finalQuaternion);
  const right = forward.clone().cross(finalUp).normalize();
  
  return {
    rotation,
    quaternion: finalQuaternion,
    forward,
    up: finalUp,
    right,
  };
}
