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



