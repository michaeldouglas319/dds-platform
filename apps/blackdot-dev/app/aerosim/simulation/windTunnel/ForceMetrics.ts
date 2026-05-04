import * as THREE from 'three';
import { VelocityField } from './VelocityField';

/**
 * ForceMetrics - Calculate aerodynamic forces from velocity field
 * 
 * Implements multiple methods:
 * 1. Momentum balance (control volume method)
 * 2. Pressure integration (Bernoulli + surface panels)
 * 3. Drag coefficient estimation
 * 
 * Following NASA BGA and standard aerodynamics principles
 */
export class ForceMetrics {
  /**
   * Calculate drag force using momentum balance method
   * F_drag = ρ * ∫∫ (v_inlet - v_outlet) * v · n dA
   * 
   * @param velocityField - The velocity field around obstacle
   * @param flowSpeed - Reference freestream velocity
   * @param density - Fluid density (default: air at sea level)
   * @param controlVolumeSize - Size of control volume around obstacle
   */
  static calculateDragFromMomentum(
    velocityField: VelocityField,
    flowSpeed: number,
    density: number = 1.225, // kg/m³ (air at sea level)
    controlVolumeSize: number = 20.0
  ): {
    dragForce: number; // Newtons
    dragCoefficient: number; // Dimensionless
    momentumDeficit: number; // kg·m/s
  } {
    const bounds = velocityField.getBounds();
    const resolution = velocityField.getResolution();
    
    // Define control volume faces
    const inletX = bounds.min.x + controlVolumeSize;
    const outletX = bounds.max.x - controlVolumeSize;
    const centerY = (bounds.min.y + bounds.max.y) / 2;
    const centerZ = (bounds.min.z + bounds.max.z) / 2;
    
    // Sample points on inlet and outlet faces
    const samplePoints = 20; // Points per face
    let inletMomentum = 0;
    let outletMomentum = 0;
    let totalArea = 0;
    
    for (let j = 0; j < samplePoints; j++) {
      for (let k = 0; k < samplePoints; k++) {
        const y = bounds.min.y + (j / (samplePoints - 1)) * (bounds.max.y - bounds.min.y);
        const z = bounds.min.z + (k / (samplePoints - 1)) * (bounds.max.z - bounds.min.z);
        
        // Inlet face
        const inletPos = new THREE.Vector3(inletX, y, z);
        const inletVel = velocityField.sampleVelocity(inletPos);
        const inletSpeed = inletVel.length();
        inletMomentum += density * inletSpeed * inletSpeed; // ρ * v²
        
        // Outlet face
        const outletPos = new THREE.Vector3(outletX, y, z);
        const outletVel = velocityField.sampleVelocity(outletPos);
        const outletSpeed = outletVel.length();
        outletMomentum += density * outletSpeed * outletSpeed; // ρ * v²
        
        totalArea += 1;
      }
    }
    
    // Average momentum flux
    const avgInletMomentum = inletMomentum / totalArea;
    const avgOutletMomentum = outletMomentum / totalArea;
    
    // Momentum deficit = change in momentum flux
    const momentumDeficit = (avgInletMomentum - avgOutletMomentum) * totalArea;
    
    // Drag force = momentum deficit (simplified)
    const dragForce = momentumDeficit * 0.1; // Scaling factor
    
    // Reference area (cross-section of control volume)
    const referenceArea = (bounds.max.y - bounds.min.y) * (bounds.max.z - bounds.min.z);
    
    // Dynamic pressure
    const dynamicPressure = 0.5 * density * flowSpeed * flowSpeed;
    
    // Drag coefficient: C_D = F_D / (q * A)
    const dragCoefficient = dragForce / (dynamicPressure * referenceArea);
    
    return {
      dragForce,
      dragCoefficient: Math.max(0, dragCoefficient),
      momentumDeficit,
    };
  }
  
  /**
   * Calculate lift force using circulation method (Kutta-Joukowski)
   * L = ρ * V * Γ
   * 
   * @param velocityField - The velocity field
   * @param flowSpeed - Reference velocity
   * @param density - Fluid density
   * @param circulationRadius - Radius for circulation calculation
   */
  static calculateLiftFromCirculation(
    velocityField: VelocityField,
    flowSpeed: number,
    density: number = 1.225,
    circulationRadius: number = 10.0
  ): {
    liftForce: number;
    liftCoefficient: number;
    circulation: number;
  } {
    const bounds = velocityField.getBounds();
    const center = new THREE.Vector3(
      (bounds.min.x + bounds.max.x) / 2,
      (bounds.min.y + bounds.max.y) / 2,
      (bounds.min.z + bounds.max.z) / 2
    );
    
    // Calculate circulation around a circle
    const numPoints = 32;
    let circulation = 0;
    
    for (let i = 0; i < numPoints; i++) {
      const angle = (i / numPoints) * Math.PI * 2;
      const x = center.x + circulationRadius * Math.cos(angle);
      const y = center.y + circulationRadius * Math.sin(angle);
      const z = center.z;
      
      const pos = new THREE.Vector3(x, y, z);
      const velocity = velocityField.sampleVelocity(pos);
      
      // Tangential velocity component
      const tangent = new THREE.Vector3(-Math.sin(angle), Math.cos(angle), 0);
      const tangentialVel = velocity.dot(tangent);
      
      // Circulation = ∫ v · dl
      circulation += tangentialVel * (circulationRadius * 2 * Math.PI / numPoints);
    }
    
    // Lift = ρ * V * Γ
    const liftForce = density * flowSpeed * circulation;
    
    // Reference area
    const referenceArea = (bounds.max.y - bounds.min.y) * (bounds.max.z - bounds.min.z);
    const dynamicPressure = 0.5 * density * flowSpeed * flowSpeed;
    const liftCoefficient = liftForce / (dynamicPressure * referenceArea);
    
    return {
      liftForce,
      liftCoefficient,
      circulation,
    };
  }
  
  /**
   * Calculate pressure coefficient at a point
   * C_p = (p - p_∞) / (0.5 * ρ * V_∞²) = 1 - (v/V_∞)²
   * 
   * @param velocity - Local velocity
   * @param referenceVelocity - Freestream velocity
   */
  static getPressureCoefficient(velocity: number, referenceVelocity: number): number {
    if (referenceVelocity < 0.01) return 0;
    const velocityRatio = velocity / referenceVelocity;
    return 1.0 - (velocityRatio * velocityRatio);
  }
  
  /**
   * Calculate total force on cylinder using analytical potential flow
   * For cylinder: Drag = 0 (D'Alembert's paradox), but we can estimate
   * from velocity deficit in wake
   * 
   * @param velocityField - Velocity field
   * @param flowSpeed - Freestream speed
   * @param cylinderRadius - Cylinder radius
   * @param density - Fluid density
   */
  static calculateCylinderForces(
    velocityField: VelocityField,
    flowSpeed: number,
    cylinderRadius: number = 5.0,
    density: number = 1.225
  ): {
    dragForce: number;
    dragCoefficient: number;
    pressureDistribution: Array<{ angle: number; pressure: number; velocity: number }>;
  } {
    const bounds = velocityField.getBounds();
    const center = new THREE.Vector3(0, 0, 0);
    
    // Sample pressure around cylinder surface
    const numSamples = 64;
    const pressureDistribution: Array<{ angle: number; pressure: number; velocity: number }> = [];
    let totalDrag = 0;
    
    // Sample at slightly larger radius to avoid singularity
    const sampleRadius = cylinderRadius + 0.5;
    
    for (let i = 0; i < numSamples; i++) {
      const angle = (i / numSamples) * Math.PI * 2;
      const x = center.x + sampleRadius * Math.cos(angle);
      const y = center.y + sampleRadius * Math.sin(angle);
      const z = center.z;
      
      const pos = new THREE.Vector3(x, y, z);
      
      // Ensure position is within bounds
      if (!velocityField.isWithinBounds(pos)) {
        continue;
      }
      
      const velocity = velocityField.sampleVelocity(pos);
      const speed = velocity.length();
      
      // Pressure coefficient from Bernoulli: C_p = 1 - (v/V_∞)²
      const cp = this.getPressureCoefficient(speed, flowSpeed);
      const pressure = cp * 0.5 * density * flowSpeed * flowSpeed;
      
      // Drag component (pressure * normal in flow direction)
      // Normal vector points outward from cylinder
      const normalX = Math.cos(angle);
      const dragComponent = pressure * normalX;
      totalDrag += dragComponent;
      
      pressureDistribution.push({
        angle: (angle * 180) / Math.PI, // Convert to degrees
        pressure,
        velocity: speed,
      });
    }
    
    if (pressureDistribution.length === 0) {
      return {
        dragForce: 0,
        dragCoefficient: 0,
        pressureDistribution: [],
      };
    }
    
    // Average drag per unit length (integrate around cylinder)
    // For potential flow (inviscid), drag = 0 (D'Alembert's paradox)
    // But we calculate from pressure to show the distribution
    const dragPerUnitLength = (totalDrag / numSamples) * (2 * Math.PI * sampleRadius);
    
    // Reference area (cylinder cross-section per unit length = diameter)
    const referenceArea = 2 * cylinderRadius; // Diameter
    const dynamicPressure = 0.5 * density * flowSpeed * flowSpeed;
    
    // Drag coefficient: C_D = F_D / (q * A)
    // For potential flow (inviscid), C_D ≈ 0 (D'Alembert's paradox)
    // For real viscous flow, C_D ≈ 0.5-1.2 depending on Reynolds number
    let dragCoefficient = 0;
    if (dynamicPressure > 0 && Math.abs(dragPerUnitLength) > 0.001) {
      dragCoefficient = dragPerUnitLength / (dynamicPressure * referenceArea);
    } else {
      // Potential flow: zero drag, but estimate from wake velocity deficit
      // This is a simplified model - real drag requires viscous effects
      dragCoefficient = 0.0; // Inviscid flow has zero drag
    }
    
    // For visualization, show small non-zero value if calculation is near zero
    // This helps users understand that potential flow has zero drag
    const displayDragCoefficient = Math.abs(dragCoefficient) < 0.0001 
      ? 0.0 
      : Math.abs(dragCoefficient);
    
    return {
      dragForce: Math.abs(dragPerUnitLength),
      dragCoefficient: displayDragCoefficient,
      pressureDistribution,
    };
  }
  
  /**
   * Calculate wake velocity deficit
   * Useful for understanding drag and flow separation
   */
  static calculateWakeDeficit(
    velocityField: VelocityField,
    flowSpeed: number,
    downstreamDistance: number = 10.0
  ): {
    velocityDeficit: number;
    wakeWidth: number;
    momentumDeficit: number;
  } {
    const bounds = velocityField.getBounds();
    const centerY = (bounds.min.y + bounds.max.y) / 2;
    const centerZ = (bounds.min.z + bounds.min.z) / 2;
    
    // Sample along wake centerline
    const numSamples = 20;
    let maxDeficit = 0;
    let wakeWidth = 0;
    
    for (let i = 0; i < numSamples; i++) {
      const y = bounds.min.y + (i / (numSamples - 1)) * (bounds.max.y - bounds.min.y);
      const pos = new THREE.Vector3(downstreamDistance, y, centerZ);
      const velocity = velocityField.sampleVelocity(pos);
      const speed = velocity.length();
      const deficit = flowSpeed - speed;
      
      if (deficit > maxDeficit) {
        maxDeficit = deficit;
      }
      
      // Wake width: distance where deficit > 10% of max
      if (deficit > maxDeficit * 0.1) {
        wakeWidth = Math.max(wakeWidth, Math.abs(y - centerY));
      }
    }
    
    // Momentum deficit
    const momentumDeficit = 1.225 * maxDeficit * wakeWidth * wakeWidth;
    
    return {
      velocityDeficit: maxDeficit,
      wakeWidth,
      momentumDeficit,
    };
  }
}

