/**
 * NASA Aerodynamic Model (Orchestration Layer)
 * 
 * Main integration layer that combines all NASA calculations:
 * - Atmospheric conditions
 * - Joukowski geometry
 * - Lift calculations
 * - Drag calculations
 * - Complete aerodynamic results
 * 
 * This is the primary API for using NASA BGA calculations in the wind tunnel simulator.
 */

import { NASAAtmosphericModel } from './NASAAtmosphericModel';
import { NASALiftCalculations } from './NASALiftCalculations';
import { NASADragCalculations } from './NASADragCalculations';
import {
  AirfoilParameters,
  NASACalculationResults,
  NASAModelConfig,
  DEFAULT_NASA_CONFIG,
} from './NASATypes';

export class NASAAerodynamicModel {
  constructor(
    private params: AirfoilParameters,
    private config: NASAModelConfig = DEFAULT_NASA_CONFIG
  ) {}

  /**
   * Calculate complete aerodynamic results
   * 
   * This method orchestrates all NASA calculations:
   * 1. Atmospheric conditions (temperature, pressure, density, Reynolds)
   * 2. Joukowski geometry parameters
   * 3. Lift coefficient and force
   * 4. Drag coefficient and force
   * 5. Lift-to-drag ratio
   */
  calculate(): NASACalculationResults {
    // 1. Atmospheric conditions
    const atmospheric = NASAAtmosphericModel.calculate(
      this.params.velocity,
      this.params.altitude,
      this.params.chord
    );

    // 2. Joukowski geometry
    const geometry = NASALiftCalculations.calculateGeometry(this.params);

    // 3. Lift coefficient
    const liftCoefficient = NASALiftCalculations.calculateLiftCoefficient(
      this.params,
      this.config
    );

    // 4. Drag coefficient (needs lift coefficient and Reynolds for corrections)
    const dragCoefficient = NASADragCalculations.calculateDragCoefficient(
      this.params.camber,
      this.params.thickness,
      this.params.angle,
      liftCoefficient,
      atmospheric.reynoldsNumber
    );

    // 5. Force calculations
    const liftForce = NASALiftCalculations.calculateLiftForce(
      this.params,
      atmospheric,
      liftCoefficient
    );

    const dragForce = NASADragCalculations.calculateDragForce(
      this.params,
      atmospheric,
      dragCoefficient
    );

    // 6. Lift-to-drag ratio
    const liftToDragRatio = dragForce > 0 ? liftForce / dragForce : 0;

    return {
      atmospheric,
      forces: {
        liftCoefficient,
        dragCoefficient,
        liftForce,
        dragForce,
        liftToDragRatio,
      },
      geometry,
      parameters: this.params,
    };
  }

  /**
   * Update airfoil parameters and recalculate
   */
  updateParameters(params: Partial<AirfoilParameters>): NASACalculationResults {
    this.params = { ...this.params, ...params };
    return this.calculate();
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<NASAModelConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current parameters
   */
  getParameters(): AirfoilParameters {
    return { ...this.params };
  }

  /**
   * Get current configuration
   */
  getConfig(): NASAModelConfig {
    return { ...this.config };
  }
}

