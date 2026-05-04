/**
 * Fluid Simulation Configuration
 * Parameters and presets for real-time fluid dynamics
 */

export interface FluidConfig {
  // Grid resolution (affected by device capabilities)
  gridResolution: [number, number, number]; // [width, height, depth]

  // Physical parameters
  viscosity: number; // Air viscosity (~0.000015 m²/s at 20°C)
  density: number; // Air density (~1.225 kg/m³ at sea level)
  dt: number; // Time step (seconds, typically 1/60)

  // Solver parameters
  solverIterations: number; // Jacobi iterations for pressure solver
  boundaryType: 'closed' | 'open' | 'periodic'; // Boundary condition type

  // Display options
  visualizationType: 'particles' | 'none' | 'streamlines' | 'velocity' | 'pressure';
  particleCount: number; // For visualization

  // Force tracking
  forceTracking: boolean;

  // Performance
  updateRate: number; // 1 = every frame, 2 = every 2nd frame, etc.
  enableGPU: boolean; // Use GPU-accelerated solver
  enableVorticity?: boolean; // Enable vorticity effects
}

// Device capability-based quality presets (reduced for performance)
export const FLUID_QUALITY_PRESETS = {
  low: {
    gridResolution: [24, 24, 12] as [number, number, number],
    viscosity: 0.00001,
    solverIterations: 5,
    particleCount: 10,
    updateRate: 4,
  },
  medium: {
    gridResolution: [32, 32, 16] as [number, number, number],
    viscosity: 0.00001,
    solverIterations: 8,
    particleCount: 15,
    updateRate: 3,
  },
  high: {
    gridResolution: [48, 48, 24] as [number, number, number],
    viscosity: 0.000015,
    solverIterations: 12,
    particleCount: 25,
    updateRate: 2,
  },
  ultra: {
    gridResolution: [64, 64, 32] as [number, number, number],
    viscosity: 0.000015,
    solverIterations: 15,
    particleCount: 40,
    updateRate: 1,
  },
};

export function getFluidConfig(
  quality: 'low' | 'medium' | 'high' | 'ultra',
  overrides?: Partial<FluidConfig>
): FluidConfig {
  const preset = FLUID_QUALITY_PRESETS[quality];

  return {
    gridResolution: preset.gridResolution,
    viscosity: preset.viscosity,
    density: 1.225,
    dt: 1 / 60,
    solverIterations: preset.solverIterations,
    boundaryType: 'closed',
    visualizationType: 'particles',
    particleCount: preset.particleCount,
    forceTracking: true,
    updateRate: preset.updateRate,
    enableGPU: true,
    ...overrides,
  };
}

export type FluidQuality = 'low' | 'medium' | 'high' | 'ultra';
