/**
 * NASA BGA Lift Calculations
 * 
 * Based on Kutta-Joukowski theory with Joukowski transformation
 * Ported from FoilSimStudent_Calc.js
 * 
 * References:
 * - Lines 152-312: Joukowski geometry and lift calculations
 * - Lines 208-256: Lift coefficient with stall modeling
 */

import {
  AirfoilParameters,
  JoukowskiGeometry,
  NASAModelConfig,
  DEFAULT_NASA_CONFIG,
  AtmosphericConditions,
  CONSTANTS,
} from './NASATypes';

export class NASALiftCalculations {
  /**
   * Calculate complete Joukowski geometry parameters
   */
  static calculateGeometry(params: AirfoilParameters): JoukowskiGeometry {
    const xcval = this.getJoukowskiXCenter(params);
    const ycval = this.getJoukowskiYCenter(params);
    const rval = this.getJoukowskiRadius(params);
    const beta = this.getJoukowskiBeta(params);
    const gamval = this.getCirculation(params);

    // Calculate chord from Joukowski transformation
    const leg = xcval - Math.sqrt(rval * rval - ycval * ycval);
    const teg = xcval + Math.sqrt(rval * rval - ycval * ycval);
    const lem = leg + 1.0 / leg;
    const tem = teg + 1.0 / teg;
    const chord = tem - lem;

    return { xcval, ycval, rval, beta, gamval, chord };
  }

  /**
   * Get Joukowski Y-center (ycval)
   * From FoilSimStudent_Calc.js lines 162-170
   */
  private static getJoukowskiYCenter(params: AirfoilParameters): number {
    const camber = params.camber / 25.0;
    return camber / 2.0;
  }

  /**
   * Get Joukowski radius (rval)
   * From FoilSimStudent_Calc.js lines 173-181
   */
  private static getJoukowskiRadius(params: AirfoilParameters): number {
    const thickness = params.thickness / 25.0;
    const ycval = this.getJoukowskiYCenter(params);
    return (
      thickness / 4.0 +
      Math.sqrt((thickness * thickness) / 16.0 + ycval * ycval + 1.0)
    );
  }

  /**
   * Get Joukowski X-center (xcval)
   * From FoilSimStudent_Calc.js lines 152-159
   */
  private static getJoukowskiXCenter(params: AirfoilParameters): number {
    const ycval = this.getJoukowskiYCenter(params);
    const rval = this.getJoukowskiRadius(params);
    return 1.0 - Math.sqrt(rval * rval - ycval * ycval);
  }

  /**
   * Get Joukowski beta angle
   * From FoilSimStudent_Calc.js lines 184-192
   */
  private static getJoukowskiBeta(params: AirfoilParameters): number {
    const ycval = this.getJoukowskiYCenter(params);
    const rval = this.getJoukowskiRadius(params);
    const convdr = CONSTANTS.PI / 180;
    return Math.asin(ycval / rval) / convdr;
  }

  /**
   * Get circulation (Gamma)
   * From FoilSimStudent_Calc.js lines 195-205
   */
  private static getCirculation(params: AirfoilParameters): number {
    const angle = params.angle;
    const radians = (angle * CONSTANTS.PI) / 180;
    const beta = this.getJoukowskiBeta(params);
    const rval = this.getJoukowskiRadius(params);
    const betaRad = (beta * CONSTANTS.PI) / 180;
    return 2.0 * rval * Math.sin(radians + betaRad);
  }

  /**
   * Calculate lift coefficient (main public API)
   * From FoilSimStudent_Calc.js lines 208-256
   * CRITICAL: Preserves exact stall modeling logic
   */
  static calculateLiftCoefficient(
    params: AirfoilParameters,
    config: NASAModelConfig = DEFAULT_NASA_CONFIG
  ): number {
    const ycval = this.getJoukowskiYCenter(params);
    const rval = this.getJoukowskiRadius(params);
    const xcval = this.getJoukowskiXCenter(params);
    const gamval = this.getCirculation(params);

    // Calculate chord from Joukowski transformation
    const leg = xcval - Math.sqrt(rval * rval - ycval * ycval);
    const teg = xcval + Math.sqrt(rval * rval - ycval * ycval);
    const lem = leg + 1.0 / leg;
    const tem = teg + 1.0 / teg;
    const chord = tem - lem;

    // Base lift coefficient from Joukowski theory
    let liftCoefficient = (gamval * 4.0 * CONSTANTS.PI) / chord;

    // Apply stall factor for high angles of attack
    if (config.enableStallModeling) {
      liftCoefficient = this.applyStallFactor(liftCoefficient, params.angle);
    }

    // Apply aspect ratio correction for finite wing
    if (config.enableAspectRatioCorrection) {
      liftCoefficient = this.applyAspectRatioCorrection(liftCoefficient);
    }

    return liftCoefficient;
  }

  /**
   * Apply stall factor for high angles of attack
   * From FoilSimStudent_Calc.js lines 237-244
   * CRITICAL: Must preserve exact formula
   */
  private static applyStallFactor(cl: number, angle: number): number {
    let stfact: number;

    if (angle > 10.0) {
      stfact = 0.5 + 0.1 * angle - 0.005 * angle * angle;
    } else if (angle < -10.0) {
      stfact = 0.5 - 0.1 * angle - 0.005 * angle * angle;
    } else {
      stfact = 1.0;
    }

    return cl * stfact;
  }

  /**
   * Apply aspect ratio correction
   * From FoilSimStudent_Calc.js line 247
   * Accounts for induced drag from finite wing
   */
  private static applyAspectRatioCorrection(cl: number): number {
    return cl / (1.0 + Math.abs(cl) / (CONSTANTS.PI * 4.0));
  }

  /**
   * Calculate lift force
   * From FoilSimStudent_Calc.js lines 260-312
   * Lift = q₀ * Area * C_L
   */
  static calculateLiftForce(
    params: AirfoilParameters,
    atmospheric: AtmosphericConditions,
    liftCoefficient: number
  ): number {
    return atmospheric.dynamicPressure * params.wingArea * liftCoefficient;
  }
}

