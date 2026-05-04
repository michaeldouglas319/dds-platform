/**
 * AerodynamicModel.ts - Hybrid aerodynamic calculations for wind tunnel particles
 *
 * Combines multiple aerodynamic effects:
 * 1. Base flow (uniform incoming flow)
 * 2. Potential flow (inviscid deflection around obstacle)
 * 3. Boundary layer drag (viscous effects near surface)
 * 4. Separation wake (behind obstacle)
 * 5. Drag coefficient (distance-weighted damping)
 */

import * as THREE from 'three';

export interface AerodynamicParameters {
  dragCoefficient: number;           // 0-2.0, default 0.5
  boundaryLayerThickness: number;    // 1-10 units, default 5
  separationZoneSize: number;        // 0-20 units, default 10
  reynoldsNumber?: number;           // Optional for advanced modeling
}

export class AerodynamicModel {
  /**
   * Calculate total velocity at a point considering all aerodynamic effects
   *
   * Formula:
   * V_total = V_base + V_potential + V_drag + V_separation
   *
   * @param pos - Position in world space
   * @param baseVelocity - Incoming uniform flow velocity
   * @param potentialVelocity - Deflection from inviscid flow around obstacle
   * @param sdf - Signed distance function to nearest obstacle surface
   * @param params - Aerodynamic parameters (drag, boundary layer, separation)
   * @returns Total velocity at this position
   */
  static calculateTotalVelocity(
    pos: THREE.Vector3,
    baseVelocity: THREE.Vector3,
    potentialVelocity: THREE.Vector3,
    sdf: (p: THREE.Vector3) => number,
    params: AerodynamicParameters
  ): THREE.Vector3 {
    // Get signed distance to nearest obstacle surface
    // Positive = outside obstacle, Negative = inside obstacle
    const distance = sdf(pos);

    // Inside obstacle: zero velocity (collision)
    if (distance < 0) {
      return new THREE.Vector3(0, 0, 0);
    }

    // Start with base incoming flow
    let totalVel = baseVelocity.clone();

    // Far field: add potential flow (inviscid deflection)
    if (distance > params.boundaryLayerThickness) {
      totalVel.add(potentialVelocity);
    } else {
      // Boundary layer transition: smoothly reduce potential flow effect
      const boundaryFactor = distance / params.boundaryLayerThickness;
      totalVel.add(potentialVelocity.clone().multiplyScalar(boundaryFactor));
    }

    // Boundary layer: apply viscous drag near surface
    if (distance < params.boundaryLayerThickness && distance > 0) {
      const dragFactor = this.getDragFactor(distance, params.boundaryLayerThickness);
      const dragForce = this.calculateBoundaryLayerDrag(
        totalVel,
        dragFactor,
        params.dragCoefficient
      );
      totalVel.add(dragForce);
    }

    // Wake: apply separation effects behind obstacle
    const wakeEffect = this.calculateSeparationWake(
      pos,
      totalVel,
      distance,
      params.separationZoneSize
    );
    totalVel.add(wakeEffect);

    return totalVel;
  }

  /**
   * Calculate drag force in boundary layer
   * Approximates viscous drag: F_drag = -0.5 * ρ * v² * C_d * A / m
   * Simplified as: velocity reduction proportional to drag factor
   */
  static calculateBoundaryLayerDrag(
    velocity: THREE.Vector3,
    dragFactor: number,
    dragCoefficient: number
  ): THREE.Vector3 {
    // Drag force opposes velocity
    // Magnitude increases with velocity squared (quadratic drag)
    const speed = velocity.length();
    const dragMagnitude = dragCoefficient * dragFactor * speed * speed * 0.1; // 0.1 scaling factor

    if (speed < 0.01) return new THREE.Vector3(0, 0, 0);

    // Return drag force (opposite to velocity direction)
    return velocity
      .clone()
      .normalize()
      .multiplyScalar(-dragMagnitude);
  }

  /**
   * Calculate separation wake effects
   * Simulates turbulent wake behind obstacle using distance-based damping
   */
  static calculateSeparationWake(
    pos: THREE.Vector3,
    velocity: THREE.Vector3,
    distanceToSurface: number,
    separationZoneSize: number
  ): THREE.Vector3 {
    // Wake only exists behind obstacle (positive X in flow direction)
    // For now, return zero - can be enhanced with vortex pair modeling

    // Check if position is in potential wake zone
    const inWakeZone = pos.x > 0 && Math.abs(pos.y) < separationZoneSize * 0.5 && Math.abs(pos.z) < separationZoneSize * 0.5;

    if (!inWakeZone) {
      return new THREE.Vector3(0, 0, 0);
    }

    // Apply small damping to wake region (turbulence effect)
    const wakeDamping = 0.1 * Math.max(0, 1 - (distanceToSurface / separationZoneSize));
    return velocity.clone().multiplyScalar(-wakeDamping);
  }

  /**
   * Get drag factor: 1 at surface, 0 at boundary layer edge
   * Uses smoothstep function for smooth transition
   */
  static getDragFactor(
    distance: number,
    boundaryLayerThickness: number
  ): number {
    if (distance <= 0) return 1.0;
    if (distance >= boundaryLayerThickness) return 0.0;

    // Smoothstep: smooth interpolation from 1 to 0
    const t = distance / boundaryLayerThickness;
    return 1.0 - (3.0 * t * t - 2.0 * t * t * t); // Smooth Hermite interpolation
  }

  /**
   * Get local drag coefficient based on distance to obstacle
   * Returns scalar multiplier for overall drag in this region
   */
  static getLocalDragCoefficient(
    distance: number,
    boundaryLayerThickness: number,
    baseDragCoefficient: number
  ): number {
    if (distance < 0) return baseDragCoefficient * 2.0; // Collision zone
    if (distance > boundaryLayerThickness) return 0.0; // Far field

    // Linear interpolation in boundary layer
    const factor = 1.0 - (distance / boundaryLayerThickness);
    return baseDragCoefficient * factor;
  }

  /**
   * Calculate pressure coefficient at a point
   * C_p = (p - p_static) / (0.5 * ρ * v_ref²)
   * Approximated from velocity field
   */
  static getPressureCoefficient(
    velocityMagnitude: number,
    referenceVelocity: number
  ): number {
    if (referenceVelocity < 0.01) return 0;

    // Bernoulli equation: C_p = 1 - (v/v_ref)²
    const velocityRatio = velocityMagnitude / referenceVelocity;
    return 1.0 - (velocityRatio * velocityRatio);
  }

  /**
   * Calculate effective viscosity for eddy viscosity model
   * Useful for enhanced turbulence modeling
   */
  static getEddyViscosity(
    distanceToWall: number,
    velocityGradient: number,
    turbulenceIntensity: number = 0.05
  ): number {
    // Prandtl mixing length model: ν_t = (κ * y)² * |du/dy|
    // κ = 0.41 (von Karman constant)
    const kappa = 0.41;
    const mixingLength = kappa * distanceToWall;
    return (mixingLength * mixingLength * velocityGradient) * turbulenceIntensity;
  }

  /**
   * Apply Reynolds number effects
   * Higher Re = lower drag, turbulent flow
   * Lower Re = higher drag, laminar flow
   */
  static applyReynoldsNumberEffect(
    dragCoefficient: number,
    reynoldsNumber: number
  ): number {
    // Drag coefficient varies with Reynolds number
    // Simplified model: C_d increases at low Re (laminar)

    if (reynoldsNumber < 0.1) return dragCoefficient * 100; // Stokes flow
    if (reynoldsNumber < 1000) {
      // Transition: interpolate from laminar to turbulent
      const factor = Math.log10(reynoldsNumber) / 3; // 0 at Re=1, 1 at Re=1000
      return dragCoefficient * (100 * (1 - factor) + factor);
    }

    // Turbulent flow: C_d roughly constant (~0.47 for sphere)
    return dragCoefficient;
  }
}
