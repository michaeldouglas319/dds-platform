import * as THREE from 'three';
import { VelocityField } from './VelocityField';

/**
 * ParticleAdvection - Numerical integration methods for particle advection
 * Implements both RK4 (accurate) and Euler (fast) integration schemes
 */
export class ParticleAdvection {
  /**
   * RK4 (4th order Runge-Kutta) integration - Most accurate
   * Advects a particle position through a velocity field
   */
  static advectRK4(
    position: THREE.Vector3,
    velocityField: VelocityField,
    dt: number
  ): THREE.Vector3 {
    // k1 = V(p)
    const k1 = velocityField.sampleVelocity(position);

    // k2 = V(p + 0.5*dt*k1)
    const p2 = position.clone().addScaledVector(k1, 0.5 * dt);
    const k2 = velocityField.sampleVelocity(p2);

    // k3 = V(p + 0.5*dt*k2)
    const p3 = position.clone().addScaledVector(k2, 0.5 * dt);
    const k3 = velocityField.sampleVelocity(p3);

    // k4 = V(p + dt*k3)
    const p4 = position.clone().addScaledVector(k3, dt);
    const k4 = velocityField.sampleVelocity(p4);

    // p_new = p + dt/6 * (k1 + 2*k2 + 2*k3 + k4)
    const velocity = k1
      .clone()
      .addScaledVector(k2, 2)
      .addScaledVector(k3, 2)
      .add(k4)
      .multiplyScalar((1 / 6) * dt);

    return position.clone().add(velocity);
  }

  /**
   * Euler integration - Fastest but least accurate
   * Good for interactive performance when accuracy is less critical
   */
  static advectEuler(
    position: THREE.Vector3,
    velocityField: VelocityField,
    dt: number
  ): THREE.Vector3 {
    const velocity = velocityField.sampleVelocity(position);
    return position.clone().addScaledVector(velocity, dt);
  }

  /**
   * RK2 (2nd order Runge-Kutta) integration - Balance between speed and accuracy
   * Good middle ground for performance-critical applications
   */
  static advectRK2(
    position: THREE.Vector3,
    velocityField: VelocityField,
    dt: number
  ): THREE.Vector3 {
    // k1 = V(p)
    const k1 = velocityField.sampleVelocity(position);

    // k2 = V(p + dt*k1)
    const p2 = position.clone().addScaledVector(k1, dt);
    const k2 = velocityField.sampleVelocity(p2);

    // p_new = p + dt/2 * (k1 + k2)
    const velocity = k1
      .clone()
      .add(k2)
      .multiplyScalar((1 / 2) * dt);

    return position.clone().add(velocity);
  }

  /**
   * Advect a batch of particles
   * Useful for bulk operations with progress tracking
   */
  static advectBatch(
    positions: THREE.Vector3[],
    velocityField: VelocityField,
    dt: number,
    method: 'euler' | 'rk2' | 'rk4' = 'rk4'
  ): THREE.Vector3[] {
    const advectFn = method === 'euler'
      ? ParticleAdvection.advectEuler
      : method === 'rk2'
      ? ParticleAdvection.advectRK2
      : ParticleAdvection.advectRK4;

    return positions.map((pos) => advectFn(pos, velocityField, dt));
  }
}
