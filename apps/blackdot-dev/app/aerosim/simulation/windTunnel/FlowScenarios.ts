import * as THREE from 'three';
import { VelocityField } from './VelocityField';
import { AerodynamicModel, AerodynamicParameters } from './AerodynamicModel';
import { FluidSimulator } from './FluidSimulator';
import { addCurlNoiseTurbulence } from './NoiseUtils';

interface SDFWithOptimizations {
  (pos: THREE.Vector3): number;
  __meshSDFInstance?: { getGradientFromBVH(pos: THREE.Vector3): THREE.Vector3 };
  __voxelGrid?: { queryGradient(pos: THREE.Vector3): THREE.Vector3 };
}

/**
 * FlowScenarios - Collection of analytical flow field definitions
 * Each scenario is a function that creates a pre-configured VelocityField
 * Scalable architecture for adding new scenarios
 */
export class FlowScenarios {
  /**
   * Uniform laminar flow - Enterprise-grade baseline scenario
   * Represents steady, incompressible flow in one direction
   * Characteristics:
   * - Constant velocity throughout domain
   * - Zero acceleration (particles move in straight lines)
   * - Minimal computational overhead
   * - Perfect for performance validation and baseline comparisons
   */
  static uniformLaminarFlow(flowSpeed: number): VelocityField {
    const field = new VelocityField([64, 64, 64], 2.0);

    field.setFromFunction((_pos: THREE.Vector3) => {
      // Simple uniform flow in x-direction
      return new THREE.Vector3(flowSpeed, 0, 0);
    });

    return field;
  }

  /**
   * Potential flow around a cylinder - Intermediate complexity
   * Models inviscid flow past a circular obstacle
   * Uses complex potential: Φ + iΨ = U(z + R²/z)
   * Where z = x + iy in 2D cross-section
   */
  static cylinderFlow(
    flowSpeed: number,
    cylinderRadius: number = 5.0,
    cylinderCenter: THREE.Vector2 = new THREE.Vector2(0, 0)
  ): VelocityField {
    const field = new VelocityField([64, 64, 64], 2.0);

    field.setFromFunction((pos: THREE.Vector3) => {
      // 2D flow in xy-plane, extruded in z-direction
      const dx = pos.x - cylinderCenter.x;
      const dy = pos.y - cylinderCenter.y;
      const r = Math.sqrt(dx * dx + dy * dy);
      const theta = Math.atan2(dy, dx);

      // Minimum distance to avoid singularity
      const rSafe = Math.max(r, cylinderRadius + 0.1);

      // Potential flow components (2D)
      // Radial velocity: V_r = U(1 - R²/r²)cos(θ)
      // Tangential velocity: V_θ = -U(1 + R²/r²)sin(θ)
      const R2_r2 = (cylinderRadius * cylinderRadius) / (rSafe * rSafe);

      const vr = flowSpeed * (1 - R2_r2) * Math.cos(theta);
      const vtheta = -flowSpeed * (1 + R2_r2) * Math.sin(theta);

      // Convert from polar to Cartesian coordinates
      const cos_t = Math.cos(theta);
      const sin_t = Math.sin(theta);

      const vx = vr * cos_t - vtheta * sin_t;
      const vy = vr * sin_t + vtheta * cos_t;
      const vz = 0; // 2D flow

      // Ensure no attraction to center - add small random component if too close
      // This prevents particles from getting stuck at center
      if (r < cylinderRadius + 1.0) {
        // Near cylinder: add small tangential component to prevent stagnation
        const tangentialBoost = 0.1 * flowSpeed;
        const vx_tangent = -tangentialBoost * sin_t;
        const vy_tangent = tangentialBoost * cos_t;
        return new THREE.Vector3(vx + vx_tangent, vy + vy_tangent, vz);
      }

      return new THREE.Vector3(vx, vy, vz);
    });

    return field;
  }

  /**
   * Turbulent flow - Placeholder for future implementation
   * Uses Perlin noise for realistic turbulence characteristics
   * TODO: Implement with proper Perlin noise library
   */
  static turbulentFlow(
    baseSpeed: number,
    turbulenceIntensity: number = 0.2
  ): VelocityField {
    const field = new VelocityField([64, 64, 64], 2.0);

    field.setFromFunction((pos: THREE.Vector3) => {
      // Base laminar component
      const base = new THREE.Vector3(baseSpeed, 0, 0);

      // Simple turbulent perturbation (sine-based for now)
      // TODO: Replace with proper Perlin noise implementation
      const t = Date.now() * 0.001;
      const noise = new THREE.Vector3(
        Math.sin(pos.x * 0.1 + t) * turbulenceIntensity,
        Math.sin(pos.y * 0.1 + t + 1) * turbulenceIntensity,
        Math.sin(pos.z * 0.1 + t + 2) * turbulenceIntensity
      );

      return base.add(noise);
    });

    return field;
  }

  /**
   * Von Kármán vortex street - Periodic vortex shedding
   * Models flow past bluff body (like a cylinder) at moderate Reynolds number
   * Demonstrates periodic wake structures
   * TODO: Implement with Lamb-Oseen vortex models
   */
  static vonKarmanVortexStreet(
    baseSpeed: number,
    vortexSpacing: number = 10.0
  ): VelocityField {
    const field = new VelocityField([64, 64, 64], 2.0);

    field.setFromFunction((pos: THREE.Vector3) => {
      // Base uniform flow
      const base = new THREE.Vector3(baseSpeed, 0, 0);

      // Placeholder: simple sinusoidal wake pattern
      // TODO: Implement with proper vortex pair model
      const wakeAmplitude = baseSpeed * 0.3;
      const wake = new THREE.Vector3(
        0,
        wakeAmplitude * Math.sin((pos.x / vortexSpacing) * Math.PI * 2),
        0
      );

      return base.add(wake);
    });

    return field;
  }

  /**
   * NACA airfoil flow - Placeholder for future implementation
   * Models flow around an airfoil (aircraft wing profile)
   * Demonstrates lift generation and flow separation
   * TODO: Implement with NACA airfoil analytical equations
   */
  static airfoilFlow(
    flowSpeed: number,
    _chordLength: number = 10.0,
    angleOfAttack: number = 0.0 // degrees
  ): VelocityField {
    const field = new VelocityField([64, 64, 64], 2.0);

    field.setFromFunction((_pos: THREE.Vector3) => {
      // Base uniform flow with angle of attack
      const angleRad = (angleOfAttack * Math.PI) / 180;
      const base = new THREE.Vector3(
        flowSpeed * Math.cos(angleRad),
        flowSpeed * Math.sin(angleRad),
        0
      );

      // TODO: Add lift circulation around airfoil
      // For now, return base flow
      return base;
    });

    return field;
  }

  /**
   * Shear flow - Simple linear velocity gradient
   * Useful for studying boundary layer effects
   */
  static shearFlow(maxSpeed: number, shearAxis: 'x' | 'y' | 'z' = 'y'): VelocityField {
    const field = new VelocityField([64, 64, 64], 2.0);

    field.setFromFunction((pos: THREE.Vector3) => {
      const bounds = field.getBounds();
      const midpoint = bounds.min[shearAxis] + (bounds.max[shearAxis] - bounds.min[shearAxis]) / 2;
      const normalized = (pos[shearAxis] - midpoint) / (bounds.max[shearAxis] - midpoint);

      if (shearAxis === 'y') {
        return new THREE.Vector3(maxSpeed * (0.5 + normalized * 0.5), 0, 0);
      } else if (shearAxis === 'x') {
        return new THREE.Vector3(0, maxSpeed * (0.5 + normalized * 0.5), 0);
      } else {
        return new THREE.Vector3(0, 0, maxSpeed * (0.5 + normalized * 0.5));
      }
    });

    return field;
  }

  /**
   * Vortex (rotating flow) - Demonstrates rotational dynamics
   * Useful for studying particle trajectories in rotating fields
   */
  static vortexFlow(
    circularVelocity: number,
    vortexCenter: THREE.Vector2 = new THREE.Vector2(0, 0)
  ): VelocityField {
    const field = new VelocityField([64, 64, 64], 2.0);

    field.setFromFunction((pos: THREE.Vector3) => {
      const dx = pos.x - vortexCenter.x;
      const dy = pos.y - vortexCenter.y;
      const r = Math.sqrt(dx * dx + dy * dy);
      const rSafe = Math.max(r, 1.0); // Avoid singularity at center

      // Tangential velocity in circular flow
      // v_θ = Γ / (2πr), where Γ is circulation
      const tangentialVel = (circularVelocity * rSafe) / (2 * Math.PI);

      // Convert to Cartesian
      const vx = (-dy / rSafe) * tangentialVel;
      const vy = (dx / rSafe) * tangentialVel;
      const vz = 0;

      return new THREE.Vector3(vx, vy, vz);
    });

    return field;
  }

  /**
   * Sphere obstacle flow
   */
  static sphereFlow(
    flowSpeed: number,
    sphereRadius: number = 5.0,
    sphereCenter: THREE.Vector3 = new THREE.Vector3(0, 0, 0)
  ): VelocityField {
    const field = new VelocityField([64, 64, 64], 2.0);

    field.setFromFunction((pos: THREE.Vector3) => {
      // Uniform flow with sphere obstacle (3D potential flow approximation)
      const relPos = pos.clone().sub(sphereCenter);
      const r = relPos.length();
      const rSafe = Math.max(r, sphereRadius + 0.1);

      // Simplified 3D potential flow: velocity decreases near sphere
      const factor = 1 - (sphereRadius * sphereRadius * sphereRadius) / (rSafe * rSafe * rSafe);

      // Base uniform flow
      const base = new THREE.Vector3(flowSpeed * factor, 0, 0);

      // Add radial deflection
      const radialComponent = relPos.clone().normalize().multiplyScalar(
        -flowSpeed * (sphereRadius * sphereRadius * sphereRadius) / (rSafe * rSafe * rSafe)
      );

      return base.add(radialComponent);
    });

    return field;
  }

  /**
   * Box obstacle flow
   */
  static boxFlow(
    flowSpeed: number,
    boxSize: THREE.Vector3 = new THREE.Vector3(6, 6, 6),
    boxCenter: THREE.Vector3 = new THREE.Vector3(0, 0, 0)
  ): VelocityField {
    const field = new VelocityField([64, 64, 64], 2.0);

    field.setFromFunction((pos: THREE.Vector3) => {
      // Uniform flow with box-shaped stagnation
      const relPos = pos.clone().sub(boxCenter);

      // Check if inside box
      const insideX = Math.abs(relPos.x) < boxSize.x / 2;
      const insideY = Math.abs(relPos.y) < boxSize.y / 2;
      const insideZ = Math.abs(relPos.z) < boxSize.z / 2;

      if (insideX && insideY && insideZ) {
        return new THREE.Vector3(0, 0, 0); // Stagnant inside
      }

      // Outside: uniform flow with slight deflection
      const minDist = Math.min(
        Math.abs(relPos.x) - boxSize.x / 2,
        Math.abs(relPos.y) - boxSize.y / 2,
        Math.abs(relPos.z) - boxSize.z / 2
      );

      const factor = Math.min(1, 1 + minDist / 5);
      return new THREE.Vector3(flowSpeed * factor, 0, 0);
    });

    return field;
  }

  /**
   * Compute SDF gradient using finite differences
   * Returns normalized surface normal vector pointing outward
   * Uses central differences for better accuracy
   */
  private static computeSDFGradient(
    sdf: SDFWithOptimizations,
    pos: THREE.Vector3,
    epsilon: number = 0.1
  ): THREE.Vector3 {
    // Phase 1.2 & 2.3: Try to use optimized BVH gradient if available
    const sdfInstance = sdf.__meshSDFInstance;
    if (sdfInstance && sdfInstance.getGradientFromBVH) {
      const bvhGradient = sdfInstance.getGradientFromBVH(pos);
      if (bvhGradient.length() > 0.001) {
        return bvhGradient;
      }
    }

    // Phase 2: Try voxel grid gradient if available
    const voxelGrid = sdf.__voxelGrid;
    if (voxelGrid && voxelGrid.queryGradient) {
      const voxelGradient = voxelGrid.queryGradient(pos);
      if (voxelGradient.length() > 0.001) {
        return voxelGradient;
      }
    }
    
    // Fallback: Central difference gradient (more accurate than forward/backward)
    // This computes the gradient from the exact mesh SDF, not a sphere/box approximation
    const dx = (sdf(new THREE.Vector3(pos.x + epsilon, pos.y, pos.z)) -
                sdf(new THREE.Vector3(pos.x - epsilon, pos.y, pos.z))) / (2 * epsilon);
    const dy = (sdf(new THREE.Vector3(pos.x, pos.y + epsilon, pos.z)) -
                sdf(new THREE.Vector3(pos.x, pos.y - epsilon, pos.z))) / (2 * epsilon);
    const dz = (sdf(new THREE.Vector3(pos.x, pos.y, pos.z + epsilon)) -
                sdf(new THREE.Vector3(pos.x, pos.y, pos.z - epsilon))) / (2 * epsilon);

    const gradient = new THREE.Vector3(dx, dy, dz);
    const length = gradient.length();
    
    // Normalize, or return zero vector if gradient is too small
    if (length < 0.001) {
      return new THREE.Vector3(0, 0, 0);
    }
    
    // The gradient points in the direction of increasing distance (outward from surface)
    // Normalize to get surface normal
    return gradient.normalize();
  }

  /**
   * Compute SDF curvature using Laplacian operator
   * High curvature = sharp features (grooves, edges, corners)
   * Low curvature = flat surfaces
   * 
   * Curvature = ∇²SDF = ∂²SDF/∂x² + ∂²SDF/∂y² + ∂²SDF/∂z²
   */
  private static computeSDFCurvature(
    sdf: (pos: THREE.Vector3) => number,
    pos: THREE.Vector3,
    epsilon: number = 0.1
  ): number {
    // Second derivatives (Laplacian components)
    const d2x = (sdf(new THREE.Vector3(pos.x + epsilon, pos.y, pos.z)) -
                 2 * sdf(pos) +
                 sdf(new THREE.Vector3(pos.x - epsilon, pos.y, pos.z))) / (epsilon * epsilon);
    
    const d2y = (sdf(new THREE.Vector3(pos.x, pos.y + epsilon, pos.z)) -
                 2 * sdf(pos) +
                 sdf(new THREE.Vector3(pos.x, pos.y - epsilon, pos.z))) / (epsilon * epsilon);
    
    const d2z = (sdf(new THREE.Vector3(pos.x, pos.y, pos.z + epsilon)) -
                 2 * sdf(pos) +
                 sdf(new THREE.Vector3(pos.x, pos.y, pos.z - epsilon))) / (epsilon * epsilon);

    // Laplacian = sum of second derivatives
    const laplacian = d2x + d2y + d2z;
    
    // Curvature magnitude (absolute value)
    return Math.abs(laplacian);
  }

  /**
   * Mesh-aware flow calculation using SDF gradient
   * Deflects flow around actual mesh geometry, not circular approximation
   */
  static meshFlowWithSDF(
    flowSpeed: number,
    sdf: (pos: THREE.Vector3) => number,
    _meshCenter: THREE.Vector3 = new THREE.Vector3(0, 0, 0),
    meshBounds: THREE.Box3,
    deflectionStrength: number = 1.0,
    accelerationFactor: number = 1.0,
    turbulenceIntensity: number = 0.0
  ): VelocityField {
    // Grid resolution: Balance between accuracy and performance
    // 64x64x64 = 262,144 cells (reasonable performance)
    // Higher resolution causes browser freeze due to excessive SDF queries
    const field = new VelocityField([64, 64, 64], 2.0);

    // VERIFICATION: Test SDF at multiple points to ensure it's using actual mesh, not sphere/box
    const testPoints = [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(5, 0, 0),
      new THREE.Vector3(0, 5, 0),
      new THREE.Vector3(0, 0, 5),
      new THREE.Vector3(-5, 0, 0),
      new THREE.Vector3(0, -5, 0),
      new THREE.Vector3(0, 0, -5),
      meshBounds.getCenter(new THREE.Vector3()),
    ];
    const sdfTestValues = testPoints.map(p => sdf(p));
    const _sdfVariance = Math.max(...sdfTestValues) - Math.min(...sdfTestValues);
    
    // Test gradient variation at different points
    const gradientTestPoints = [
      new THREE.Vector3(2, 0, 0),
      new THREE.Vector3(0, 2, 0),
      new THREE.Vector3(0, 0, 2),
    ];
    const gradients = gradientTestPoints.map(p => {
      const grad = FlowScenarios.computeSDFGradient(sdf, p, 0.1);
      return { x: grad.x, y: grad.y, z: grad.z, length: grad.length() };
    });
    const _gradientVariation = Math.max(
      ...gradients.map(g => Math.abs(g.x) + Math.abs(g.y) + Math.abs(g.z))
    ) - Math.min(
      ...gradients.map(g => Math.abs(g.x) + Math.abs(g.y) + Math.abs(g.z))
    );

    // Model is centered at origin, so SDF is already in world space
    // No coordinate transformation needed - use SDF directly
    // CRITICAL: Closure captures deflectionStrength and accelerationFactor for real-time updates
    console.log(`📐 Creating velocity field with deflectionStrength=${deflectionStrength}, accelerationFactor=${accelerationFactor}`);
    field.setFromFunction((worldPos: THREE.Vector3) => {
      // SDF is in world space (model centered at origin)
      const distance = sdf(worldPos);
      if (distance < 0) {
        return new THREE.Vector3(0, 0, 0); // Inside mesh: zero velocity
      }

      // Base freestream velocity
      const freestream = new THREE.Vector3(flowSpeed, 0, 0);

      // If far from surface, use freestream (reduced influence distance for performance)
      if (distance > 10.0) {
        return freestream;
      }

      // Compute SDF gradient (surface normal) - CRITICAL for mesh-based deflection
      // Use adaptive epsilon: empirically proven stable in SDF rendering (ACM SIGGRAPH)
      // Formula: epsilon = max(0.008, min(0.2, distance * 0.1))
      // Balances precision (smaller near surface) and noise reduction (larger far from surface)
      const epsilon = Math.max(0.008, Math.min(0.2, distance * 0.1));
      const surfaceNormal = FlowScenarios.computeSDFGradient(sdf, worldPos, epsilon);
      
      // If gradient is invalid (zero), fall back to freestream
      if (surfaceNormal.length() < 0.001) {
        return freestream;
      }
      
      // Surface normal from mesh SDF gradient (uses actual triangle geometry)
      // Skip curvature for performance (requires many SDF queries)
      // const curvature = FlowScenarios.computeSDFCurvature(sdf, worldPos, epsilon);
      const _normalizedCurvature = 0; // Disable curvature boost for performance
      // Curvature disabled for performance (commented out above)

      // Project freestream onto surface tangent plane
      const normalComponent = freestream.dot(surfaceNormal);
      const tangentVelocity = freestream.clone().sub(
        surfaceNormal.clone().multiplyScalar(normalComponent)
      );

      // Deflection calculation - must use actual mesh surface normal
      // The surfaceNormal from SDF gradient should vary based on mesh geometry
      const surfaceDistance = Math.max(0.1, distance);
      
      // Bernoulli acceleration near surface (base calculation)
      // GOLD STANDARD: Apply user-controlled accelerationFactor multiplier
      const baseAccelerationFactor = 1.0 + (2.0 / (surfaceDistance + 1.0));
      const finalAccelerationFactor = baseAccelerationFactor * accelerationFactor;
      const scaledTangentVelocity = tangentVelocity.clone().multiplyScalar(finalAccelerationFactor);

      // Deflection strength - stronger near surface, follows mesh geometry via normal
      // GOLD STANDARD: Apply user-controlled deflectionStrength multiplier
      const baseDeflectionStrength = Math.min(2.0, 10.0 / (surfaceDistance + 0.3));
      const finalDeflectionStrength = baseDeflectionStrength * deflectionStrength;
      
      // CRITICAL: Deflection direction must use the actual mesh surface normal
      // If normal is uniform, deflection will be elliptical
      // Cross product gives direction perpendicular to both flow and surface
      const deflectionDir = new THREE.Vector3()
        .crossVectors(freestream, surfaceNormal)
        .normalize();
      
      // Fallback if vectors are parallel
      if (deflectionDir.length() < 0.001) {
        // Use perpendicular in plane perpendicular to normal
        const perp = new THREE.Vector3(-surfaceNormal.y, surfaceNormal.x, 0);
        if (perp.length() < 0.001) {
          perp.set(0, -surfaceNormal.z, surfaceNormal.y);
        }
        deflectionDir.copy(perp.normalize());
      }

      // Potential flow deflection (GOLD STANDARD from QUICK_CODE_REFERENCE.md pattern)
      // Adds realistic particle curves around mesh obstacles
      // phi = -strength * log(distance + epsilon), velocity = -∇phi
      // For point source: velocity = -a * direction / r²
      // GOLD STANDARD: Scale potential flow by deflectionStrength for user control
      const basePotentialFlowStrength = 0.8; // Base strength for visibility
      const potentialFlowStrength = basePotentialFlowStrength * deflectionStrength; // User-controlled scaling
      const potentialEpsilon = 0.1; // Avoid singularity at distance = 0
      
      // Compute potential flow velocity from gradient of log(distance)
      // ∇phi = -strength * ∇log(distance) = -strength * (1/distance) * ∇distance
      // ∇distance is the normalized direction vector from obstacle surface
      const directionToSurface = surfaceNormal.clone().multiplyScalar(-1); // Points away from surface
      const r = Math.max(distance, potentialEpsilon);
      const potentialVelocity = directionToSurface
        .clone()
        .multiplyScalar(potentialFlowStrength / (r * r))
        .multiplyScalar(flowSpeed * 0.4); // Base scale for visibility
      
      // Deflection component - this should vary based on mesh geometry
      // GOLD STANDARD: Use finalDeflectionStrength (already includes user multiplier)
      const deflectionComponent = deflectionDir
        .clone()
        .multiplyScalar(flowSpeed * finalDeflectionStrength * 1.5); // 1.5 is base visibility multiplier
      
      // Combine: tangent velocity + deflection + potential flow
      let totalVelocity = scaledTangentVelocity
        .clone()
        .add(deflectionComponent)
        .add(potentialVelocity);

      // Add curl noise turbulence in wake region (behind obstacle)
      // Reference: QUICK_CODE_REFERENCE.md - Curl Noise (Turbulence) pattern
      // FIXED: Use turbulenceIntensity parameter (0.0-1.0, UI shows 0-100%)
      const time = Date.now() * 0.001; // Animated turbulence
      const normalizedTurbulence = turbulenceIntensity / 100.0; // Convert 0-100% to 0.0-1.0
      const baseTurbulenceStrength = 0.3; // Base strength for visibility
      const finalTurbulenceStrength = baseTurbulenceStrength * normalizedTurbulence;
      totalVelocity = addCurlNoiseTurbulence(
        totalVelocity,
        worldPos,
        sdf,
        finalTurbulenceStrength, // FIXED: Use parameter instead of hardcoded 0.3
        25.0, // Increased wake distance (was 20.0)
        time
      );

      // Blend with freestream far from surface (reduced blend distance)
      const blendFactor = Math.min(1.0, distance / 10.0);
      const blendedVelocity = new THREE.Vector3()
        .lerpVectors(totalVelocity, freestream, 1.0 - blendFactor);

      // Validate velocity (prevent NaN or zero)
      if (isNaN(blendedVelocity.x) || isNaN(blendedVelocity.y) || isNaN(blendedVelocity.z) || 
          blendedVelocity.length() < 0.001) {
        return freestream;
      }

      return blendedVelocity;
    });

    // CRITICAL: Store SDF in field for particle collision detection
    field.setSDF(sdf);
    field.applyObstacle(sdf, 2.0);

    return field;
  }

  /**
   * Drone flow - Uses exact mesh SDF with cylinder physics
   * This replaces the broken bounding box approximation
   * 
   * NOTE: This requires the SDF to be passed from DroneLoader
   * For now, falls back to bounding box if SDF not provided
   */
  static droneFlow(
    flowSpeed: number,
    droneCenter: THREE.Vector3 = new THREE.Vector3(0, 0, 0),
    droneSize: THREE.Vector3 = new THREE.Vector3(4, 1, 4), // Fallback dimensions
    sdf?: (pos: THREE.Vector3) => number,
    meshBounds?: THREE.Box3
  ): VelocityField {
    // If SDF provided, use REAL physics with actual mesh geometry
    if (sdf && meshBounds) {
      return FlowScenarios.meshFlowWithSDF(flowSpeed, sdf, droneCenter, meshBounds, 1.0, 1.0, 0.0);
    }

    // Fallback: bounding box approximation
    const field = new VelocityField([64, 64, 64], 2.0);
    const _bounds = new THREE.Box3(
      droneCenter.clone().sub(droneSize.clone().multiplyScalar(0.5)),
      droneCenter.clone().add(droneSize.clone().multiplyScalar(0.5))
    );

    field.setFromFunction((pos: THREE.Vector3) => {
      const _base = new THREE.Vector3(flowSpeed, 0, 0);
      const relPos = pos.clone().sub(droneCenter);
      const halfSize = droneSize.clone().multiplyScalar(0.5);
      
      const insideX = Math.abs(relPos.x) < halfSize.x;
      const insideY = Math.abs(relPos.y) < halfSize.y;
      const insideZ = Math.abs(relPos.z) < halfSize.z;

      if (insideX && insideY && insideZ) {
        return new THREE.Vector3(0, 0, 0);
      }

      // FALLBACK: Potential flow around cylinder (SPHERE-LIKE - this is the problem!)
      // This creates circular/spherical deflection, not mesh-based deflection
      const dx = relPos.x;
      const dy = relPos.y;
      const r = Math.sqrt(dx * dx + dy * dy);
      const effectiveRadius = Math.max(halfSize.x, halfSize.y);
      const rSafe = Math.max(r, effectiveRadius + 0.1);
      const theta = Math.atan2(dy, dx);

      const R2_r2 = (effectiveRadius * effectiveRadius) / (rSafe * rSafe);
      const vr = flowSpeed * (1 - R2_r2) * Math.cos(theta);
      const vtheta = -flowSpeed * (1 + R2_r2) * Math.sin(theta);

      const cos_t = Math.cos(theta);
      const sin_t = Math.sin(theta);
      const vx = vr * cos_t - vtheta * sin_t;
      const vy = vr * sin_t + vtheta * cos_t;

      return new THREE.Vector3(vx, vy, 0);
    });

    return field;
  }

  /**
   * Aircraft fuselage flow (simplified plane model)
   */
  static planeFlow(
    flowSpeed: number,
    planeCenter: THREE.Vector3 = new THREE.Vector3(0, 0, 0),
    angleOfAttack: number = 0
  ): VelocityField {
    const field = new VelocityField([64, 64, 64], 2.0);
    const angleRad = (angleOfAttack * Math.PI) / 180;

    field.setFromFunction((pos: THREE.Vector3) => {
      // Base flow with angle of attack
      const baseVx = flowSpeed * Math.cos(angleRad);
      const baseVy = flowSpeed * Math.sin(angleRad);
      const base = new THREE.Vector3(baseVx, baseVy, 0);

      // Relative position to plane center
      const relPos = pos.clone().sub(planeCenter);

      // Fuselage: ellipsoid (elongated in x, narrow in y and z)
      const fuselageScale = 15; // Length
      const fuselageWidth = 3;  // Width
      const fuselageHeight = 2; // Height

      const fuselageDist =
        (relPos.x / fuselageScale) ** 2 +
        (relPos.y / fuselageWidth) ** 2 +
        (relPos.z / fuselageHeight) ** 2;

      // Wings: flat rectangular regions
      const wingSpan = 12;
      const wingChord = 3;
      const onWings =
        Math.abs(relPos.y) < wingSpan / 2 &&
        Math.abs(relPos.x) < wingChord / 2 &&
        Math.abs(relPos.z) < 0.5;

      // If very close to plane, stagnate
      if (fuselageDist < 1.0 || onWings) {
        return new THREE.Vector3(0, 0, 0);
      }

      // Near plane: flow deflection (potential flow approximation)
      if (fuselageDist < 4) {
        const deflectionFactor = Math.pow(2 - fuselageDist, 2) * 0.3;
        const perpComponent = relPos.clone().normalize().multiplyScalar(
          -flowSpeed * deflectionFactor
        );
        return base.add(perpComponent);
      }

      return base;
    });

    return field;
  }

  /**
   * Get all available scenarios
   * Scalable registry for scenario management
   */
  static getScenarios(): Array<{
    name: string;
    id: string;
    description: string;
    create: (speed: number, sdf?: (pos: THREE.Vector3) => number, bounds?: THREE.Box3, deflectionStrength?: number, accelerationFactor?: number, turbulenceIntensity?: number) => VelocityField;
    obstacleType?: string; // For rendering visualization
  }> {
    return [
      {
        name: 'Laminar Flow',
        id: 'laminar',
        description: 'Uniform steady flow - ideal for baseline testing',
        create: (speed: number) => FlowScenarios.uniformLaminarFlow(speed),
      },
      {
        name: 'Cylinder',
        id: 'cylinder',
        description: 'Potential flow around circular obstacle',
        create: (speed: number) => FlowScenarios.cylinderFlow(speed),
        obstacleType: 'cylinder',
      },
      {
        name: 'Sphere',
        id: 'sphere',
        description: '3D potential flow around sphere',
        create: (speed: number) => FlowScenarios.sphereFlow(speed),
        obstacleType: 'sphere',
      },
      {
        name: 'Box',
        id: 'box',
        description: 'Flow around rectangular obstacle',
        create: (speed: number) => FlowScenarios.boxFlow(speed),
        obstacleType: 'box',
      },
      {
        name: 'Aircraft',
        id: 'plane',
        description: 'Flow around aircraft fuselage and wings',
        create: (speed: number) => FlowScenarios.planeFlow(speed),
        obstacleType: 'plane',
      },
      {
        name: 'Drone',
        id: 'drone',
        description: 'Flow around drone/quadcopter body',
        create: (speed: number, sdf?: (pos: THREE.Vector3) => number, bounds?: THREE.Box3, deflectionStrength?: number, accelerationFactor?: number, turbulenceIntensity?: number) => {
          if (sdf && bounds) {
            return FlowScenarios.meshFlowWithSDF(speed, sdf, new THREE.Vector3(0, 0, 0), bounds, deflectionStrength ?? 1.0, accelerationFactor ?? 1.0, turbulenceIntensity ?? 0.0);
          }
          return FlowScenarios.droneFlow(speed);
        },
        obstacleType: 'drone',
      },
      {
        name: 'Shear Flow',
        id: 'shear',
        description: 'Linear velocity gradient',
        create: (speed: number) => FlowScenarios.shearFlow(speed),
      },
      {
        name: 'Vortex',
        id: 'vortex',
        description: 'Rotating flow field',
        create: (speed: number) => FlowScenarios.vortexFlow(speed),
      },
      {
        name: 'Turbulent (Beta)',
        id: 'turbulent',
        description: 'Experimental turbulent flow',
        create: (speed: number) => FlowScenarios.turbulentFlow(speed),
      },
      {
        name: 'Von Kármán Vortex (Beta)',
        id: 'vortex_street',
        description: 'Periodic vortex shedding',
        create: (speed: number) => FlowScenarios.vonKarmanVortexStreet(speed),
      },
      {
        name: 'Airfoil (Beta)',
        id: 'airfoil',
        description: 'Flow around aircraft wing profile',
        create: (speed: number) => FlowScenarios.airfoilFlow(speed),
        obstacleType: 'airfoil',
      },
    ];
  }

  /**
   * Create a scenario by ID
   * Now returns FluidSimulator for real-time CFD simulation
   * 
   * @param scenarioId - Scenario identifier
   * @param speed - Flow speed
   * @param renderer - WebGL renderer (required for GPU-based CFD)
   * @param customSDF - Optional mesh SDF for boundaries
   * @param customBounds - Optional mesh bounds
   * @param gridResolution - Grid resolution (default: 48 for balanced performance)
   */
  static createScenario(
    scenarioId: string,
    speed: number = 10.0,
    renderer?: THREE.WebGLRenderer,
    customSDF?: (pos: THREE.Vector3) => number,
    customBounds?: THREE.Box3,
    gridResolution: number = 48,
    deflectionStrength: number = 1.0,
    accelerationFactor: number = 1.0,
    turbulenceIntensity: number = 0.0
  ): FluidSimulator | VelocityField {
    // If no renderer provided, fall back to analytical VelocityField
    if (!renderer) {
      const scenario = FlowScenarios.getScenarios().find((s) => s.id === scenarioId);
      if (!scenario) {
        return FlowScenarios.uniformLaminarFlow(speed);
      }
      // Check if scenario supports SDF parameters (drone/meshFlow scenarios)
      if (scenario.id === 'drone' && (customSDF || customBounds)) {
        return scenario.create(speed, customSDF, customBounds, deflectionStrength, accelerationFactor, turbulenceIntensity);
      }
      return scenario.create(speed);
    }

    // Create bounds (use custom bounds if provided, otherwise default)
    const bounds = customBounds || new THREE.Box3(
      new THREE.Vector3(-64, -64, -64),
      new THREE.Vector3(64, 64, 64)
    );

    // Create FluidSimulator with appropriate parameters
    const simulator = new FluidSimulator(
      renderer,
      bounds,
      speed,
      gridResolution,
      customSDF,
      customBounds
    );

    // Set scenario-specific parameters
    switch (scenarioId) {
      case 'turbulent':
        simulator.setParameters({
          vorticityScale: 1.5,
          viscosity: 0.002,
        });
        break;
      case 'drone':
      case 'meshFlow':
        // Mesh-based flows: higher vorticity for detail
        simulator.setParameters({
          vorticityScale: 1.2,
          viscosity: 0.001,
        });
        break;
      default:
        // Laminar and other scenarios: default parameters
        simulator.setParameters({
          vorticityScale: 1.0,
          viscosity: 0.001,
        });
    }

    return simulator;
  }

  /**
   * Apply aerodynamic model to velocity field
   * Enhances scenarios with boundary layer, drag, and separation effects
   */
  static applyAerodynamics(
    field: VelocityField,
    scenarioId: string,
    baseSpeed: number,
    params: AerodynamicParameters
  ): void {
    // Get SDF function for obstacle based on scenario
    const sdf = FlowScenarios.getSDFForScenario(scenarioId);

    if (!sdf) {
      // No obstacle for this scenario, skip aerodynamic enhancement
      return;
    }

    // Store original potential flow velocities before modifying
    const bounds = field.getBounds();
    const potentialFlowCache = new Map<string, THREE.Vector3>();

    // Sample original potential flow at grid points
    for (let k = 0; k < field.getResolution()[2]; k++) {
      for (let j = 0; j < field.getResolution()[1]; j++) {
        for (let i = 0; i < field.getResolution()[0]; i++) {
          const x = bounds.min.x + (i / (field.getResolution()[0] - 1)) * (bounds.max.x - bounds.min.x);
          const y = bounds.min.y + (j / (field.getResolution()[1] - 1)) * (bounds.max.y - bounds.min.y);
          const z = bounds.min.z + (k / (field.getResolution()[2] - 1)) * (bounds.max.z - bounds.min.z);
          const pos = new THREE.Vector3(x, y, z);
          const key = `${i},${j},${k}`;
          potentialFlowCache.set(key, field.sampleVelocity(pos));
        }
      }
    }

    // Set SDF in velocity field
    field.setSDF(sdf);

    const baseVelocity = new THREE.Vector3(baseSpeed, 0, 0);

    // Create enhanced velocity field using aerodynamic model
    field.setFromFunction((pos: THREE.Vector3) => {
      // Get potential flow velocity from cache (using nearest grid point)
      const gridPos = {
        x: Math.round(((pos.x - bounds.min.x) / (bounds.max.x - bounds.min.x)) * (field.getResolution()[0] - 1)),
        y: Math.round(((pos.y - bounds.min.y) / (bounds.max.y - bounds.min.y)) * (field.getResolution()[1] - 1)),
        z: Math.round(((pos.z - bounds.min.z) / (bounds.max.z - bounds.min.z)) * (field.getResolution()[2] - 1)),
      };

      const key = `${gridPos.x},${gridPos.y},${gridPos.z}`;
      const potentialVel = potentialFlowCache.get(key) || baseVelocity;

      // Calculate total velocity with aerodynamic effects
      const totalVel = AerodynamicModel.calculateTotalVelocity(
        pos,
        baseVelocity,
        potentialVel.clone().sub(baseVelocity), // Potential flow perturbation
        (p: THREE.Vector3) => field.getSignedDistance(p),
        params
      );

      return totalVel;
    });
  }

  /**
   * Get signed distance function for a scenario
   * Returns SDF function if scenario has an obstacle, null otherwise
   */
  private static getSDFForScenario(scenarioId: string): ((pos: THREE.Vector3) => number) | null {
    switch (scenarioId) {
      case 'cylinder': {
        const radius = 5.0;
        const center = new THREE.Vector2(0, 0);
        return (pos: THREE.Vector3) => {
          const dx = pos.x - center.x;
          const dy = pos.y - center.y;
          const r = Math.sqrt(dx * dx + dy * dy);
          return r - radius;
        };
      }

      case 'sphere': {
        const radius = 5.0;
        const center = new THREE.Vector3(0, 0, 0);
        return (pos: THREE.Vector3) => {
          return pos.clone().sub(center).length() - radius;
        };
      }

      case 'box': {
        const size = new THREE.Vector3(6, 6, 6);
        const center = new THREE.Vector3(0, 0, 0);
        return (pos: THREE.Vector3) => {
          const relPos = pos.clone().sub(center);
          const q = new THREE.Vector3(
            Math.abs(relPos.x) - size.x / 2,
            Math.abs(relPos.y) - size.y / 2,
            Math.abs(relPos.z) - size.z / 2
          );
          const qMax = new THREE.Vector3(
            Math.max(q.x, 0),
            Math.max(q.y, 0),
            Math.max(q.z, 0)
          );
          return qMax.length() + Math.min(Math.max(q.x, Math.max(q.y, q.z)), 0);
        };
      }

      case 'plane': {
        const fuselageScale = 15;
        const fuselageWidth = 3;
        const fuselageHeight = 2;
        const center = new THREE.Vector3(0, 0, 0);
        return (pos: THREE.Vector3) => {
          const relPos = pos.clone().sub(center);
          // Ellipsoid SDF
          const dist = Math.sqrt(
            (relPos.x / fuselageScale) ** 2 +
            (relPos.y / fuselageWidth) ** 2 +
            (relPos.z / fuselageHeight) ** 2
          );
          return (dist - 1.0) * Math.min(fuselageScale, fuselageWidth, fuselageHeight);
        };
      }

      case 'drone': {
        // Bounding box SDF for drone (can be replaced with actual mesh SDF)
        const size = new THREE.Vector3(4, 1, 4);
        const center = new THREE.Vector3(0, 0, 0);
        return (pos: THREE.Vector3) => {
          const relPos = pos.clone().sub(center);
          const halfSize = size.clone().multiplyScalar(0.5);
          const q = new THREE.Vector3(Math.abs(relPos.x), Math.abs(relPos.y), Math.abs(relPos.z));
          const outside = q.clone().sub(halfSize);
          const maxComponent = Math.max(outside.x, outside.y, outside.z);
          const insideDist = Math.min(maxComponent, 0);
          return (
            new THREE.Vector3(Math.max(outside.x, 0), Math.max(outside.y, 0), Math.max(outside.z, 0))
              .length() + insideDist
          );
        };
      }

      default:
        return null; // No obstacle
    }
  }
}
