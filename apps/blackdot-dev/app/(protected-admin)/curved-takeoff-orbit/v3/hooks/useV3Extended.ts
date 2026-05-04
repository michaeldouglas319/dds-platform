/**
 * Extended Particle System - Core Logic
 * Handles taxi, assembly, health for particles
 */

import { useRef } from 'react';
import * as THREE from 'three';
import type {
  ExtendedParticle,
  ExtendedPhase,
  StagingZone,
  TaxiPath,
  AssemblyState,
  HealthState,
  DamageSource,
} from '../types/extended';

// ============================================================================
// CORE STATE MACHINE
// ============================================================================

/**
 * CRITICAL: Phase transition rules
 * ONLY these transitions are valid
 */
const VALID_TRANSITIONS: Record<ExtendedPhase, ExtendedPhase[]> = {
  'spawn': ['taxi-to-staging'],
  'taxi-to-staging': ['staging'],
  'staging': ['taxi-to-runway'],
  'taxi-to-runway': ['runway'],
  'runway': ['takeoff'],
  'takeoff': ['orbit'],
  'orbit': ['pre-landing'],
  'pre-landing': ['landing'],
  'landing': ['taxi-to-destination'],
  'taxi-to-destination': ['parked'],
  'parked': ['spawn'], // Loop back for respawn
};

export function canTransition(from: ExtendedPhase, to: ExtendedPhase): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

export function transitionParticle(
  particle: ExtendedParticle,
  newPhase: ExtendedPhase,
  timestamp: number
): void {
  if (!canTransition(particle.phase, newPhase)) {
    console.warn(`Invalid transition: ${particle.phase} → ${newPhase}`);
    return;
  }

  // Record phase history
  const lastPhaseEntry = particle.stats.phaseHistory[particle.stats.phaseHistory.length - 1];
  if (lastPhaseEntry && !lastPhaseEntry.duration) {
    lastPhaseEntry.duration = timestamp - lastPhaseEntry.enteredAt;
  }

  particle.stats.phaseHistory.push({
    phase: newPhase,
    enteredAt: timestamp,
    duration: 0,
  });

  particle.phase = newPhase;
}

// ============================================================================
// TAXI SYSTEM - CORE LOGIC
// ============================================================================

/**
 * Generate taxi path between two points
 */
export function createTaxiPath(
  start: THREE.Vector3,
  end: THREE.Vector3,
  groundSpeed: number,
  smoothness: number = 0.5
): TaxiPath {
  // Create midpoint with slight variation for natural feel
  const mid = new THREE.Vector3().lerpVectors(start, end, 0.5);
  mid.y = 0; // Keep on ground
  mid.x += (Math.random() - 0.5) * 2; // ±1 unit variation
  mid.z += (Math.random() - 0.5) * 2;

  const waypoints = [start, mid, end];
  const curve = new THREE.CatmullRomCurve3(waypoints, false, 'catmullrom', smoothness);

  return { waypoints, curve, speed: groundSpeed };
}

/**
 * Update particle along taxi path
 */
export function updateTaxiMovement(
  particle: ExtendedParticle,
  delta: number
): boolean {
  if (!particle.taxiPath) return false;

  const { curve, speed } = particle.taxiPath;
  const distance = speed * delta;
  const curveLength = curve.getLength();
  const progressDelta = distance / curveLength;

  particle.taxiProgress = Math.min(1, particle.taxiProgress + progressDelta);
  particle.position.copy(curve.getPoint(particle.taxiProgress));
  particle.position.y = 0; // Enforce ground level

  // Update velocity for orientation
  if (particle.taxiProgress < 1) {
    const tangent = curve.getTangent(particle.taxiProgress);
    particle.velocity.copy(tangent.multiplyScalar(speed));
  }

  return particle.taxiProgress >= 1; // Return true when complete
}

/**
 * Assign particle to staging zone queue
 */
export function assignToStagingZone(
  particle: ExtendedParticle,
  zones: StagingZone[],
  timestamp: number
): StagingZone | null {
  // Find zone with capacity
  const availableZone = zones.find(z => z.occupancy < z.capacity);
  if (!availableZone) return null;

  // Add to queue
  availableZone.queue.push(particle.id);
  availableZone.occupancy++;

  particle.stagingZoneId = availableZone.id;
  particle.stagingWaitStart = timestamp;
  particle.queuePosition = availableZone.queue.length - 1;

  return availableZone;
}

/**
 * Release particle from staging zone (decrease occupancy, remove from queue)
 */
export function releaseFromStagingZone(
  particle: ExtendedParticle,
  zones: StagingZone[]
): void {
  if (!particle.stagingZoneId) return;

  const zone = zones.find(z => z.id === particle.stagingZoneId);
  if (!zone) return;

  // Remove from queue
  const queueIndex = zone.queue.indexOf(particle.id);
  if (queueIndex !== -1) {
    zone.queue.splice(queueIndex, 1);
    zone.occupancy = Math.max(0, zone.occupancy - 1);
  }

  // Clear particle's staging data
  particle.stagingZoneId = undefined;
  particle.stagingWaitStart = undefined;
  particle.queuePosition = undefined;
}

// ============================================================================
// ASSEMBLY SYSTEM - CORE LOGIC
// ============================================================================

/**
 * Initialize assembly state for new particle
 */
export function initAssembly(maxSteps: number, mode: AssemblyState['advancementMode']): AssemblyState {
  return {
    currentStep: 0,
    maxSteps,
    stepProgress: 0,
    advancementMode: mode,
    timePerStep: 5.0, // Default 5 seconds per step
    lastStepAdvance: Date.now(),
  };
}

/**
 * CRITICAL: Step advancement logic
 */
export function updateAssemblyStep(
  particle: ExtendedParticle,
  delta: number,
  orbitsCompleted: number
): boolean {
  const assembly = particle.assembly;
  if (assembly.currentStep >= assembly.maxSteps) return false;

  let shouldAdvance = false;

  switch (assembly.advancementMode) {
    case 'time':
      assembly.stepProgress += delta / assembly.timePerStep;
      if (assembly.stepProgress >= 1) {
        shouldAdvance = true;
        assembly.stepProgress = 0;
      }
      break;

    case 'orbit':
      // Advance every N orbits (stored in timePerStep field as orbitsPerStep)
      const targetOrbits = Math.floor(assembly.currentStep * assembly.timePerStep);
      if (orbitsCompleted >= targetOrbits + assembly.timePerStep) {
        shouldAdvance = true;
      }
      break;

    case 'location':
      // Check if particle is in assembly station (implement in caller)
      break;

    case 'manual':
      // Controlled externally
      break;
  }

  if (shouldAdvance) {
    assembly.currentStep++;
    assembly.lastStepAdvance = Date.now();
    particle.stats.stepsCompleted++;

    if (assembly.currentStep >= assembly.maxSteps) {
      particle.stats.assemblyEndTime = Date.now();
    }

    return true; // Step advanced
  }

  return false;
}

/**
 * Calculate visual properties based on assembly step
 */
export function calculateAssemblyVisuals(
  assembly: AssemblyState,
  config: { colorStart: THREE.Color; colorEnd: THREE.Color; scaleStart: number; scaleEnd: number; glowIntensity: number }
): { color: THREE.Color; scale: number; emissive: number } {
  const progress = assembly.currentStep / assembly.maxSteps;

  const color = new THREE.Color().lerpColors(config.colorStart, config.colorEnd, progress);
  const scale = THREE.MathUtils.lerp(config.scaleStart, config.scaleEnd, progress);
  const emissive = progress * config.glowIntensity;

  return { color, scale, emissive };
}

// ============================================================================
// HEALTH SYSTEM - CORE LOGIC
// ============================================================================

/**
 * Initialize health state
 */
export function initHealth(startingHealth: number = 100): HealthState {
  return {
    current: startingHealth,
    max: startingHealth,
    damageRate: 0.5,     // Default decay
    regenRate: 0,
    isDamaged: false,
    isCritical: false,
    isDead: false,
    lastDamage: 0,
  };
}

/**
 * CRITICAL: Apply damage to particle
 */
export function applyDamage(
  particle: ExtendedParticle,
  amount: number,
  source: DamageSource['type'],
  timestamp: number,
  position?: THREE.Vector3
): void {
  particle.health.current = Math.max(0, particle.health.current - amount);
  particle.health.lastDamage = timestamp;

  particle.health.isDamaged = particle.health.current < particle.health.max * 0.5;
  particle.health.isCritical = particle.health.current < particle.health.max * 0.25;
  particle.health.isDead = particle.health.current <= 0;

  particle.stats.totalDamage += amount;
  particle.damageHistory.push({
    type: source,
    amount,
    timestamp,
    position: position?.clone(),
  });

  // Keep last 50 damage events only
  if (particle.damageHistory.length > 50) {
    particle.damageHistory.shift();
  }
}

/**
 * Apply healing to particle
 */
export function applyHealing(
  particle: ExtendedParticle,
  amount: number
): void {
  const oldHealth = particle.health.current;
  particle.health.current = Math.min(particle.health.max, particle.health.current + amount);

  const actualHealing = particle.health.current - oldHealth;
  particle.stats.totalHealing += actualHealing;

  // Update flags
  particle.health.isDamaged = particle.health.current < particle.health.max * 0.5;
  particle.health.isCritical = particle.health.current < particle.health.max * 0.25;
  particle.health.isDead = false;
}

/**
 * Update health over time (decay/regen)
 */
export function updateHealth(
  particle: ExtendedParticle,
  delta: number,
  isInRegenZone: boolean,
  timestamp: number
): void {
  if (particle.health.isDead) return;

  // Apply decay or regen
  if (isInRegenZone && particle.health.regenRate > 0) {
    applyHealing(particle, particle.health.regenRate * delta);
  } else if (particle.health.damageRate > 0) {
    applyDamage(particle, particle.health.damageRate * delta, 'decay', timestamp);
  }
}

/**
 * Calculate health-based color
 */
export function getHealthColor(healthPercent: number): THREE.Color {
  if (healthPercent > 0.5) {
    // Green to yellow (100% → 50%)
    const t = (healthPercent - 0.5) * 2; // 0-1
    return new THREE.Color().lerpColors(
      new THREE.Color(0xffff00), // Yellow
      new THREE.Color(0x00ff00), // Green
      t
    );
  } else {
    // Red to yellow (0% → 50%)
    const t = healthPercent * 2; // 0-1
    return new THREE.Color().lerpColors(
      new THREE.Color(0xff0000), // Red
      new THREE.Color(0xffff00), // Yellow
      t
    );
  }
}

// ============================================================================
// STATS UPDATES
// ============================================================================

/**
 * Update particle stats (call every frame)
 */
export function updateStats(
  particle: ExtendedParticle,
  delta: number,
  timestamp: number
): void {
  particle.stats.totalAge = (timestamp - particle.stats.spawnTime) / 1000;

  // Update distance
  const distance = particle.velocity.length() * delta;
  particle.stats.totalDistance += distance;

  // Update speed stats
  const currentSpeed = particle.velocity.length();
  particle.stats.maxSpeed = Math.max(particle.stats.maxSpeed, currentSpeed);

  // Running average speed (exponential moving average)
  const alpha = 0.1;
  particle.stats.avgSpeed = particle.stats.avgSpeed * (1 - alpha) + currentSpeed * alpha;
}
