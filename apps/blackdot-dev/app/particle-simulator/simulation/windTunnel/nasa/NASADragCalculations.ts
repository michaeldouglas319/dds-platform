/**
 * NASA BGA Drag Calculations
 * 
 * Contains 20 pre-computed 6th-order polynomial drag coefficients
 * from NASA wind tunnel data with bilinear interpolation.
 * 
 * Ported from FoilSimStudent_Calc.js lines 316-572
 * 
 * Organization:
 * - 5 camber values: 0%, 5%, 10%, 15%, 20%
 * - 4 thickness values: 5%, 10%, 15%, 20%
 * - Total: 5 × 4 = 20 polynomials
 * 
 * Polynomial format: C_D = a6*α^6 + a5*α^5 + a4*α^4 + a3*α^3 + a2*α^2 + a1*α + a0
 */

import {
  DragPolynomial,
  AirfoilParameters,
  AtmosphericConditions,
  CONSTANTS,
} from './NASATypes';
import { NASALiftCalculations } from './NASALiftCalculations';

export class NASADragCalculations {
  /**
   * All 20 drag polynomials organized by camber and thickness
   * From FoilSimStudent_Calc.js lines 324-346
   * CRITICAL: Coefficients must match exactly
   */
  private static readonly DRAG_POLYNOMIALS: {
    [camber: number]: { [thickness: number]: DragPolynomial };
  } = {
    // Camber 0%
    0: {
      5: [-9e-7, 0, 0, 0.0007, 0.0008, 0, 0.015],
      10: [-1e-8, 6e-8, 6e-6, -2e-5, -0.0002, 0.0017, 0.0196],
      15: [-5e-9, 7e-8, 3e-6, -3e-5, -7e-5, 0.0017, 0.0358],
      20: [-3e-9, 2e-8, 2e-6, -8e-6, -4e-5, 0.0003, 0.0416],
    },
    // Camber 5%
    5: {
      5: [0, 4e-8, -7e-7, -1e-5, 0.0009, 0.0033, 0.0301],
      10: [3e-9, 6e-8, -2e-6, -3e-5, 0.0008, 0.0038, 0.0159],
      15: [-4e-9, -8e-9, 2e-6, -9e-7, 0.0002, 0.0031, 0.0351],
      20: [-3e-9, -7e-8, 1e-6, 3e-5, 0.0004, 5e-5, 0.0483],
    },
    // Camber 10%
    10: {
      5: [-9e-9, -6e-8, 5e-6, 3e-5, -0.0001, -0.0025, 0.0615],
      10: [-5e-9, -3e-8, 2e-6, 1e-5, 0.0004, -3e-5, 0.0624],
      15: [3e-9, 3e-8, -2e-6, -1e-5, 0.0009, 0.004, 0.0543],
      20: [1e-8, 4e-8, -6e-6, -2e-5, 0.0014, 0.007, 0.0692],
    },
    // Camber 15%
    15: {
      5: [8e-10, -5e-8, -1e-6, 3e-5, 0.0008, -0.0027, 0.0612],
      10: [-2e-9, -2e-8, -5e-7, 8e-6, 0.0009, 0.0034, 0.0993],
      15: [3e-9, 5e-8, -2e-6, -3e-5, 0.0008, 0.0087, 0.1167],
      20: [3e-9, -9e-8, -3e-6, 4e-5, 0.001, 0.0021, 0.139],
    },
    // Camber 20%
    20: {
      5: [8e-9, 1e-8, -5e-6, 6e-6, 0.001, -0.001, 0.1219],
      10: [2e-9, -3e-8, -2e-6, 2e-5, 0.0009, 0.0023, 0.1581],
      15: [3e-10, -3e-8, -6e-7, 3e-5, 0.0006, 0.0008, 0.1859],
      20: [3e-9, -7e-8, -3e-6, 4e-5, 0.0012, 0.001, 0.1856],
    },
  };

  /**
   * Evaluate polynomial at given angle of attack
   */
  private static evaluatePolynomial(poly: DragPolynomial, angle: number): number {
    const [a6, a5, a4, a3, a2, a1, a0] = poly;
    return (
      a6 * Math.pow(angle, 6) +
      a5 * Math.pow(angle, 5) +
      a4 * Math.pow(angle, 4) +
      a3 * Math.pow(angle, 3) +
      a2 * Math.pow(angle, 2) +
      a1 * angle +
      a0
    );
  }

  /**
   * Linear interpolation helper
   */
  private static lerp(val1: number, val2: number, t: number): number {
    return val1 + t * (val2 - val1);
  }

  /**
   * Get drag coefficient for given camber, thickness, and angle
   * From FoilSimStudent_Calc.js lines 316-572
   * CRITICAL: Complex bilinear interpolation logic must be preserved exactly
   */
  static calculateDragCoefficient(
    camber: number,
    thickness: number,
    angle: number,
    liftCoefficient?: number,
    reynoldsNumber?: number
  ): number {
    const camd = camber;
    const thkd = thickness;
    const alfd = angle;

    // Evaluate all 20 polynomials at the given angle
    const dragValues: { [camber: number]: { [thickness: number]: number } } = {};
    for (const cam of [0, 5, 10, 15, 20]) {
      dragValues[cam] = {};
      for (const thk of [5, 10, 15, 20]) {
        dragValues[cam][thk] = this.evaluatePolynomial(
          this.DRAG_POLYNOMIALS[cam][thk],
          alfd
        );
      }
    }

    let dragco = 0;

    // Bilinear interpolation logic from lines 353-555
    // This complex nested structure must be preserved exactly

    if (-20.0 <= camd && camd < -15.0) {
      const dragThk5 =
        (camd / 5 + 4) * (dragValues[15][5] - dragValues[20][5]) + dragValues[20][5];
      const dragThk10 =
        (camd / 5 + 4) * (dragValues[15][10] - dragValues[20][10]) + dragValues[20][10];
      const dragThk15 =
        (camd / 5 + 4) * (dragValues[15][15] - dragValues[20][15]) + dragValues[20][15];
      const dragThk20 =
        (camd / 5 + 4) * (dragValues[15][20] - dragValues[20][20]) + dragValues[20][20];

      if (1.0 <= thkd && thkd <= 5.0) {
        dragco = dragThk5;
      } else if (5.0 < thkd && thkd <= 10.0) {
        dragco = (thkd / 5 - 1) * (dragThk10 - dragThk5) + dragThk5;
      } else if (10.0 < thkd && thkd <= 15.0) {
        dragco = (thkd / 5 - 2) * (dragThk15 - dragThk10) + dragThk10;
      } else if (15.0 < thkd && thkd <= 20.0) {
        dragco = (thkd / 5 - 3) * (dragThk20 - dragThk15) + dragThk15;
      }
    } else if (-15.0 <= camd && camd < -10.0) {
      const dragThk5 =
        (camd / 5 + 3) * (dragValues[10][5] - dragValues[15][5]) + dragValues[15][5];
      const dragThk10 =
        (camd / 5 + 3) * (dragValues[10][10] - dragValues[15][10]) + dragValues[15][10];
      const dragThk15 =
        (camd / 5 + 3) * (dragValues[10][15] - dragValues[15][15]) + dragValues[15][15];
      const dragThk20 =
        (camd / 5 + 3) * (dragValues[10][20] - dragValues[15][20]) + dragValues[15][20];

      if (1.0 <= thkd && thkd <= 5.0) {
        dragco = dragThk5;
      } else if (5.0 < thkd && thkd <= 10.0) {
        dragco = (thkd / 5 - 1) * (dragThk10 - dragThk5) + dragThk5;
      } else if (10.0 < thkd && thkd <= 15.0) {
        dragco = (thkd / 5 - 2) * (dragThk15 - dragThk10) + dragThk10;
      } else if (15.0 < thkd && thkd <= 20.0) {
        dragco = (thkd / 5 - 3) * (dragThk20 - dragThk15) + dragThk15;
      }
    } else if (-10.0 <= camd && camd < -5.0) {
      const dragThk5 =
        (camd / 5 + 2) * (dragValues[5][5] - dragValues[10][5]) + dragValues[10][5];
      const dragThk10 =
        (camd / 5 + 2) * (dragValues[5][10] - dragValues[10][10]) + dragValues[10][10];
      const dragThk15 =
        (camd / 5 + 2) * (dragValues[5][15] - dragValues[10][15]) + dragValues[10][15];
      const dragThk20 =
        (camd / 5 + 2) * (dragValues[5][20] - dragValues[10][20]) + dragValues[10][20];

      if (1.0 <= thkd && thkd <= 5.0) {
        dragco = dragThk5;
      } else if (5.0 < thkd && thkd <= 10.0) {
        dragco = (thkd / 5 - 1) * (dragThk10 - dragThk5) + dragThk5;
      } else if (10.0 < thkd && thkd <= 15.0) {
        dragco = (thkd / 5 - 2) * (dragThk15 - dragThk10) + dragThk10;
      } else if (15.0 < thkd && thkd <= 20.0) {
        dragco = (thkd / 5 - 3) * (dragThk20 - dragThk15) + dragThk15;
      }
    } else if (-5.0 <= camd && camd < 0) {
      const dragThk5 =
        (camd / 5 + 1) * (dragValues[0][5] - dragValues[5][5]) + dragValues[5][5];
      const dragThk10 =
        (camd / 5 + 1) * (dragValues[0][10] - dragValues[5][10]) + dragValues[5][10];
      const dragThk15 =
        (camd / 5 + 1) * (dragValues[0][15] - dragValues[5][15]) + dragValues[5][15];
      const dragThk20 =
        (camd / 5 + 1) * (dragValues[0][20] - dragValues[5][20]) + dragValues[5][20];

      if (1.0 <= thkd && thkd <= 5.0) {
        dragco = dragThk5;
      } else if (5.0 < thkd && thkd <= 10.0) {
        dragco = (thkd / 5 - 1) * (dragThk10 - dragThk5) + dragThk5;
      } else if (10.0 < thkd && thkd <= 15.0) {
        dragco = (thkd / 5 - 2) * (dragThk15 - dragThk10) + dragThk10;
      } else if (15.0 < thkd && thkd <= 20.0) {
        dragco = (thkd / 5 - 3) * (dragThk20 - dragThk15) + dragThk15;
      }
    } else if (0 <= camd && camd < 5) {
      const dragThk5 = (camd / 5) * (dragValues[5][5] - dragValues[0][5]) + dragValues[0][5];
      const dragThk10 =
        (camd / 5) * (dragValues[5][10] - dragValues[0][10]) + dragValues[0][10];
      const dragThk15 =
        (camd / 5) * (dragValues[5][15] - dragValues[0][15]) + dragValues[0][15];
      const dragThk20 =
        (camd / 5) * (dragValues[5][20] - dragValues[0][20]) + dragValues[0][20];

      if (1.0 <= thkd && thkd <= 5.0) {
        dragco = dragThk5;
      } else if (5.0 < thkd && thkd <= 10.0) {
        dragco = (thkd / 5 - 1) * (dragThk10 - dragThk5) + dragThk5;
      } else if (10.0 < thkd && thkd <= 15.0) {
        dragco = (thkd / 5 - 2) * (dragThk15 - dragThk10) + dragThk10;
      } else if (15.0 < thkd && thkd <= 20.0) {
        dragco = (thkd / 5 - 3) * (dragThk20 - dragThk15) + dragThk15;
      }
    } else if (5 <= camd && camd < 10) {
      const dragThk5 =
        (camd / 5 - 1) * (dragValues[10][5] - dragValues[5][5]) + dragValues[5][5];
      const dragThk10 =
        (camd / 5 - 1) * (dragValues[10][10] - dragValues[5][10]) + dragValues[5][10];
      const dragThk15 =
        (camd / 5 - 1) * (dragValues[10][15] - dragValues[5][15]) + dragValues[5][15];
      const dragThk20 =
        (camd / 5 - 1) * (dragValues[10][20] - dragValues[5][20]) + dragValues[5][20];

      if (1.0 <= thkd && thkd <= 5.0) {
        dragco = dragThk5;
      } else if (5.0 < thkd && thkd <= 10.0) {
        dragco = (thkd / 5 - 1) * (dragThk10 - dragThk5) + dragThk5;
      } else if (10.0 < thkd && thkd <= 15.0) {
        dragco = (thkd / 5 - 2) * (dragThk15 - dragThk10) + dragThk10;
      } else if (15.0 < thkd && thkd <= 20.0) {
        dragco = (thkd / 5 - 3) * (dragThk20 - dragThk15) + dragThk15;
      }
    } else if (10 <= camd && camd < 15) {
      const dragThk5 =
        (camd / 5 - 2) * (dragValues[15][5] - dragValues[10][5]) + dragValues[10][5];
      const dragThk10 =
        (camd / 5 - 2) * (dragValues[15][10] - dragValues[10][10]) + dragValues[10][10];
      const dragThk15 =
        (camd / 5 - 2) * (dragValues[15][15] - dragValues[10][15]) + dragValues[10][15];
      const dragThk20 =
        (camd / 5 - 2) * (dragValues[15][20] - dragValues[10][20]) + dragValues[10][20];

      if (1.0 <= thkd && thkd <= 5.0) {
        dragco = dragThk5;
      } else if (5.0 < thkd && thkd <= 10.0) {
        dragco = (thkd / 5 - 1) * (dragThk10 - dragThk5) + dragThk5;
      } else if (10.0 < thkd && thkd <= 15.0) {
        dragco = (thkd / 5 - 2) * (dragThk15 - dragThk10) + dragThk10;
      } else if (15.0 < thkd && thkd <= 20.0) {
        dragco = (thkd / 5 - 3) * (dragThk20 - dragThk15) + dragThk15;
      }
    } else if (15 <= camd && camd <= 20) {
      const dragThk5 =
        (camd / 5 - 3) * (dragValues[20][5] - dragValues[15][5]) + dragValues[15][5];
      const dragThk10 =
        (camd / 5 - 3) * (dragValues[20][10] - dragValues[15][10]) + dragValues[15][10];
      const dragThk15 =
        (camd / 5 - 3) * (dragValues[20][15] - dragValues[15][15]) + dragValues[15][15];
      const dragThk20 =
        (camd / 5 - 3) * (dragValues[20][20] - dragValues[15][20]) + dragValues[15][20];

      if (1.0 <= thkd && thkd <= 5.0) {
        dragco = dragThk5;
      } else if (5.0 < thkd && thkd <= 10.0) {
        dragco = (thkd / 5 - 1) * (dragThk10 - dragThk5) + dragThk5;
      } else if (10.0 < thkd && thkd <= 15.0) {
        dragco = (thkd / 5 - 2) * (dragThk15 - dragThk10) + dragThk10;
      } else if (15.0 < thkd && thkd <= 20.0) {
        dragco = (thkd / 5 - 3) * (dragThk20 - dragThk15) + dragThk15;
      }
    }

    // Apply Reynolds number correction (line 563)
    if (reynoldsNumber !== undefined && reynoldsNumber > 0) {
      dragco = dragco * Math.pow(50000.0 / reynoldsNumber, 0.11);
    }

    // Add induced drag from lift (line 564)
    // Aspect ratio = 4.0, efficiency = 0.85
    if (liftCoefficient !== undefined) {
      const aspr = 4.0;
      dragco = dragco + (liftCoefficient * liftCoefficient) / (CONSTANTS.PI * aspr * 0.85);
    }

    return dragco;
  }

  /**
   * Calculate drag force
   * From FoilSimStudent_Calc.js lines 575-624
   * Drag = q₀ * Area * C_D
   */
  static calculateDragForce(
    params: AirfoilParameters,
    atmospheric: AtmosphericConditions,
    dragCoefficient: number
  ): number {
    return atmospheric.dynamicPressure * params.wingArea * dragCoefficient;
  }
}


