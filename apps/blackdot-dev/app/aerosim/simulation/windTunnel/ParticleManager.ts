import * as THREE from 'three';

export interface WindParticle {
  position: THREE.Vector3;
  color: THREE.Color;
  trail: THREE.Vector3[];
  age: number; // Time since spawned
  lastPosition: THREE.Vector3; // For stuck detection
  stuckCounter: number; // Counts frames with minimal movement
  maxAge: number; // Maximum lifetime before expiration
  lastVelocity?: THREE.Vector3; // Last sampled velocity (for stuck detection)
}

export interface SpawnArea {
  inletX: number;
  spawnYMin: number;
  spawnYMax: number;
  spawnZMin: number;
  spawnZMax: number;
}

/**
 * Calculate spawn area bounds based on configuration
 * Supports manual override, object-aware spawning, or default full field
 * NOTE: Spawn area only determines WHERE particles start - they can spread freely after spawning
 */
export function calculateSpawnArea(
  bounds: { min: THREE.Vector3; max: THREE.Vector3 },
  spawnAreaPosition?: { x: number; y: number; z: number },
  spawnAreaSize?: { width: number; height: number },
  useObjectAwareSpawning?: boolean,
  meshBounds?: THREE.Box3
): SpawnArea {
  let inletX: number;
  let spawnYMin: number, spawnYMax: number;
  let spawnZMin: number, spawnZMax: number;
  
  // Use manual spawn area if provided, otherwise calculate from object bounds
  // IMPORTANT: Spawn area size should NOT restrict particle spread - particles move freely after spawning
  if (spawnAreaPosition && spawnAreaSize) {
    // Manual override: Use position for inlet X, but use FULL bounds for Y/Z to allow natural spread
    // This prevents artificial pressure buildup from restricted spawn areas
    inletX = spawnAreaPosition.x;
    
    // Use full bounds for Y and Z to allow particles to spread naturally
    // The spawnAreaSize is ignored to prevent artificial constraints
    spawnYMin = bounds.min.y;
    spawnYMax = bounds.max.y;
    spawnZMin = bounds.min.z;
    spawnZMax = bounds.max.z;
  } else if (useObjectAwareSpawning && meshBounds) {
    // Object-aware spawning: Source area matches object's two largest dimensions
    const objectCenter = meshBounds.getCenter(new THREE.Vector3());
    const objectSize = meshBounds.getSize(new THREE.Vector3());
    
    // Get the two largest dimensions (for Y and Z spawn plane)
    const dimensions = [objectSize.x, objectSize.y, objectSize.z].sort((a, b) => b - a);
    const largestDim = dimensions[0];   // Largest dimension
    const secondLargestDim = dimensions[1]; // Second largest dimension
    
    // Spawn area: Use two largest dimensions for Y and Z
    // This creates a dynamic wind tunnel that adapts to object shape
    const spawnHeight = largestDim;      // Y dimension (height)
    const spawnWidth = secondLargestDim;  // Z dimension (width)

    // Spawn upstream of object, centered on object
    // Position inlet slightly upstream (1x largest dimension)
    // CRITICAL FIX: Spawn at x=-10 (upstream) to ensure particles are in active flow region
    // Without this, particles may spawn far from the wind tunnel inlet and never reach the mesh
    inletX = Math.max(objectCenter.x - largestDim, Math.max(bounds.min.x - 10, -10));
    
    // Center spawn area on object, use two largest dimensions
    spawnYMin = objectCenter.y - spawnHeight / 2;
    spawnYMax = objectCenter.y + spawnHeight / 2;
    spawnZMin = objectCenter.z - spawnWidth / 2;
    spawnZMax = objectCenter.z + spawnWidth / 2;
    
    // Clamp to velocity field bounds
    spawnYMin = Math.max(spawnYMin, bounds.min.y);
    spawnYMax = Math.min(spawnYMax, bounds.max.y);
    spawnZMin = Math.max(spawnZMin, bounds.min.z);
    spawnZMax = Math.min(spawnZMax, bounds.max.z);
  } else {
    // Default: Full velocity field cross-section
    // Spawn at x=-10 (upstream) to ensure particles are in active flow region
    inletX = Math.max(bounds.min.x - 10, -10);
    spawnYMin = bounds.min.y;
    spawnYMax = bounds.max.y;
    spawnZMin = bounds.min.z;
    spawnZMax = bounds.max.z;
  }
  
  return { inletX, spawnYMin, spawnYMax, spawnZMin, spawnZMax };
}

/**
 * Completely reset a particle to original spawn state
 * Returns particle to random location in spawn area with default velocity
 */
export function resetParticle(
  particle: WindParticle,
  bounds: { min: THREE.Vector3; max: THREE.Vector3 },
  flowSpeed: number,
  particleLifetime: number,
  spawnAreaPosition?: { x: number; y: number; z: number },
  spawnAreaSize?: { width: number; height: number },
  useObjectAwareSpawning?: boolean,
  meshBounds?: THREE.Box3
): void {
  // Use the same spawn area calculation as spawnWave
  const { inletX, spawnYMin, spawnYMax, spawnZMin, spawnZMax } = calculateSpawnArea(
    bounds,
    spawnAreaPosition,
    spawnAreaSize,
    useObjectAwareSpawning,
    meshBounds
  );
  
  // Random position in spawn area (matches spawnWave exactly)
  const newX = inletX + (Math.random() - 0.5) * 2; // Small random offset in X
  const newY = spawnYMin + Math.random() * (spawnYMax - spawnYMin);
  const newZ = spawnZMin + Math.random() * (spawnZMax - spawnZMin);
  const newPosition = new THREE.Vector3(newX, newY, newZ);
  
  // COMPLETE RESET: Return particle to original spawn state
  particle.position.copy(newPosition);
  particle.age = 0; // Fresh start
  // FIXED: Use particleLifetime parameter instead of hardcoded value
  particle.maxAge = particleLifetime + Math.random() * (particleLifetime * 0.3); // Random lifetime with variation
  particle.stuckCounter = 0; // Reset stuck counter
  particle.lastPosition = newPosition.clone(); // Reset last position
  particle.lastVelocity = new THREE.Vector3(flowSpeed, 0, 0); // Reset to default flow velocity (flowSpeed, 0, 0)
  particle.trail = [newPosition.clone()]; // Fresh trail
  particle.color.set(0.0, 1.0, 0.0); // Reset to green for respawned particles
}

/**
 * Spawn a new wave of particles at the inlet
 * Particles spawn randomly across the inlet cross-section
 * OR object-centered if useObjectAwareSpawning is enabled
 */
export function spawnWave(
  particles: WindParticle[],
  particleCount: number,
  particlesPerWave: number,
  bounds: { min: THREE.Vector3; max: THREE.Vector3 },
  flowSpeed: number,
  particleLifetime: number,
  spawnAreaPosition?: { x: number; y: number; z: number },
  spawnAreaSize?: { width: number; height: number },
  useObjectAwareSpawning?: boolean,
  meshBounds?: THREE.Box3
): void {
  // Use shared spawn area calculation
  const { inletX, spawnYMin, spawnYMax, spawnZMin, spawnZMax } = calculateSpawnArea(
    bounds,
    spawnAreaPosition,
    spawnAreaSize,
    useObjectAwareSpawning,
    meshBounds
  );

  // Spawn new particles up to the limit with FULLY RANDOM positions
  for (let i = 0; i < particlesPerWave; i++) {
    if (particles.length < particleCount) {
      // Randomize across spawn area (object-aware or full field)
      const y = spawnYMin + Math.random() * (spawnYMax - spawnYMin);
      const z = spawnZMin + Math.random() * (spawnZMax - spawnZMin);
      
      // Add small random offset in X to prevent clustering
      const x = inletX + (Math.random() - 0.5) * 2;

      const position = new THREE.Vector3(x, y, z);
      const color = new THREE.Color(0.5, 0.7, 1.0); // Default cyan

      particles.push({
        position: position.clone(),
        color: color,
        trail: [position.clone()],
        age: 0,
        lastPosition: position.clone(),
        stuckCounter: 0,
        maxAge: particleLifetime + Math.random() * (particleLifetime * 0.3), // Random lifetime with variation
        lastVelocity: new THREE.Vector3(flowSpeed, 0, 0),
      });
    }
  }
}

