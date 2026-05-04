/**
 * CONFIGURATION VALIDATOR
 *
 * Validates AnimationPhysicsConfig for correctness and consistency.
 * Provides clear error messages for invalid parameters.
 *
 * Use this before applying any configuration changes to catch issues early.
 */

import type { AnimationPhysicsConfig } from './rapier-physics.config';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate entire configuration
 */
export function validateAnimationPhysicsConfig(
  config: AnimationPhysicsConfig
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Taxi phase validation
  validateTaxiPhase(config.taxi, errors, warnings);

  // Takeoff phase validation
  validateTakeoffPhase(config.takeoff, errors, warnings);

  // Physics transition validation
  validateToPhysicsTransition(config.toPhysicsTransition, errors, warnings);

  // Orbit validation
  validateOrbit(config.orbit, errors, warnings);

  // Avoidance validation
  validateAvoidance(config.avoidance, errors, warnings);

  // Landing transition validation
  validateToLandingTransition(config.toLandingTransition, errors, warnings);

  // Landing phase validation
  validateLandingPhase(config.landing, errors, warnings);

  // Global settings validation
  validateGlobal(config.global, errors, warnings);

  // Cross-phase consistency checks
  validateCrossPhaseConsistency(config, errors, warnings);

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

// ============ PHASE VALIDATORS ============

function validateTaxiPhase(
  taxi: AnimationPhysicsConfig['taxi'],
  errors: string[],
  warnings: string[]
): void {
  if (taxi.speed <= 0 || taxi.speed > 2.0) {
    errors.push('taxi.speed must be between 0 and 2.0 units/s');
  }

  if (taxi.acceleration <= 0 || taxi.acceleration > 20.0) {
    errors.push('taxi.acceleration must be between 0 and 20.0');
  }

  if (taxi.waypointThreshold <= 0 || taxi.waypointThreshold > 5.0) {
    errors.push('taxi.waypointThreshold must be between 0 and 5.0 units');
  }

  if (taxi.orientationBlendSpeed <= 0 || taxi.orientationBlendSpeed > 1.0) {
    errors.push('taxi.orientationBlendSpeed must be between 0 and 1.0');
  }
}

function validateTakeoffPhase(
  takeoff: AnimationPhysicsConfig['takeoff'],
  errors: string[],
  warnings: string[]
): void {
  if (takeoff.liftSpeed <= 0 || takeoff.liftSpeed > 1000.0) {
    errors.push('takeoff.liftSpeed must be between 0 and 1000.0 units/s');
  }

  if (takeoff.acceleration <= 0 || takeoff.acceleration > 500.0) {
    errors.push('takeoff.acceleration must be between 0 and 500.0 units/s²');
  }

  if (takeoff.maxHeight <= 0 || takeoff.maxHeight > 200.0) {
    errors.push('takeoff.maxHeight must be between 0 and 200.0 units');
  }

  if (takeoff.duration <= 0 || takeoff.duration > 10.0) {
    errors.push('takeoff.duration must be between 0 and 10.0 seconds');
  }

  if (takeoff.pitchAngle < -90 || takeoff.pitchAngle > 90) {
    errors.push('takeoff.pitchAngle must be between -90 and 90 degrees');
  }

  if (takeoff.speedMultiplier <= 0 || takeoff.speedMultiplier > 10.0) {
    errors.push('takeoff.speedMultiplier must be between 0 and 10.0');
  }
}

function validateToPhysicsTransition(
  transition: AnimationPhysicsConfig['toPhysicsTransition'],
  errors: string[],
  warnings: string[]
): void {
  if (transition.orbitPullStrength <= 0 || transition.orbitPullStrength > 500.0) {
    errors.push('toPhysicsTransition.orbitPullStrength must be between 0 and 500.0 units/s²');
  }

  if (transition.linearDamping < 0 || transition.linearDamping > 1.0) {
    errors.push('toPhysicsTransition.linearDamping must be between 0 and 1.0');
  }

  if (transition.angularDamping < 0 || transition.angularDamping > 1.0) {
    errors.push('toPhysicsTransition.angularDamping must be between 0 and 1.0');
  }

  if (transition.blendDuration <= 0 || transition.blendDuration > 5.0) {
    errors.push('toPhysicsTransition.blendDuration must be between 0 and 5.0 seconds');
  }

  if (transition.captureVelocityFrames < 1 || transition.captureVelocityFrames > 10) {
    errors.push('toPhysicsTransition.captureVelocityFrames must be between 1 and 10');
  }
}

function validateOrbit(
  orbit: AnimationPhysicsConfig['orbit'],
  errors: string[],
  warnings: string[]
): void {
  // Center position is array of 3 numbers
  if (!Array.isArray(orbit.center) || orbit.center.length !== 3) {
    errors.push('orbit.center must be a [number, number, number] array');
  } else {
    if (Math.abs(orbit.center[0]) > 1000 || Math.abs(orbit.center[1]) > 500 || Math.abs(orbit.center[2]) > 1000) {
      warnings.push('orbit.center is far from origin - verify intentional');
    }
  }

  if (orbit.radius <= 0 || orbit.radius > 100.0) {
    errors.push('orbit.radius must be between 0 and 100.0 units');
  }

  if (orbit.targetSpeed <= 0 || orbit.targetSpeed > 5.0) {
    errors.push('orbit.targetSpeed must be between 0 and 5.0 units/s');
  }

  if (orbit.stiffness <= 0 || orbit.stiffness > 200.0) {
    errors.push('orbit.stiffness must be between 0 and 200.0');
  }

  if (orbit.tangentialAccel <= 0 || orbit.tangentialAccel > 100.0) {
    errors.push('orbit.tangentialAccel must be between 0 and 100.0 units/s²');
  }

  if (orbit.altitudeVariation < 0 || orbit.altitudeVariation > 50.0) {
    errors.push('orbit.altitudeVariation must be between 0 and 50.0 units');
  }
}

function validateAvoidance(
  avoidance: AnimationPhysicsConfig['avoidance'],
  errors: string[],
  warnings: string[]
): void {
  if (avoidance.detectionRadius <= 0 || avoidance.detectionRadius > 50.0) {
    errors.push('avoidance.detectionRadius must be between 0 and 50.0 units');
  }

  if (avoidance.repulsionStrength <= 0 || avoidance.repulsionStrength > 500.0) {
    errors.push('avoidance.repulsionStrength must be between 0 and 500.0 units/s²');
  }

  if (avoidance.predictionTime <= 0 || avoidance.predictionTime > 10.0) {
    errors.push('avoidance.predictionTime must be between 0 and 10.0 seconds');
  }
}

function validateToLandingTransition(
  transition: AnimationPhysicsConfig['toLandingTransition'],
  errors: string[],
  warnings: string[]
): void {
  if (transition.dampingDuration <= 0 || transition.dampingDuration > 5.0) {
    errors.push('toLandingTransition.dampingDuration must be between 0 and 5.0 seconds');
  }

  if (transition.orbitLinearDamping <= 0 || transition.orbitLinearDamping > 1.0) {
    errors.push('toLandingTransition.orbitLinearDamping must be between 0 and 1.0');
  }

  if (transition.landingLinearDamping <= 0 || transition.landingLinearDamping > 10.0) {
    errors.push('toLandingTransition.landingLinearDamping must be between 0 and 10.0');
  }

  // Landing damping should be higher than orbit damping
  if (transition.landingLinearDamping <= transition.orbitLinearDamping) {
    errors.push(
      'toLandingTransition.landingLinearDamping must be greater than orbitLinearDamping ' +
        '(landing needs higher damping for controlled descent)'
    );
  }

  if (transition.landingPullStrength <= 0 || transition.landingPullStrength > 300.0) {
    errors.push('toLandingTransition.landingPullStrength must be between 0 and 300.0 units/s²');
  }

  if (transition.velocityDecayDuration <= 0 || transition.velocityDecayDuration > 5.0) {
    errors.push('toLandingTransition.velocityDecayDuration must be between 0 and 5.0 seconds');
  }

  if (transition.rotationBlendSpeed <= 0 || transition.rotationBlendSpeed > 1.0) {
    errors.push('toLandingTransition.rotationBlendSpeed must be between 0 and 1.0');
  }
}

function validateLandingPhase(
  landing: AnimationPhysicsConfig['landing'],
  errors: string[],
  warnings: string[]
): void {
  if (landing.approachSpeed < 0 || landing.approachSpeed > 2.0) {
    errors.push('landing.approachSpeed must be between 0 and 2.0 units/s');
  }

  if (landing.descentRate <= 0 || landing.descentRate > 10.0) {
    errors.push('landing.descentRate must be between 0 and 10.0 units/s');
  }

  if (landing.touchdownThreshold <= 0 || landing.touchdownThreshold > 2.0) {
    errors.push('landing.touchdownThreshold must be between 0 and 2.0 units');
  }

  if (!Array.isArray(landing.finalOrientation) || landing.finalOrientation.length !== 3) {
    errors.push('landing.finalOrientation must be a [number, number, number] array');
  }
}

function validateGlobal(
  global: AnimationPhysicsConfig['global'],
  errors: string[],
  warnings: string[]
): void {
  if (global.gravityScale !== 0 && global.gravityScale !== 1) {
    errors.push('global.gravityScale must be 0 (disabled) or 1 (enabled)');
  }

  if (global.timeScale <= 0 || global.timeScale > 5.0) {
    errors.push('global.timeScale must be between 0 and 5.0');
  }

  if (global.timeScale < 0.5 || global.timeScale > 2.0) {
    warnings.push('global.timeScale outside typical range (0.5-2.0) - verify intentional');
  }
}

// ============ CROSS-PHASE CONSISTENCY ============

function validateCrossPhaseConsistency(
  config: AnimationPhysicsConfig,
  errors: string[],
  warnings: string[]
): void {
  // Takeoff max height should be below orbit center altitude
  if (config.takeoff.maxHeight >= config.orbit.center[1]) {
    warnings.push(
      'takeoff.maxHeight should be less than orbit center Y position ' +
        `(takeoff: ${config.takeoff.maxHeight}, orbit: ${config.orbit.center[1]})`
    );
  }

  // Orbit radius should be reasonable relative to takeoff spread
  if (config.orbit.radius < 5.0) {
    warnings.push('orbit.radius is very small (<5 units) - may cause crowding');
  }

  if (config.orbit.radius > 100.0) {
    warnings.push('orbit.radius is very large (>100 units) - may separate fleet');
  }

  // Avoidance radius should be less than orbit radius
  if (config.avoidance.detectionRadius >= config.orbit.radius) {
    warnings.push(
      'avoidance.detectionRadius should be less than orbit.radius ' +
        '(detection too large for orbit size)'
    );
  }

  // Transition blend duration should be reasonable
  const totalTransitionTime = config.toPhysicsTransition.blendDuration +
                              config.toLandingTransition.dampingDuration;
  if (totalTransitionTime > 3.0) {
    warnings.push(
      `Total transition time (${totalTransitionTime.toFixed(2)}s) is long ` +
        '- consider reducing blend durations'
    );
  }

  // Takeoff duration should be less than expected flight cycle
  if (config.takeoff.duration > 5.0) {
    warnings.push('takeoff.duration > 5 seconds - may shorten flight cycle');
  }
}

/**
 * Log validation result with helpful formatting
 */
export function logValidationResult(result: ValidationResult): void {
  if (result.valid) {
    console.log('✓ Configuration is valid');
  } else {
    console.error('✗ Configuration has errors:');
    result.errors.forEach((err) => console.error(`  - ${err}`));
  }

  if (result.warnings.length > 0) {
    console.warn('⚠ Configuration warnings:');
    result.warnings.forEach((warn) => console.warn(`  - ${warn}`));
  }
}
