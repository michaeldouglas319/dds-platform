// ============================================================================
// DISSOLUTION SHADER
// Particles dissolve from source geometry with velocity and fade
// ============================================================================

#pragma glsify: import(./common.glsl);

// ============================================================================
// VERTEX SHADER
// ============================================================================

#ifdef GL_VERTEX_SHADER

uniform float uTime;
uniform float uDissolutionAmount;  // 0-1, controls dissolution progress
uniform float uEmissionSpread;     // How spread out particles become
uniform sampler2D uVelocityMap;    // Texture encoded particle velocities

attribute vec3 aStartPosition;     // Original position on source mesh
attribute vec3 aVelocity;          // Particle velocity direction
attribute float aLife;             // Particle lifetime 0-1
attribute float aMorphProgress;    // 0-1 transition progress

varying vec3 vColor;
varying float vLife;
varying float vAlpha;
varying float vSize;

// Hash function for pseudo-random values
float hash(vec3 p) {
  p = fract(p * vec3(0.1031, 0.1030, 0.0973));
  p += dot(p, p.yzx + 19.19);
  return fract((p.x + p.y) * p.z);
}

// 3D rotation matrix around arbitrary axis
mat3 rotationMatrix(vec3 axis, float angle) {
  axis = normalize(axis);
  float s = sin(angle);
  float c = cos(angle);
  float oc = 1.0 - c;

  return mat3(
    oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,
    oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,
    oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c
  );
}

void main() {
  // Particle dissolves based on lifetime and dissolution amount
  float dissolvePhase = aLife * uDissolutionAmount;

  // Apply velocity spread - particles accelerate away
  float velocityMagnitude = length(aVelocity);
  vec3 velocity = normalize(aVelocity) * velocityMagnitude * uTime * uEmissionSpread;

  // Add turbulent motion using simplex noise
  float noiseVal = hash(aStartPosition + uTime);
  vec3 noiseOffset = vec3(
    sin(uTime * 2.0 + noiseVal) * 0.5,
    cos(uTime * 1.5 + noiseVal) * 0.5,
    sin(uTime * 3.0 + noiseVal) * 0.5
  );

  vec3 newPos = aStartPosition + velocity + noiseOffset * dissolvePhase;

  // Apply rotation based on velocity and time
  float rotationAngle = length(aVelocity) * uTime + hash(aStartPosition) * 6.283;
  mat3 rotMat = rotationMatrix(aVelocity, rotationAngle);
  newPos = rotMat * (newPos - aStartPosition) + aStartPosition;

  // Particle life fade out (alpha decreases near end of lifetime)
  vLife = aLife;

  // Alpha decreases in final 30% of lifetime
  vAlpha = mix(1.0, 0.0, smoothstep(0.7, 1.0, aLife));

  // Color variation based on position and time
  vColor = vec3(
    0.5 + 0.5 * sin(aStartPosition.x * 0.5 + uTime),
    0.5 + 0.5 * cos(aStartPosition.y * 0.5 + uTime),
    0.5 + 0.5 * sin(aStartPosition.z * 0.5 + uTime + 2.0)
  );

  // Particle size decreases as it ages
  vSize = mix(4.0, 1.0, aLife);

  gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
  gl_PointSize = vSize * (1.0 - aLife * 0.5);
}

#endif // GL_VERTEX_SHADER

// ============================================================================
// FRAGMENT SHADER
// ============================================================================

#ifdef GL_FRAGMENT_SHADER

uniform sampler2D uTexture;  // Point sprite texture

varying vec3 vColor;
varying float vLife;
varying float vAlpha;
varying float vSize;

void main() {
  // Sample point sprite texture at current fragment coordinate
  vec2 uv = gl_PointCoord;

  // Smooth circle mask using distance from center
  float dist = distance(uv, vec2(0.5));
  float circleMask = smoothstep(0.5, 0.4, dist);

  // Alternative: use texture alpha channel
  // vec4 texColor = texture2D(uTexture, uv);
  // float alpha = texColor.a * circleMask;

  // Final color with alpha
  float finalAlpha = circleMask * vAlpha;

  gl_FragColor = vec4(vColor, finalAlpha);
}

#endif // GL_FRAGMENT_SHADER
