/**
 * Advanced Black Hole Shader Utilities
 * Realistic volumetric black hole with accretion disk
 */

import * as THREE from 'three'

export interface BlackHoleUniforms {
  power: number
  diskInnerRadius: number
  diskOuterRadius: number
  diskIntensity: number
  diskGlow: number
  eventHorizonRadius: number
  accretionColor: THREE.Color
  emissionIntensity: number
  time?: number
}

export const DEFAULT_BLACK_HOLE_UNIFORMS: BlackHoleUniforms = {
  power: 2.0,
  diskInnerRadius: 0.3,
  diskOuterRadius: 1.2,
  diskIntensity: 3.0,
  diskGlow: 2.5,
  eventHorizonRadius: 0.15,
  accretionColor: new THREE.Color(1.0, 0.6, 0.1), // Orange/gold
  emissionIntensity: 4.0,
}

/**
 * Vertex shader for realistic black hole
 */
export const advancedBlackHoleVertexShader = `
  varying vec3 vPosition;
  varying vec3 vNormal;
  varying vec3 vWorldPos;

  void main() {
    vPosition = position;
    vNormal = normalize(normalMatrix * normal);
    vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

/**
 * Fragment shader for realistic volumetric black hole with accretion disk
 * Based on touch-leap-motion singularity effect with radial gradients
 */
export const advancedBlackHoleFragmentShader = `
  uniform vec3 accretionColor;
  uniform float diskInnerRadius;
  uniform float diskOuterRadius;
  uniform float diskIntensity;
  uniform float diskGlow;
  uniform float eventHorizonRadius;
  uniform float power;
  uniform float emissionIntensity;
  uniform float time;

  varying vec3 vPosition;
  varying vec3 vNormal;
  varying vec3 vWorldPos;

  // Smooth step function
  float smootherstep(float edge0, float edge1, float x) {
    x = clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
    return x * x * x * (x * (x * 6.0 - 15.0) + 10.0);
  }

  void main() {
    float yComponent = abs(vWorldPos.y);
    float diskDistance = sqrt(vWorldPos.x * vWorldPos.x + vWorldPos.z * vWorldPos.z);

    // True black event horizon
    float horizonMask = smootherstep(eventHorizonRadius - 0.02, eventHorizonRadius + 0.08, diskDistance);

    // Bright accretion disk ring (concentrated band)
    float diskRing = smootherstep(diskOuterRadius, diskInnerRadius * 1.2, diskDistance) *
                     smootherstep(diskInnerRadius - 0.05, diskOuterRadius, diskDistance);

    // Vertical falloff for disk thickness
    float verticalFalloff = exp(-yComponent * yComponent * diskGlow);

    // Bright saturated accretion disk
    vec3 diskCol = accretionColor * 1.2;
    vec3 finalColor = diskCol * diskRing * verticalFalloff * diskIntensity;

    // Rim brightening (brightest part of disk)
    float rimBright = smootherstep(diskOuterRadius, diskInnerRadius * 0.9, diskDistance) *
                      (1.0 - smootherstep(eventHorizonRadius, eventHorizonRadius + 0.1, diskDistance));
    finalColor += accretionColor * rimBright * emissionIntensity * 1.5;

    // Outer halo glow
    float outerGlow = exp(-diskDistance * diskDistance * 3.0) * horizonMask;
    finalColor += accretionColor * outerGlow * emissionIntensity * 0.6;

    // Animated texture
    float texture = abs(sin(diskDistance * 10.0 + time * 0.3)) * 0.2 + 0.8;
    finalColor *= texture;

    // Asymmetric vertical glow
    finalColor *= (1.0 + (1.0 - yComponent * 2.0) * 0.3);

    // Black out event horizon completely
    finalColor *= horizonMask;

    // Global falloff
    float distFromCenter = length(vWorldPos);
    finalColor *= exp(-distFromCenter * distFromCenter * power);

    gl_FragColor = vec4(finalColor, 1.0);
  }
`

