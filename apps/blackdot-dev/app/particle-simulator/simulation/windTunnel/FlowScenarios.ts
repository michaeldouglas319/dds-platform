import * as THREE from 'three';
import { VelocityField } from './VelocityField';
import { AerodynamicModel, AerodynamicParameters } from './AerodynamicModel';

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

    field.setFromFunction((pos: THREE.Vector3) => {
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
    chordLength: number = 10.0,
    angleOfAttack: number = 0.0 // degrees
  ): VelocityField {
    const field = new VelocityField([64, 64, 64], 2.0);

    field.setFromFunction((pos: THREE.Vector3) => {
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
   * Compute SDF gradient using finite differences with ADAPTIVE EPSILON
   * Returns normalized surface normal vector pointing outward
   * Uses central differences for better accuracy
   *
   * OPTIMIZED: Adapts epsilon based on distance for accurate surface normals
   */
  private static computeSDFGradient(
    sdf: (pos: THREE.Vector3) => number,
    pos: THREE.Vector3,
    epsilon: number = 0.1
  ): THREE.Vector3 {
    // Central difference gradient - samples 6 points around position
    // More stable than forward differences, better accuracy near surface features
    const dx = (sdf(new THREE.Vector3(pos.x + epsilon, pos.y, pos.z)) -
                sdf(new THREE.Vector3(pos.x - epsilon, pos.y, pos.z))) / (2 * epsilon);
    const dy = (sdf(new THREE.Vector3(pos.x, pos.y + epsilon, pos.z)) -
                sdf(new THREE.Vector3(pos.x, pos.y - epsilon, pos.z))) / (2 * epsilon);
    const dz = (sdf(new THREE.Vector3(pos.x, pos.y, pos.z + epsilon)) -
                sdf(new THREE.Vector3(pos.x, pos.y, pos.z - epsilon))) / (2 * epsilon);

    const gradient = new THREE.Vector3(dx, dy, dz);
    const length = gradient.length();

    // Normalize or return zero if too small
    if (length < 0.001) {
      return new THREE.Vector3(0, 0, 0);
    }

    return gradient.normalize();
  }

  /**
   * Compute second-order SDF information (curvature approximation)
   * Used to detect surface features and grooves
   */
  private static computeSDFCurvature(
    sdf: (pos: THREE.Vector3) => number,
    pos: THREE.Vector3,
    epsilon: number = 0.1
  ): number {
    // Compute Laplacian (divergence of gradient) = curvature indicator
    // High values = sharp features (grooves, edges)
    const center = sdf(pos);
    const dx = sdf(new THREE.Vector3(pos.x + epsilon, pos.y, pos.z)) +
               sdf(new THREE.Vector3(pos.x - epsilon, pos.y, pos.z)) - 2 * center;
    const dy = sdf(new THREE.Vector3(pos.x, pos.y + epsilon, pos.z)) +
               sdf(new THREE.Vector3(pos.x, pos.y - epsilon, pos.z)) - 2 * center;
    const dz = sdf(new THREE.Vector3(pos.x, pos.y, pos.z + epsilon)) +
               sdf(new THREE.Vector3(pos.x, pos.y, pos.z - epsilon)) - 2 * center;

    // Laplacian = curvature magnitude
    return (dx + dy + dz) / (epsilon * epsilon);
  }

  /**
   * ENTERPRISE-GRADE Mesh-aware flow calculation using SDF gradient
   *
   * Physics-based deflection that realistically models flow around actual mesh geometry
   * Combines:
   * - Potential flow theory (inviscid deflection)
   * - Boundary layer effects (viscous interaction)
   * - Curvature-aware acceleration (grooves and surface features)
   * - Surface slip direction (particles follow mesh contours)
   *
   * Result: Particles naturally deflect around mesh and settle in grooves
   */
  static meshFlowWithSDF(
    flowSpeed: number,
    sdf: (pos: THREE.Vector3) => number,
    meshCenter: THREE.Vector3 = new THREE.Vector3(0, 0, 0),
    meshBounds: THREE.Box3
  ): VelocityField {
    // HIGH RESOLUTION field to capture mesh surface details
    const field = new VelocityField([128, 128, 128], 1.0);

    // Pre-compute mesh characteristics for flow calculations
    const meshSize = meshBounds.getSize(new THREE.Vector3());
    const meshVolume = meshSize.x * meshSize.y * meshSize.z;
    const characteristicLength = Math.cbrt(meshVolume); // Cube root for 3D

    field.setFromFunction((pos: THREE.Vector3) => {
      // === PHASE 1: Check collision ===
      const distance = sdf(pos);
      if (distance < 0) {
        return new THREE.Vector3(0, 0, 0); // Inside mesh: no flow
      }

      // === BASE FLOW ===
      const freestream = new THREE.Vector3(flowSpeed, 0, 0);

      // Far field: pure freestream (no deflection)
      if (distance > characteristicLength * 0.8) {
        return freestream;
      }

      // === PHASE 2: Compute surface geometry information ===
      // Use ADAPTIVE EPSILON: finer near surface for accurate gradients
      const epsilon = Math.max(0.008, Math.min(0.06, distance * 0.08));
      const surfaceNormal = FlowScenarios.computeSDFGradient(sdf, pos, epsilon);

      if (surfaceNormal.length() < 0.001) {
        return freestream; // Gradient too small, fallback to freestream
      }

      // Compute surface curvature (Laplacian of SDF)
      // High curvature = sharp features (grooves, edges)
      // Low curvature = flat surfaces
      const curvature = Math.abs(FlowScenarios.computeSDFCurvature(sdf, pos, epsilon));

      // === PHASE 3: Potential flow around surface ===
      // Project freestream onto tangent plane (standard potential flow)
      const normalComponent = freestream.dot(surfaceNormal);
      const tangentVelocity = freestream.clone().sub(
        surfaceNormal.clone().multiplyScalar(normalComponent)
      );

      // === PHASE 4: Bernoulli acceleration (pressure effect) ===
      // Near surface, flow accelerates (low pressure zone)
      // Stronger in high-curvature regions (grooves)
      const normalizedDistance = distance / characteristicLength;
      const bernoulliIntensity = 1.0 + (2.5 / (normalizedDistance + 0.2));

      // Curvature modulation: sharper features → stronger acceleration
      const curvatureFactor = 1.0 + curvature * 0.1; // Boost in grooves
      const accelerationFactor = bernoulliIntensity * curvatureFactor;

      tangentVelocity.multiplyScalar(accelerationFactor);

      // === PHASE 5: Transverse deflection (flow curves around object) ===
      // Flow should not just slide along surface, but curve around it
      const deflectionStrength = Math.min(
        1.0,
        6.0 / (normalizedDistance + 0.15)
      );

      // Deflection direction: perpendicular to both normal and freestream
      const deflectionDir = new THREE.Vector3()
        .crossVectors(freestream, surfaceNormal)
        .normalize();

      // Fallback if cross product fails (parallel vectors)
      if (deflectionDir.length() < 0.001) {
        deflectionDir.set(-surfaceNormal.y, surfaceNormal.x, 0).normalize();
      }

      // Enhanced deflection strength in curved regions
      const deflectionMagnitude = flowSpeed * deflectionStrength * 0.4 * curvatureFactor;
      const deflectionComponent = deflectionDir.clone().multiplyScalar(deflectionMagnitude);

      // === PHASE 6: Combine all velocity components ===
      const totalVelocity = tangentVelocity.add(deflectionComponent);

      // === PHASE 7: Smooth transition to freestream ===
      // Keep particles in strong interaction zone (near surface)
      // for realistic groove/surface feature interaction
      const transitionDistance = characteristicLength * 0.35;
      const blendFactor = Math.min(1.0, distance / transitionDistance);

      // Inverse blend: stronger effect near surface
      const blendedVelocity = new THREE.Vector3()
        .lerpVectors(totalVelocity, freestream, 1.0 - blendFactor);

      return blendedVelocity;
    });

    // Store SDF and apply obstacle boundary condition
    field.setSDF(sdf);
    field.applyObstacle(sdf, 0.8); // Tighter boundary for accurate surface interaction

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
    // If SDF provided, use REAL physics
    if (sdf && meshBounds) {
      return FlowScenarios.meshFlowWithSDF(flowSpeed, sdf, droneCenter, meshBounds);
    }

    // Fallback: bounding box approximation (for backward compatibility)
    // This is the OLD broken code - should be replaced when SDF is available
    const field = new VelocityField([64, 64, 64], 2.0);
    const bounds = new THREE.Box3(
      droneCenter.clone().sub(droneSize.clone().multiplyScalar(0.5)),
      droneCenter.clone().add(droneSize.clone().multiplyScalar(0.5))
    );

    field.setFromFunction((pos: THREE.Vector3) => {
      const base = new THREE.Vector3(flowSpeed, 0, 0);
      const relPos = pos.clone().sub(droneCenter);
      const halfSize = droneSize.clone().multiplyScalar(0.5);
      
      const insideX = Math.abs(relPos.x) < halfSize.x;
      const insideY = Math.abs(relPos.y) < halfSize.y;
      const insideZ = Math.abs(relPos.z) < halfSize.z;

      if (insideX && insideY && insideZ) {
        return new THREE.Vector3(0, 0, 0);
      }

      // Use potential flow approximation (better than random vectors)
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
    create: (speed: number, sdf?: (pos: THREE.Vector3) => number, bounds?: THREE.Box3) => VelocityField;
    obstacleType?: string; // For rendering visualization
  }> {
    return [
      {
        name: 'Laminar Flow',
        id: 'laminar',
        description: 'Uniform steady flow - ideal for baseline testing',
        create: (speed: number, _sdf?: (pos: THREE.Vector3) => number, _bounds?: THREE.Box3) => FlowScenarios.uniformLaminarFlow(speed),
      },
      {
        name: 'Cylinder',
        id: 'cylinder',
        description: 'Potential flow around circular obstacle',
        create: (speed: number, _sdf?: (pos: THREE.Vector3) => number, _bounds?: THREE.Box3) => FlowScenarios.cylinderFlow(speed),
        obstacleType: 'cylinder',
      },
      {
        name: 'Sphere',
        id: 'sphere',
        description: '3D potential flow around sphere',
        create: (speed: number, _sdf?: (pos: THREE.Vector3) => number, _bounds?: THREE.Box3) => FlowScenarios.sphereFlow(speed),
        obstacleType: 'sphere',
      },
      {
        name: 'Box',
        id: 'box',
        description: 'Flow around rectangular obstacle',
        create: (speed: number, _sdf?: (pos: THREE.Vector3) => number, _bounds?: THREE.Box3) => FlowScenarios.boxFlow(speed),
        obstacleType: 'box',
      },
      {
        name: 'Aircraft',
        id: 'plane',
        description: 'Flow around aircraft fuselage and wings',
        create: (speed: number, _sdf?: (pos: THREE.Vector3) => number, _bounds?: THREE.Box3) => FlowScenarios.planeFlow(speed),
        obstacleType: 'plane',
      },
      {
        name: 'Drone',
        id: 'drone',
        description: 'Flow around drone/quadcopter body',
        create: (speed: number, sdf?: (pos: THREE.Vector3) => number, bounds?: THREE.Box3) => {
          if (sdf && bounds) {
            console.log('✅ Drone scenario: Using ACTUAL MESH SDF (not bounding box approximation)');
            return FlowScenarios.meshFlowWithSDF(speed, sdf, new THREE.Vector3(0, 0, 0), bounds);
          }
          return FlowScenarios.droneFlow(speed);
        },
        obstacleType: 'drone',
      },
      {
        name: 'Shear Flow',
        id: 'shear',
        description: 'Linear velocity gradient',
        create: (speed: number, _sdf?: (pos: THREE.Vector3) => number, _bounds?: THREE.Box3) => FlowScenarios.shearFlow(speed),
      },
      {
        name: 'Vortex',
        id: 'vortex',
        description: 'Rotating flow field',
        create: (speed: number, _sdf?: (pos: THREE.Vector3) => number, _bounds?: THREE.Box3) => FlowScenarios.vortexFlow(speed),
      },
      {
        name: 'Turbulent (Beta)',
        id: 'turbulent',
        description: 'Experimental turbulent flow',
        create: (speed: number, _sdf?: (pos: THREE.Vector3) => number, _bounds?: THREE.Box3) => FlowScenarios.turbulentFlow(speed),
      },
      {
        name: 'Von Kármán Vortex (Beta)',
        id: 'vortex_street',
        description: 'Periodic vortex shedding',
        create: (speed: number, _sdf?: (pos: THREE.Vector3) => number, _bounds?: THREE.Box3) => FlowScenarios.vonKarmanVortexStreet(speed),
      },
      {
        name: 'Airfoil (Beta)',
        id: 'airfoil',
        description: 'Flow around aircraft wing profile',
        create: (speed: number, _sdf?: (pos: THREE.Vector3) => number, _bounds?: THREE.Box3) => FlowScenarios.airfoilFlow(speed),
        obstacleType: 'airfoil',
      },
    ];
  }

  /**
   * Create a scenario by ID
   * Convenient factory method
   * 
   * @param scenarioId - Scenario identifier
   * @param speed - Flow speed
   * @param aerodynamicParams - Optional aerodynamic parameters for enhanced physics
   */
  static createScenario(
    scenarioId: string,
    speed: number = 10.0,
    aerodynamicParams?: AerodynamicParameters,
    customSDF?: (pos: THREE.Vector3) => number,
    customBounds?: THREE.Box3
  ): VelocityField {
    const scenario = FlowScenarios.getScenarios().find((s) => s.id === scenarioId);
    if (!scenario) {
      console.warn(`Unknown scenario: ${scenarioId}, defaulting to laminar`);
      return FlowScenarios.uniformLaminarFlow(speed);
    }

    const field = scenario.create(speed, customSDF, customBounds);

    // Apply aerodynamic model if parameters provided
    if (aerodynamicParams) {
      FlowScenarios.applyAerodynamics(field, scenarioId, speed, aerodynamicParams);
    }

    return field;
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
