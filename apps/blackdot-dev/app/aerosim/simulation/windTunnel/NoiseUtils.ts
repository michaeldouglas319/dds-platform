import * as THREE from 'three';

/**
 * NoiseUtils - 3D noise functions for turbulence and curl noise
 * Reference: QUICK_CODE_REFERENCE.md - Curl Noise (Turbulence) pattern
 * 
 * Implements simplified 3D Perlin-like noise with analytical derivatives
 * for efficient curl noise computation
 */

/**
 * Simple 3D hash function for pseudo-random values
 */
function hash3D(x: number, y: number, z: number): number {
  let hash = x * 374761393 + y * 668265263 + z * 2246822519;
  hash = (hash ^ (hash >> 13)) * 1274126177;
  return (hash ^ (hash >> 16)) / 2147483648.0;
}

/**
 * Smooth interpolation function (smoothstep)
 */
function smoothstep(t: number): number {
  return t * t * (3 - 2 * t);
}

/**
 * 3D Perlin-like noise function
 * Returns value in range [-1, 1]
 */
export function perlinNoise3D(pos: THREE.Vector3, scale: number = 1.0): number {
  const x = pos.x * scale;
  const y = pos.y * scale;
  const z = pos.z * scale;

  const i = Math.floor(x);
  const j = Math.floor(y);
  const k = Math.floor(z);

  const fx = x - i;
  const fy = y - j;
  const fz = z - k;

  const u = smoothstep(fx);
  const v = smoothstep(fy);
  const w = smoothstep(fz);

  // Get noise values at 8 corners of cube
  const n000 = hash3D(i, j, k);
  const n100 = hash3D(i + 1, j, k);
  const n010 = hash3D(i, j + 1, k);
  const n110 = hash3D(i + 1, j + 1, k);
  const n001 = hash3D(i, j, k + 1);
  const n101 = hash3D(i + 1, j, k + 1);
  const n011 = hash3D(i, j + 1, k + 1);
  const n111 = hash3D(i + 1, j + 1, k + 1);

  // Trilinear interpolation
  const x00 = n000 * (1 - u) + n100 * u;
  const x10 = n010 * (1 - u) + n110 * u;
  const x01 = n001 * (1 - u) + n101 * u;
  const x11 = n011 * (1 - u) + n111 * u;

  const y0 = x00 * (1 - v) + x10 * v;
  const y1 = x01 * (1 - v) + x11 * v;

  return y0 * (1 - w) + y1 * w;
}

/**
 * Compute analytical gradient of noise function
 * Returns gradient vector (∇noise)
 */
export function computeNoiseGradient(
  pos: THREE.Vector3,
  scale: number = 1.0,
  epsilon: number = 0.01
): THREE.Vector3 {
  // Central differences for gradient
  const dx = (perlinNoise3D(new THREE.Vector3(pos.x + epsilon, pos.y, pos.z), scale) -
              perlinNoise3D(new THREE.Vector3(pos.x - epsilon, pos.y, pos.z), scale)) / (2 * epsilon);
  const dy = (perlinNoise3D(new THREE.Vector3(pos.x, pos.y + epsilon, pos.z), scale) -
              perlinNoise3D(new THREE.Vector3(pos.x, pos.y - epsilon, pos.z), scale)) / (2 * epsilon);
  const dz = (perlinNoise3D(new THREE.Vector3(pos.x, pos.y, pos.z + epsilon), scale) -
              perlinNoise3D(new THREE.Vector3(pos.x, pos.y, pos.z - epsilon), scale)) / (2 * epsilon);

  return new THREE.Vector3(dx, dy, dz);
}

/**
 * Curl noise - Computes curl of noise field for swirling turbulence
 * Returns velocity component from curl(noise)
 * 
 * curl(noise) = ∇ × noise
 * For 3D: curl = (∂noise_z/∂y - ∂noise_y/∂z, ∂noise_x/∂z - ∂noise_z/∂x, ∂noise_y/∂x - ∂noise_x/∂y)
 * 
 * We use a simplified approach: compute curl from noise gradient cross product
 */
export function curlNoise(
  pos: THREE.Vector3,
  scale: number = 0.1,
  time: number = 0
): THREE.Vector3 {
  // Sample noise at slightly offset positions to compute curl
  const epsilon = 0.1;
  
  // Compute noise values at offset positions
  const n0 = perlinNoise3D(new THREE.Vector3(pos.x, pos.y, pos.z), scale);
  const nx = perlinNoise3D(new THREE.Vector3(pos.x + epsilon, pos.y, pos.z), scale);
  const ny = perlinNoise3D(new THREE.Vector3(pos.x, pos.y + epsilon, pos.z), scale);
  const nz = perlinNoise3D(new THREE.Vector3(pos.x, pos.y, pos.z + epsilon), scale);
  
  // Compute partial derivatives (simplified)
  const dnx_dy = (perlinNoise3D(new THREE.Vector3(pos.x, pos.y + epsilon, pos.z), scale) - n0) / epsilon;
  const dnx_dz = (perlinNoise3D(new THREE.Vector3(pos.x, pos.y, pos.z + epsilon), scale) - n0) / epsilon;
  const dny_dx = (nx - n0) / epsilon;
  const dny_dz = (nz - n0) / epsilon;
  const dnz_dx = (nx - n0) / epsilon;
  const dnz_dy = (ny - n0) / epsilon;
  
  // Curl components: curl = (∂nz/∂y - ∂ny/∂z, ∂nx/∂z - ∂nz/∂x, ∂ny/∂x - ∂nx/∂y)
  const curlX = dnz_dy - dny_dz;
  const curlY = dnx_dz - dnz_dx;
  const curlZ = dny_dx - dnx_dy;
  
  return new THREE.Vector3(curlX, curlY, curlZ);
}

/**
 * Add curl noise turbulence to velocity field
 * Only applies in wake regions (behind obstacles)
 */
export function addCurlNoiseTurbulence(
  baseVelocity: THREE.Vector3,
  pos: THREE.Vector3,
  sdf: (p: THREE.Vector3) => number,
  turbulenceIntensity: number = 0.2,
  wakeDistance: number = 20.0,
  time: number = 0
): THREE.Vector3 {
  const distance = sdf(pos);
  
  // Only add turbulence in wake region (behind obstacle, within wakeDistance)
  // Wake is defined as: behind obstacle (x > 0 typically) and within wakeDistance
  if (distance > 0 && distance < wakeDistance && pos.x > 0) {
    const curlComponent = curlNoise(pos, 0.1, time);
    const scaledCurl = curlComponent.multiplyScalar(turbulenceIntensity * baseVelocity.length());
    return baseVelocity.clone().add(scaledCurl);
  }
  
  return baseVelocity;
}


