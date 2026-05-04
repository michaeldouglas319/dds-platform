/**
 * Shader material for fast-orbiting particles
 * Adapted from landing page particle system
 * Provides GPU-accelerated orbital mechanics with smooth visual effects
 */

import { extend } from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';

const particleVertexShader = `
  uniform float uTime;
  uniform float uPixelRatio;
  uniform vec3 uObjectPosition;
  uniform float uAvoidanceRadius;
  uniform float uAvoidanceStrength;
  uniform float uOrbitalSpeed;

  attribute float aRadius;
  attribute float aSpeed;
  attribute float aAngle;
  attribute float aHeight;
  attribute float aNoiseOffset;
  attribute float aPhase;

  varying vec3 vPosition;
  varying float vDistance;
  varying float vIntensity;

  void main() {
    // Enhanced orbital mechanics with precession
    float t = uTime * uOrbitalSpeed;
    float currentAngle = aAngle + t * aSpeed;

    // Orbital position with elliptical variation
    float radiusVariation = 1.0 + sin(t * 0.3 + aPhase) * 0.1;
    float effectiveRadius = aRadius * radiusVariation;

    // 3D orbital path with inclination
    float inclination = sin(aPhase) * 0.3;
    vec3 orbitPos = vec3(
      cos(currentAngle) * effectiveRadius * cos(inclination),
      aHeight + sin(currentAngle) * effectiveRadius * sin(inclination),
      sin(currentAngle) * effectiveRadius
    );

    // Use orbital position directly
    vec3 pos = orbitPos;

    // Enhanced avoidance without flow field turbulence
    vec3 toCenter = uObjectPosition - pos;
    float distToCenter = length(toCenter);
    float avoidanceDist = uAvoidanceRadius * 3.0;

    if (distToCenter < avoidanceDist && distToCenter > 0.01) {
      vec3 avoidanceDir = normalize(toCenter);

      // Softer avoidance for denser cloud
      float avoidanceFactor = 1.0 / (1.0 + distToCenter * distToCenter * 2.0);
      float avoidanceStrength = smoothstep(avoidanceDist, uAvoidanceRadius * 0.5, distToCenter);
      avoidanceStrength *= uAvoidanceStrength;

      // Strong tangential component for orbital flow around object
      vec3 tangent = cross(avoidanceDir, vec3(0.0, 1.0, 0.0));
      if (length(tangent) > 0.01) {
        tangent = normalize(tangent);
        pos += tangent * avoidanceStrength * 0.6;
      }

      // Softer radial push
      pos += avoidanceDir * avoidanceStrength * avoidanceFactor * 0.4;
    }

    vPosition = pos;
    vDistance = distToCenter;

    // Calculate intensity based on distance
    float speedFactor = 0.0;
    vIntensity = 0.7 + smoothstep(avoidanceDist, uAvoidanceRadius, distToCenter) * 0.3;
    vIntensity += speedFactor * 0.2;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // Particle size - SCALED UP for large orbit system
    float baseSize = 20.0;  // Increased for better visibility at large distances
    gl_PointSize = baseSize * uPixelRatio;
    gl_PointSize *= (1.0 / -mvPosition.z);

    // Size variation based on distance
    float sizeVariation = 1.0 + smoothstep(avoidanceDist, uAvoidanceRadius, distToCenter) * 0.6;
    gl_PointSize *= sizeVariation;
  }
`;

const particleFragmentShader = `
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  uniform float uAvoidanceRadius;

  varying vec3 vPosition;
  varying float vDistance;
  varying float vIntensity;

  void main() {
    // Create soft circular particles
    vec2 uv = gl_PointCoord.xy - 0.5;
    float distance = length(uv) * 2.0;
    float alpha = 1.0 - smoothstep(0.7, 1.0, distance);

    if (alpha < 0.01) discard;

    // Color based on distance to center
    vec3 color = mix(uColor1, uColor2, vDistance / (uAvoidanceRadius * 3.0));

    // Additive blending gives glowing effect
    gl_FragColor = vec4(color * vIntensity * 0.8, alpha * 0.6);
  }
`;

// Create shader material
const OrbitingParticleMaterialImpl = shaderMaterial(
  {
    uTime: 0,
    uPixelRatio: 1,
    uObjectPosition: new THREE.Vector3(0, 0, 0),
    uAvoidanceRadius: 0.05,
    uAvoidanceStrength: 0.5,
    uOrbitalSpeed: 1.2,
    uColor1: new THREE.Color(0x00bfff),
    uColor2: new THREE.Color(0xff6347),
  },
  particleVertexShader,
  particleFragmentShader
);

// Extend Three.js with custom material
extend({ OrbitingParticleMaterial: OrbitingParticleMaterialImpl });

declare global {
  namespace JSX {
    interface IntrinsicElements {
      orbitingParticleMaterial: any;
    }
  }
}
