/**
 * ParticleRenderer — Three.js Points geometry + material with bloom support.
 *
 * Single Responsibility: Manages the GPU-side rendering of particles.
 * Takes flat Float32Arrays from GravitySimulation and uploads to GPU buffers.
 *
 * Reference: three.js BufferGeometry + Points pattern
 * Bloom: Colors > 1.0 trigger selective bloom via UnrealBloomPass
 *
 * @example
 *   const renderer = new ParticleRenderer({ maxParticles: 4096 });
 *   scene.add(renderer.points);
 *   // each frame:
 *   renderer.update(sim.positions, sim.colors);
 *   renderer.setBloomIntensity(0.8); // 0 = no bloom, 1 = full bloom
 */

import {
  BufferGeometry,
  Float32BufferAttribute,
  Points,
  ShaderMaterial,
  AdditiveBlending,
  Color,
} from 'three';

// Vertex shader: size attenuation + pass color to fragment
const vertexShader = /* glsl */ `
  attribute vec3 customColor;
  uniform float uPointSize;
  uniform float uBloom;
  varying vec3 vColor;

  void main() {
    vColor = customColor;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = uPointSize * (200.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

// Fragment shader: soft circle with color + bloom multiplier
const fragmentShader = /* glsl */ `
  varying vec3 vColor;
  uniform float uBloom;

  void main() {
    // Soft circle
    float dist = length(gl_PointCoord - vec2(0.5));
    if (dist > 0.5) discard;
    float alpha = smoothstep(0.5, 0.15, dist);

    // Colors above 1.0 trigger bloom in postprocessing
    vec3 color = vColor * (1.0 + uBloom * 2.0);
    gl_FragColor = vec4(color, alpha);
  }
`;

export class ParticleRenderer {
  /**
   * @param {Object} config
   * @param {number} config.maxParticles - Must match simulation buffer size
   * @param {number} config.pointSize - Base point size (default: 2.0)
   */
  constructor({ maxParticles = 4096, pointSize = 2.0 } = {}) {
    this.maxParticles = maxParticles;

    // Geometry with pre-allocated buffers
    this.geometry = new BufferGeometry();
    this._posAttr = new Float32BufferAttribute(new Float32Array(maxParticles * 3), 3);
    this._colorAttr = new Float32BufferAttribute(new Float32Array(maxParticles * 3), 3);
    this._posAttr.setUsage(35048); // DynamicDrawUsage
    this._colorAttr.setUsage(35048);
    this.geometry.setAttribute('position', this._posAttr);
    this.geometry.setAttribute('customColor', this._colorAttr);

    // Shader material
    this.material = new ShaderMaterial({
      uniforms: {
        uPointSize: { value: pointSize },
        uBloom: { value: 0.0 },
      },
      vertexShader,
      fragmentShader,
      blending: AdditiveBlending,
      depthWrite: false,
      transparent: true,
    });

    this.points = new Points(this.geometry, this.material);
    this.points.frustumCulled = false;
  }

  /**
   * Upload new position and color data to GPU buffers.
   *
   * @param {Float32Array} positions - From GravitySimulation
   * @param {Float32Array} colors - From GravitySimulation
   */
  update(positions, colors) {
    this._posAttr.array.set(positions);
    this._posAttr.needsUpdate = true;
    this._colorAttr.array.set(colors);
    this._colorAttr.needsUpdate = true;
  }

  /**
   * Set bloom intensity. Values > 0 push colors above 1.0 for
   * selective bloom via UnrealBloomPass.
   *
   * @param {number} intensity - 0 to 1
   */
  setBloomIntensity(intensity) {
    this.material.uniforms.uBloom.value = Math.max(0, Math.min(1, intensity));
  }

  /** Set base particle size */
  setPointSize(size) {
    this.material.uniforms.uPointSize.value = size;
  }

  /** Cleanup GPU resources */
  dispose() {
    this.geometry.dispose();
    this.material.dispose();
  }
}
