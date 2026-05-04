import * as THREE from 'three';
import { WindParticle, resetParticle } from './ParticleManager';
import { FluidSimulator } from './FluidSimulator';
import { VelocityField } from './VelocityField';
import { ParticleAdvection } from './ParticleAdvection';
import { ExtremeStats } from './ParticlePerformance';

export interface ParticleUpdateParams {
  particles: WindParticle[];
  bounds: { min: THREE.Vector3; max: THREE.Vector3 };
  simulator: FluidSimulator | null;
  field: VelocityField | null;
  meshSDF?: (pos: THREE.Vector3) => number;
  timeStep: number;
  flowSpeed: number;
  colorByVelocity: boolean;
  showTrails: boolean;
  stuckThreshold: number;
  particleLifetime: number;
  inletExclusionZone: number;
  respawnDistance?: number; // Distance downstream to respawn particles
  spawnAreaPosition?: { x: number; y: number; z: number };
  spawnAreaSize?: { width: number; height: number };
  useObjectAwareSpawning?: boolean;
  meshBounds?: THREE.Box3;
}

/**
 * Update all particles: age, stuck detection, collision, advection, boundary checks
 * Returns extreme stats for debugging
 */
export function updateParticles(params: ParticleUpdateParams): ExtremeStats | null {
  const {
    particles,
    bounds,
    simulator,
    field,
    meshSDF,
    timeStep,
    flowSpeed,
    colorByVelocity,
    showTrails,
    stuckThreshold,
    inletExclusionZone,
    respawnDistance,
    spawnAreaPosition,
    spawnAreaSize,
    useObjectAwareSpawning,
    meshBounds,
  } = params;

  // Track extreme values for debugging
  let minVelocity = Infinity;
  let maxVelocity = -Infinity;
  let minPositionChange = Infinity;
  let maxPositionChange = -Infinity;
  let zeroVelocityCount = 0;
  let staticParticleCount = 0;
  let totalVelocity = 0;
  let totalPositionChange = 0;
  let activeParticleCount = 0;

  for (let i = 0; i < particles.length; i++) {
    const particle = particles[i];

    // Update particle age
    particle.age += timeStep;
    
    // Check if particle has expired (too old)
    const hasExpired = particle.age > particle.maxAge;
    
    // Check if particle is near inlet (exclude from stuck detection)
    const isNearInlet = particle.position.x < bounds.min.x + inletExclusionZone;
    
    // Debug: Log inlet detection for first particle occasionally
    if (i === 0 && Math.random() < 0.05) { // 5% of frames
      console.log(`🔍 Inlet Check: pos.x=${particle.position.x.toFixed(2)} bounds.min.x=${bounds.min.x.toFixed(2)} inletZone=${inletExclusionZone.toFixed(2)} threshold=${(bounds.min.x + inletExclusionZone).toFixed(2)} isNearInlet=${isNearInlet}`);
    }
    
    // Check if particle is stuck (not moving much) - but exclude inlet area
    let isStuck = false;
    let isStuckTooLong = false;
    
    if (!isNearInlet) {
      const movement = particle.position.distanceTo(particle.lastPosition);
      isStuck = movement < stuckThreshold * timeStep; // Less than threshold units per second
      
      if (isStuck) {
        particle.stuckCounter++;
      } else {
        particle.stuckCounter = 0;
      }
      
      isStuckTooLong = particle.stuckCounter > 60; // Stuck for more than 1 second at 60fps
    } else {
      // Near inlet - reset stuck counter to allow particles to start moving
      particle.stuckCounter = 0;
    }
    
    // Check if particle has traveled respawnDistance downstream
    let hasTraveledTooFar = false;
    if (respawnDistance && spawnAreaPosition) {
      const spawnX = spawnAreaPosition.x;
      const downstreamDistance = particle.position.x - spawnX;
      if (downstreamDistance > respawnDistance) {
        hasTraveledTooFar = true;
      }
    }
    
    // Respawn if expired, stuck, or traveled too far downstream
    if (hasExpired || isStuckTooLong || hasTraveledTooFar) {
      resetParticle(
        particle,
        bounds,
        flowSpeed,
        params.particleLifetime, // Pass particleLifetime parameter
        spawnAreaPosition,
        spawnAreaSize,
        useObjectAwareSpawning,
        meshBounds
      );
      continue; // Skip advection for this frame
    }

    // CRITICAL: Check for collision with mesh using SDF BEFORE advection
    // This prevents particles from clipping through geometry
    let isInsideObstacle = false;
    let sdfValue = Infinity;
    
    // Use mesh SDF directly if available (more accurate than field.getSignedDistance)
    // Phase 2: Use voxel grid if available for better cache performance
    if (meshSDF) {
      const voxelGrid = (meshSDF as { __voxelGrid?: { queryDistance: (pos: THREE.Vector3) => number } }).__voxelGrid;
      if (voxelGrid) {
        // Phase 2: Use voxel grid for cached SDF queries
        sdfValue = voxelGrid.queryDistance(particle.position);
      } else {
        // Fallback to direct SDF query (no voxel grid available)
        sdfValue = meshSDF(particle.position);
      }
      if (sdfValue < 0) {
        isInsideObstacle = true;
      }
    } else if (field?.getSignedDistance) {
      sdfValue = field.getSignedDistance(particle.position);
      if (sdfValue < 0) {
        isInsideObstacle = true;
      }
    }

    if (isInsideObstacle) {
      // Particle inside obstacle - push it out along SDF gradient with bounce physics
      // Reference: QUICK_CODE_REFERENCE.md - Collision Response (Bounce) pattern
      // Phase 1.1 & 2.3: Use optimized gradient computation (voxel grid or BVH)
      if (meshSDF) {
        const meshSDFWithExtras = meshSDF as {
          __voxelGrid?: { queryGradient: (pos: THREE.Vector3) => THREE.Vector3 };
          __meshSDFInstance?: { getGradientFromBVH: (pos: THREE.Vector3) => THREE.Vector3 };
        };
        const voxelGrid = meshSDFWithExtras.__voxelGrid;
        const sdfInstance = meshSDFWithExtras.__meshSDFInstance;
        let gradient: THREE.Vector3;
        
        if (voxelGrid) {
          // Phase 2: Use voxel grid gradient (precomputed or cached)
          gradient = voxelGrid.queryGradient(particle.position);
        } else if (sdfInstance && sdfInstance.getGradientFromBVH) {
          // Phase 1.2: Use BVH-based gradient (much faster)
          gradient = sdfInstance.getGradientFromBVH(particle.position);
        } else {
          // Fallback to finite differences if instance not available
          const epsilon = 0.1;
          const gradX = (meshSDF(new THREE.Vector3(particle.position.x + epsilon, particle.position.y, particle.position.z)) -
                        meshSDF(new THREE.Vector3(particle.position.x - epsilon, particle.position.y, particle.position.z))) / (2 * epsilon);
          const gradY = (meshSDF(new THREE.Vector3(particle.position.x, particle.position.y + epsilon, particle.position.z)) -
                        meshSDF(new THREE.Vector3(particle.position.x, particle.position.y - epsilon, particle.position.z))) / (2 * epsilon);
          const gradZ = (meshSDF(new THREE.Vector3(particle.position.x, particle.position.y, particle.position.z + epsilon)) -
                        meshSDF(new THREE.Vector3(particle.position.x, particle.position.y, particle.position.z - epsilon))) / (2 * epsilon);
          gradient = new THREE.Vector3(gradX, gradY, gradZ);
        }
        if (gradient.length() > 0.001) {
          const normal = gradient.normalize();
          // Push particle out by at least the penetration distance
          const pushDistance = Math.abs(sdfValue) + 0.5; // Push out plus safety margin
          particle.position.add(normal.multiplyScalar(pushDistance));
          
          // Enhanced collision response: bounce physics
          // Separate velocity into normal and tangent components
          const velocity = particle.lastVelocity || new THREE.Vector3(flowSpeed, 0, 0);
          const normalComponent = normal.clone().multiplyScalar(velocity.dot(normal));
          const tangentComponent = velocity.clone().sub(normalComponent);
          
          // Bounce: reverse normal component with restitution coefficient
          const restitution = 0.5; // Increased for visibility (was 0.3) - 50% energy retained
          const bounceVelocity = normalComponent.multiplyScalar(-restitution);
          
          // Friction: reduce tangent component
          const friction = 0.6; // Reduced for more visible bounce (was 0.7) - 60% of tangent velocity retained
          const frictionVelocity = tangentComponent.multiplyScalar(friction);
          
          // New velocity after collision
          const newVelocity = bounceVelocity.add(frictionVelocity);
          particle.lastVelocity = newVelocity;
        } else {
          // Fallback: reset particle
          resetParticle(
            particle,
            bounds,
            flowSpeed,
            params.particleLifetime,
            spawnAreaPosition,
            spawnAreaSize,
            useObjectAwareSpawning,
            meshBounds
          );
          continue;
        }
      } else {
        // No SDF available - reset particle
        resetParticle(
          particle,
          bounds,
          flowSpeed,
          params.particleLifetime,
          spawnAreaPosition,
          spawnAreaSize,
          useObjectAwareSpawning,
          meshBounds
        );
        continue;
      }
      particle.lastPosition.copy(particle.position);
      particle.trail = [particle.position.clone()];
      particle.age = 0;
      particle.stuckCounter = 0;
    } else {
      // Advect particle using velocity field
      // Use simulator if available, otherwise fall back to field
      let velocity: THREE.Vector3;
      if (simulator) {
        velocity = (simulator as { sampleVelocity: (pos: THREE.Vector3) => THREE.Vector3 }).sampleVelocity(particle.position);
        // If velocity is zero or invalid, use default flow speed
        if (velocity.length() < 0.01) {
          velocity = new THREE.Vector3(flowSpeed, 0, 0);
        }
      } else if (field) {
        velocity = field.sampleVelocity(particle.position);
        // If velocity is zero or invalid, use default flow speed
        if (velocity.length() < 0.01) {
          velocity = new THREE.Vector3(flowSpeed, 0, 0);
        }
      } else {
        velocity = new THREE.Vector3(flowSpeed, 0, 0); // Fallback
      }
      
      // CRITICAL: Near inlet - particles should ALWAYS move forward with full flow speed
      // Force constant velocity at inlet to prevent stuck particles
      // This must happen BEFORE RK4, because RK4 samples velocity at multiple positions
      // Also enforce minimum velocity if velocity is suspiciously low (safety check)
      let useInletVelocity = false;
      if (isNearInlet) {
        // At inlet, force constant forward velocity regardless of what velocity field returns
        // This ensures particles always start moving and don't get stuck
        velocity = new THREE.Vector3(flowSpeed, 0, 0);
        particle.lastVelocity = velocity.clone();
        useInletVelocity = true; // Flag to skip RK4 and use simple Euler
      } else if (velocity.length() < flowSpeed * 0.1) {
        // Safety check: If velocity is extremely low (<10% of flow speed), force minimum
        // This catches cases where velocity field returns near-zero values
        velocity = new THREE.Vector3(flowSpeed * 0.5, 0, 0); // At least 50% flow speed
        particle.lastVelocity = velocity.clone();
      } else {
        // Store velocity for stuck detection (only if not at inlet and not forced)
        particle.lastVelocity = velocity.clone();
      }
      
      // RK4 advection for smoother, more accurate particle motion
      // Reference: QUICK_CODE_REFERENCE.md - RK4 Integration pattern
      // CRITICAL: Use simulator or field directly - they handle position-dependent velocity
      // Only use fallback if neither is available
      // SKIP RK4 at inlet - use simple Euler with forced velocity instead
      let newPosition: THREE.Vector3;
      
      if (useInletVelocity) {
        // At inlet: Use simple Euler with forced constant velocity
        // This prevents RK4 from sampling zero/low velocities at inlet positions
        newPosition = particle.position.clone().addScaledVector(velocity, timeStep);
      } else if (simulator || field) {
        // Use RK4 with actual velocity field (simulator or field)
        // Both FluidSimulator and VelocityField implement the required interface
        const velocitySource = (simulator || field) as FluidSimulator | VelocityField;
        newPosition = ParticleAdvection.advectRK4(particle.position, velocitySource, timeStep);
      } else {
        // Fallback: Simple Euler with constant velocity (no RK4 needed for constant field)
        newPosition = particle.position.clone().addScaledVector(velocity, timeStep);
      }
      
      // Track velocity extremes
      const velocityMag = velocity.length();
      
      // Debug: Compare RK4 vs Euler to diagnose movement issue
      if (i === 0 && Math.random() < 0.01) { // 1% of frames for debugging
        const eulerPosition = particle.position.clone().addScaledVector(velocity, timeStep);
        const rk4Step = newPosition.distanceTo(particle.position);
        const eulerStep = eulerPosition.distanceTo(particle.position);
        const expectedStep = velocityMag * timeStep;
        const hasSimulator = !!simulator;
        const hasField = !!field;
        
        // Sample velocities at RK4 positions to see what's happening
        if (hasSimulator || hasField) {
          const velSource = (simulator as { sampleVelocity: (pos: THREE.Vector3) => THREE.Vector3 }) || (field as { sampleVelocity: (pos: THREE.Vector3) => THREE.Vector3 });
          const v1 = velSource.sampleVelocity(particle.position);
          const v2 = velSource.sampleVelocity(particle.position.clone().addScaledVector(v1, 0.5 * timeStep));
          const v3 = velSource.sampleVelocity(particle.position.clone().addScaledVector(v2, 0.5 * timeStep));
          const v4 = velSource.sampleVelocity(particle.position.clone().addScaledVector(v3, timeStep));
          console.log(`🔍 Movement Debug: RK4=${rk4Step.toFixed(6)} Euler=${eulerStep.toFixed(6)} Expected=${expectedStep.toFixed(6)} vel=${velocityMag.toFixed(2)}`);
          console.log(`  Velocities: v1=${v1.length().toFixed(2)} v2=${v2.length().toFixed(2)} v3=${v3.length().toFixed(2)} v4=${v4.length().toFixed(2)}`);
        } else {
          console.log(`🔍 Movement Debug: RK4=${rk4Step.toFixed(6)} Euler=${eulerStep.toFixed(6)} Expected=${expectedStep.toFixed(6)} vel=${velocityMag.toFixed(2)} (using fallback)`);
        }
      }
      minVelocity = Math.min(minVelocity, velocityMag);
      maxVelocity = Math.max(maxVelocity, velocityMag);
      totalVelocity += velocityMag;
      if (velocityMag < 0.001) {
        zeroVelocityCount++;
      }
      
      // Track position change extremes
      const positionChange = newPosition.distanceTo(particle.position);
      minPositionChange = Math.min(minPositionChange, positionChange);
      maxPositionChange = Math.max(maxPositionChange, positionChange);
      totalPositionChange += positionChange;
      if (positionChange < 0.0001) {
        staticParticleCount++;
      }
      activeParticleCount++;
      
      // CRITICAL: Check for collision AFTER advection and correct if needed
      // This prevents particles from stepping through thin geometry (like wings)
      // Enhanced with bounce physics for realistic collision response
      if (meshSDF) {
        // Phase 2: Use voxel grid if available
        const meshSDFWithVoxel = meshSDF as {
          __voxelGrid?: { queryDistance: (pos: THREE.Vector3) => number; queryGradient: (pos: THREE.Vector3) => THREE.Vector3 };
          __meshSDFInstance?: { getGradientFromBVH: (pos: THREE.Vector3) => THREE.Vector3 };
        };
        const voxelGrid = meshSDFWithVoxel.__voxelGrid;
        const newSdfValue = voxelGrid 
          ? voxelGrid.queryDistance(newPosition)
          : meshSDF(newPosition);
          
        if (newSdfValue < 0) {
          // Particle stepped into mesh during advection - push it back with bounce
          // Phase 1.1 & 2.3: Use optimized gradient computation
          const sdfInstance = meshSDFWithVoxel.__meshSDFInstance;
          let gradient: THREE.Vector3;
          
          if (voxelGrid) {
            // Phase 2: Use voxel grid gradient (precomputed or cached)
            gradient = voxelGrid.queryGradient(newPosition);
          } else if (sdfInstance && sdfInstance.getGradientFromBVH) {
            // Phase 1.2: Use BVH-based gradient (much faster)
            gradient = sdfInstance.getGradientFromBVH(newPosition);
          } else {
            // Fallback to finite differences
            const epsilon = 0.1;
            const gradX = (meshSDF(new THREE.Vector3(newPosition.x + epsilon, newPosition.y, newPosition.z)) -
                          meshSDF(new THREE.Vector3(newPosition.x - epsilon, newPosition.y, newPosition.z))) / (2 * epsilon);
            const gradY = (meshSDF(new THREE.Vector3(newPosition.x, newPosition.y + epsilon, newPosition.z)) -
                          meshSDF(new THREE.Vector3(newPosition.x, newPosition.y - epsilon, newPosition.z))) / (2 * epsilon);
            const gradZ = (meshSDF(new THREE.Vector3(newPosition.x, newPosition.y, newPosition.z + epsilon)) -
                          meshSDF(new THREE.Vector3(newPosition.x, newPosition.y, newPosition.z - epsilon))) / (2 * epsilon);
            gradient = new THREE.Vector3(gradX, gradY, gradZ);
          }
          if (gradient.length() > 0.001) {
            const normal = gradient.normalize();
            // Push particle out to surface (sdfValue = 0) plus safety margin
            const pushDistance = Math.abs(newSdfValue) + 0.5;
            newPosition.add(normal.multiplyScalar(pushDistance));
            
            // Apply bounce physics to velocity
            const collisionVelocity = particle.lastVelocity || new THREE.Vector3(flowSpeed, 0, 0);
            const normalComponent = normal.clone().multiplyScalar(collisionVelocity.dot(normal));
            const tangentComponent = collisionVelocity.clone().sub(normalComponent);
            
            const restitution = 0.5; // Increased bounce for visibility (was 0.3)
            const friction = 0.6; // Reduced friction for more visible bounce (was 0.7)
            const bounceVelocity = normalComponent.multiplyScalar(-restitution);
            const frictionVelocity = tangentComponent.multiplyScalar(friction);
            
            // Update velocity for next frame
            particle.lastVelocity = bounceVelocity.add(frictionVelocity);
          } else {
            // Can't compute gradient - revert to previous position
            newPosition.copy(particle.position);
          }
        }
      }
      
      particle.position.copy(newPosition);
    }
    
    // Update last position for stuck detection
    particle.lastPosition.copy(particle.position);

    // Update color based on velocity if enabled
    // Keep green color for newly spawned/respawned particles longer to show respawn state
    // Check age BEFORE it was incremented this frame to catch particles that just spawned
    const ageBeforeIncrement = particle.age - timeStep;
    const greenColorAge = 2.0; // Keep green for 2 seconds after spawn/respawn (increased from 0.5)
    const shouldKeepGreen = ageBeforeIncrement < greenColorAge;
    
    if (colorByVelocity && !shouldKeepGreen) {
      // Get velocity from simulator or field
      const velocity = simulator 
        ? (simulator as { sampleVelocity: (pos: THREE.Vector3) => THREE.Vector3 }).sampleVelocity(particle.position)
        : (field ? field.sampleVelocity(particle.position) : new THREE.Vector3(flowSpeed, 0, 0));
      const speed = velocity.length();
      const maxSpeed = flowSpeed * 2;

      // Color gradient from blue (slow) to red (fast)
      const hue = Math.max(0, 1 - Math.min(speed / maxSpeed, 1)) * 0.67; // 0.67 = blue hue
      particle.color.setHSL(hue, 1, 0.5);
    } else if (colorByVelocity && shouldKeepGreen) {
      // Keep green color for newly spawned/respawned particles
      particle.color.set(0.0, 1.0, 0.0);
    }

    // Store trail if enabled
    if (showTrails) {
      particle.trail.push(particle.position.clone());
      // Keep only last 50 positions for performance
      if (particle.trail.length > 50) {
        particle.trail.shift();
      }
    }

    // Boundary escape: if particle is near container boundary and moving slowly, respawn immediately
    // BUT exclude inlet area to prevent immediate respawn after spawning
    const boundaryMargin = 8.0; // Increased margin for better detection
    const isNearInletBoundary = particle.position.x < bounds.min.x + inletExclusionZone;
    
    // Only check boundaries if NOT near inlet
    if (!isNearInletBoundary) {
      const velocityMagnitude = particle.lastVelocity?.length() || flowSpeed;
      const minVelocityThreshold = flowSpeed * 0.05; // 5% of flow speed
      
      const nearBoundary = 
        particle.position.x > bounds.max.x - boundaryMargin ||
        particle.position.y < bounds.min.y + boundaryMargin ||
        particle.position.y > bounds.max.y - boundaryMargin ||
        particle.position.z < bounds.min.z + boundaryMargin ||
        particle.position.z > bounds.max.z - boundaryMargin;
      
      if (nearBoundary && velocityMagnitude < minVelocityThreshold * 3) {
        // Near boundary with low velocity - respawn immediately
        resetParticle(
          particle,
          bounds,
          flowSpeed,
          params.particleLifetime,
          spawnAreaPosition,
          spawnAreaSize,
          useObjectAwareSpawning,
          meshBounds
        );
        continue;
      }
    }

    // Out-of-bounds check (manual for plain object bounds)
    const isOutOfBounds = 
      particle.position.x < bounds.min.x || particle.position.x > bounds.max.x ||
      particle.position.y < bounds.min.y || particle.position.y > bounds.max.y ||
      particle.position.z < bounds.min.z || particle.position.z > bounds.max.z;
    if (isOutOfBounds) {
      resetParticle(
        particle,
        bounds,
        flowSpeed,
        params.particleLifetime,
        spawnAreaPosition,
        spawnAreaSize,
        useObjectAwareSpawning,
        meshBounds
      );
      continue;
    }

    // Edge clamping/respawn (excluding inlet)
    const edgeTolerance = 2.0;
    const isNearInletEdge = particle.position.x < bounds.min.x + inletExclusionZone;
    
    // Only check edges if NOT near inlet
    if (!isNearInletEdge) {
      if (particle.position.y < bounds.min.y + edgeTolerance || 
          particle.position.y > bounds.max.y - edgeTolerance ||
          particle.position.z < bounds.min.z + edgeTolerance || 
          particle.position.z > bounds.max.z - edgeTolerance) {
        // Particle is at edge - respawn instead of clamping
        resetParticle(
          particle,
          bounds,
          flowSpeed,
          params.particleLifetime,
          spawnAreaPosition,
          spawnAreaSize,
          useObjectAwareSpawning,
          meshBounds
        );
        continue;
      }
    }
  }

  // Return extreme stats
  if (activeParticleCount > 0) {
    return {
      minVelocity: minVelocity === Infinity ? 0 : minVelocity,
      maxVelocity: maxVelocity === -Infinity ? 0 : maxVelocity,
      minPositionChange: minPositionChange === Infinity ? 0 : minPositionChange,
      maxPositionChange: maxPositionChange === -Infinity ? 0 : maxPositionChange,
      zeroVelocityCount,
      staticParticleCount,
      avgVelocity: totalVelocity / activeParticleCount,
      avgPositionChange: totalPositionChange / activeParticleCount,
    };
  }
  
  return null;
}

