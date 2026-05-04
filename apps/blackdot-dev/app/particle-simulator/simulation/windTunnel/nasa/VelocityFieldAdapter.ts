/**
 * Velocity Field Adapter
 * 
 * Converts NASA force calculations into velocity field for particle simulation
 * 
 * Physics:
 * - Circulation from lift: Γ = C_L × V × c / 2
 * - Induced velocity from circulation: v_θ = Γ / (2πr)
 * - Wake deficit from drag: Velocity reduction downstream
 */

import { Vector3 } from 'three';
import { NASACalculationResults, AirfoilGeometry } from './NASATypes';

/**
 * Simple velocity field interface for particle simulation
 */
export interface VelocityField {
  getVelocity(position: Vector3): Vector3;
  setNASAMetadata?(results: NASACalculationResults): void;
}

export class VelocityFieldAdapter {
  /**
   * Create velocity field from NASA aerodynamic results
   * 
   * This creates a simplified velocity field that:
   * 1. Provides base uniform flow
   * 2. Adds circulation-induced velocity (bound vortex model)
   * 3. Adds wake deficit from drag
   */
  static createNASAField(
    results: NASACalculationResults,
    geometry: AirfoilGeometry
  ): VelocityField {
    // Calculate circulation from lift coefficient
    const circulation =
      (results.forces.liftCoefficient *
        results.parameters.velocity *
        results.parameters.chord) /
      2;

    return {
      getVelocity: (pos: Vector3) => {
        // 1. Base uniform flow
        const baseFlow = new Vector3(results.parameters.velocity, 0, 0);

        // 2. Circulation-induced velocity (bound vortex model)
        const induced = this.calculateCirculationVelocity(
          pos,
          geometry.center,
          circulation,
          geometry.angleOfAttack
        );

        // 3. Wake deficit from drag
        const wake = this.calculateWakeDeficit(
          pos,
          geometry,
          results.forces.dragCoefficient,
          results.parameters.velocity
        );

        return baseFlow.clone().add(induced).add(wake);
      },
      setNASAMetadata: (_metadata: NASACalculationResults) => {
        // Store metadata for later use (if needed)
        // Note: This is a placeholder for future metadata storage
      },
    };
  }

  /**
   * Calculate velocity induced by circulation (bound vortex)
   * 
   * Uses potential flow theory: v_θ = Γ/(2πr)
   */
  private static calculateCirculationVelocity(
    pos: Vector3,
    center: Vector3,
    circulation: number,
    angleOfAttack: number
  ): Vector3 {
    const r = pos.clone().sub(center);
    const distance = Math.sqrt(r.x * r.x + r.y * r.y);

    // Inside airfoil or very close - no induced velocity
    if (distance < 0.5) {
      return new Vector3(0, 0, 0);
    }

    // Tangential velocity: v_θ = Γ/(2πr)
    const vTheta = circulation / (2 * Math.PI * distance);

    // Convert to Cartesian coordinates
    const angle = Math.atan2(r.y, r.x);
    return new Vector3(
      -vTheta * Math.sin(angle),
      vTheta * Math.cos(angle),
      0
    );
  }

  /**
   * Calculate wake velocity deficit from drag
   * 
   * Models the wake as a Gaussian velocity deficit downstream of the airfoil
   */
  private static calculateWakeDeficit(
    pos: Vector3,
    geometry: AirfoilGeometry,
    dragCoefficient: number,
    freeStreamVel: number
  ): Vector3 {
    // Wake only exists downstream
    if (pos.x < geometry.center.x) {
      return new Vector3(0, 0, 0);
    }

    // Distance downstream and cross-stream
    const downstream = pos.x - geometry.center.x;
    const crossStream = Math.sqrt(pos.y * pos.y + pos.z * pos.z);

    // Wake width grows linearly
    const wakeWidth = 0.5 + downstream * 0.05;

    // Gaussian profile with drag-based deficit
    const deficit =
      dragCoefficient *
      Math.exp(-(crossStream * crossStream) / (wakeWidth * wakeWidth)) *
      freeStreamVel *
      0.3; // Scale factor

    return new Vector3(-deficit, 0, 0);
  }
}


