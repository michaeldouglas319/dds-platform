/**
 * Configuration for fast-orbiting background particles in HomeV2
 * SCALED VERSION: Large orbiting system (200 units) vs runway (100 units)
 * Creates massive background sphere of particles around entire scene
 */

export const ORBITING_PARTICLE_CONFIG = {
  // Particle count and performance
  count: 400,                    // Increased for larger system (reduced on mobile)

  // Positioning - Relative to scene
  // Scene: Runway 100x100, gates at X=-10, orbit center at [20, 50, 0]
  // Particle system should surround entire scene
  centerPosition: [5, 50, 0] as [number, number, number],  // Centered relative to scene (between gates and runway)

  // Physics - SCALED UP 20x
  avoidanceRadius: 1.0,          // 20x larger (was 0.05) - particles avoid this far from center
  avoidanceStrength: 0.5,        // How strongly particles push away from center
  orbitalSpeed: 0.6,             // Slightly slower for large orbits

  // Visual
  color1: '#00BFFF',             // Deep sky blue - primary color
  color2: '#FF6347',             // Tomato red - secondary color
  opacity: 0.6,                  // Particle transparency
  blending: 'additive',          // Additive blending for glow effect

  // Scale factors for particle initialization
  // These control the shell distribution around the center
  // Scene: Runway 100x100 units, so particle system should be 2-3x larger (200-300 unit diameter)
  shellRadiusScale: 100,         // Creates ~300-unit diameter sphere (3x runway size)
  particleSize: 4.0,             // Larger particle size for visibility

  // Optional customization per fleet
  fleetVariations: {
    // Customize orbiting particles per fleet if needed
    'warehouse-north': {
      centerPosition: [15, 50, -10] as [number, number, number],
      color1: '#FF6347',         // Red tones
      color2: '#CC4F38',
      orbitalSpeed: 0.5,         // Slower for warehouse
      scale: 50,
    },
    'distribution-south': {
      centerPosition: [15, 55, 10] as [number, number, number],
      color1: '#4169E1',         // Blue tones
      color2: '#2E5DB8',
      orbitalSpeed: 0.6,         // Normal speed
      scale: 55,
    },
    'express-fleet': {
      centerPosition: [25, 52, 5] as [number, number, number],
      color1: '#FFD700',         // Gold tones
      color2: '#CCAA00',
      orbitalSpeed: 0.8,         // Faster for express
      scale: 60,
    },
  },
} as const;
