'use client'

import { extend } from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';
import type { JSX } from 'react';
import { COLORS } from '../config/colors.config';

// Import shader code as strings
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
    
    // Use orbital position directly without noise
    vec3 pos = orbitPos;
    
    // Enhanced avoidance without flow field turbulence
    vec3 toCenter = uObjectPosition - pos;
    float distToCenter = length(toCenter);
    float avoidanceDist = uAvoidanceRadius * 3.0; // Extended influence for smoother flow
    
    if (distToCenter < avoidanceDist && distToCenter > 0.01) {
      vec3 avoidanceDir = normalize(toCenter);
      
      // Softer avoidance - allows particles closer, creates denser cloud
      float avoidanceFactor = 1.0 / (1.0 + distToCenter * distToCenter * 2.0);
      float avoidanceStrength = smoothstep(avoidanceDist, uAvoidanceRadius * 0.5, distToCenter);
      avoidanceStrength *= uAvoidanceStrength;
      
      // Strong tangential component for orbital flow around object
      vec3 tangent = cross(avoidanceDir, vec3(0.0, 1.0, 0.0));
      if (length(tangent) > 0.01) {
        tangent = normalize(tangent);
        // Stronger tangential push for dense orbiting cloud
        pos += tangent * avoidanceStrength * 0.6;
      }
      
      // Softer radial push - allows particles closer
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
    
    // Larger particles for better visibility
    float baseSize = 6.0;
    gl_PointSize = baseSize * uPixelRatio;
    gl_PointSize *= (1.0 / -mvPosition.z);
    
    // Size variation based on distance only
    float sizeVariation = 1.0 + smoothstep(avoidanceDist, uAvoidanceRadius, distToCenter) * 0.4;
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
    // Enhanced circular particle with glow
    vec2 coord = gl_PointCoord - vec2(0.5);
    float r = length(coord);
    
    // Discard outside circle
    if (r > 0.5) discard;
    
    // Soft edge with glow effect
    float alpha = 1.0 - smoothstep(0.2, 0.5, r);
    
    // Inner glow
    float innerGlow = 1.0 - smoothstep(0.0, 0.3, r);
    alpha += innerGlow * 0.3;
    
    // Color gradient based on distance and intensity
    float distFactor = smoothstep(uAvoidanceRadius * 2.0, uAvoidanceRadius, vDistance);
    vec3 color = mix(uColor2, uColor1, distFactor);
    
    // Intensity-based brightness
    color *= vIntensity;
    
    // Enhanced glow near avoidance zone
    float avoidanceGlow = smoothstep(uAvoidanceRadius * 0.5, uAvoidanceRadius, vDistance);
    color += vec3(0.3, 0.4, 0.6) * avoidanceGlow * 0.4;
    
    // Radial gradient for depth
    color *= (1.0 + innerGlow * 0.7);
    
    gl_FragColor = vec4(color, alpha * 0.9);
  }
`;

// Create enhanced shader material
const OrbitingParticleMaterial = shaderMaterial(
  {
    uTime: 0,
    uPixelRatio: 1,
    uObjectPosition: new THREE.Vector3(0, -0.09, 0),
    uAvoidanceRadius: 0.8,
    uAvoidanceStrength: 1.01,
    uOrbitalSpeed: 0.50,
    uColor1: new THREE.Color('#aaaaaa'), // Neutral gray to match nodes
    uColor2: new THREE.Color('#aaaaaa'), // Neutral gray to match nodes
  },
  particleVertexShader,
  particleFragmentShader
);

extend({ OrbitingParticleMaterial });

// R3F v9 type augmentation - simpler pattern
declare module '@react-three/fiber' {
  interface ThreeElements {
    orbitingParticleMaterial: JSX.IntrinsicElements['meshStandardMaterial'];
  }
}

export { OrbitingParticleMaterial };

