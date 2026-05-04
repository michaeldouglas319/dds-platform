// ============================================================================
// REFORMATION SHADER
// Particles snap to target mesh vertices with smooth settling
// ============================================================================

#pragma glsify: import(./common.glsl);

// ============================================================================
// VERTEX SHADER
// ============================================================================

#ifdef GL_VERTEX_SHADER

uniform float uReformationProgress;     // 0-1, how snapped to target are particles
uniform sampler2D uTargetGeometryTexture; // Texture-encoded target vertex positions
uniform int uTargetVertexCount;         // Total vertices in target mesh
uniform float uSettleAmount;            // Damping/settling effect 0-1

attribute vec3 aPosition;               // Current position
attribute int aTargetVertexIndex;       // Which vertex in target to snap to
attribute vec3 aTargetPosition;         // Pre-computed target position
attribute float aParticleLife;          // 0-1 particle life
attribute vec4 aColor;                  // Particle color + alpha

varying vec3 vPosition;
varying vec3 vColor;
varying float vAlpha;
varying float vSettleAmount;

// Decode vertex position from texture
// Assumes vertices packed as RGB in 2D texture (e.g., 256x256 for 65536 vertices)
vec3 decodeVertexFromTexture(int vertexIndex) {
  // Calculate UV coordinates for vertex data
  int textureWidth = 256;
  int textureHeight = 256;

  int u = vertexIndex % textureWidth;
  int v = vertexIndex / textureWidth;

  vec2 uv = vec2(float(u) / float(textureWidth), float(v) / float(textureHeight));

  // Sample and decode position (assuming 8-bit per channel, normalized to [-1, 1])
  vec4 encoded = texture2D(uTargetGeometryTexture, uv);
  vec3 position = encoded.rgb * 2.0 - 1.0;

  // Scale back to world space (assuming original bound was [-1, 1])
  position *= 10.0; // Adjust scale factor as needed

  return position;
}

void main() {
  // Get target vertex position
  // Option 1: Use pre-computed aTargetPosition (most common)
  vec3 targetVert = aTargetPosition;

  // Option 2: Decode from texture (for dynamic targets)
  // vec3 targetVert = decodeVertexFromTexture(aTargetVertexIndex);

  // Smooth interpolation from current to target position
  // Use cubic easing for natural settling motion
  float easedProgress = smoothstep(0.0, 1.0, uReformationProgress);
  easedProgress = easedProgress * easedProgress * (3.0 - 2.0 * easedProgress); // Smoothstep easing

  vec3 finalPosition = mix(aPosition, targetVert, easedProgress);

  // Add slight settling oscillation (overshoot then dampen)
  float settleOscillation = sin(uReformationProgress * 3.14159 * 2.0) * uSettleAmount;
  finalPosition += (targetVert - aPosition) * settleOscillation * 0.1;

  // Store for fragment shader
  vPosition = finalPosition;
  vColor = aColor.rgb;

  // Keep full opacity during reformation, fade at very end
  float fadeOut = smoothstep(0.95, 1.0, uReformationProgress);
  vAlpha = (1.0 - fadeOut) * aColor.a;
  vSettleAmount = uSettleAmount;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(finalPosition, 1.0);

  // Particle size during reformation
  // Particles should be larger when forming back into mesh
  float sizeReform = mix(2.0, 0.5, uReformationProgress);
  gl_PointSize = max(sizeReform, 0.5);
}

#endif // GL_VERTEX_SHADER

// ============================================================================
// FRAGMENT SHADER
// ============================================================================

#ifdef GL_FRAGMENT_SHADER

uniform sampler2D uPointTexture;

varying vec3 vPosition;
varying vec3 vColor;
varying float vAlpha;
varying float vSettleAmount;

void main() {
  // Create particle sprite with circular gradient
  vec2 uv = gl_PointCoord;
  vec2 centerDist = uv - vec2(0.5);
  float distFromCenter = length(centerDist);

  // Soft circular mask with Gaussian falloff
  float circleMask = exp(-distFromCenter * distFromCenter * 8.0);

  // Optional radial gradient for depth cue
  float radialGradient = 1.0 - distFromCenter;
  float combinedAlpha = circleMask * radialGradient;

  // Final color and alpha
  float finalAlpha = combinedAlpha * vAlpha;
  vec3 finalColor = vColor;

  // Add subtle shadow under particle
  float shadowMask = smoothstep(0.6, 0.0, distFromCenter);
  finalColor = mix(finalColor, vec3(0.0), shadowMask * 0.1);

  gl_FragColor = vec4(finalColor, finalAlpha);
}

#endif // GL_FRAGMENT_SHADER
