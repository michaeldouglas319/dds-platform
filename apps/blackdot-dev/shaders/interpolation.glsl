// ============================================================================
// INTERPOLATION/FLOW FIELD SHADER
// Particles move toward target positions guided by flow field
// ============================================================================

#pragma glsify: import(./common.glsl);

// ============================================================================
// VERTEX SHADER
// ============================================================================

#ifdef GL_VERTEX_SHADER

uniform float uTime;
uniform float uMorphProgress;      // 0-1, overall morphing progress
uniform float uFlowStrength;       // 0-1, influence of flow field on direction
uniform vec3 uTargetCenter;        // Center of target geometry

// Flow field: 3D texture containing direction vectors for particle guidance
uniform sampler3D uFlowFieldTexture;
uniform vec3 uFlowFieldBounds;     // World space bounds of flow field

attribute vec3 aPosition;          // Current particle position
attribute vec3 aTargetPosition;    // Target position to morph toward
attribute vec3 aVelocity;          // Current velocity
attribute float aMorphProgress;    // Particle-specific morphing progress 0-1
attribute vec4 aColor;             // Particle color with alpha

varying vec3 vPosition;
varying vec3 vColor;
varying float vAlpha;
varying float vDistance;

// Sample flow field at world position
vec3 sampleFlowField(vec3 worldPos) {
  // Normalize world position to 0-1 UV coordinates
  // Assumes flow field bounds centered at origin with given bounds
  vec3 uvw = (worldPos / uFlowFieldBounds + vec3(0.5));
  uvw = clamp(uvw, vec3(0.0), vec3(1.0));

  // Sample 3D flow field texture
  vec3 flow = texture(uFlowFieldTexture, uvw).rgb;

  // Convert from [0, 1] to [-1, 1]
  flow = flow * 2.0 - 1.0;

  return normalize(flow);
}

void main() {
  // Direct vector from current to target position
  vec3 toTarget = aTargetPosition - aPosition;
  float distanceToTarget = length(toTarget);
  vec3 directDir = normalize(toTarget);

  // Sample flow field at current position
  vec3 flowDir = sampleFlowField(aPosition);

  // Blend direct interpolation with flow field guidance
  // High flow strength = follows flow field more than direct path
  vec3 guidedDir = mix(directDir, flowDir, uFlowStrength);
  guidedDir = normalize(guidedDir);

  // Interpolate position toward target
  // Uses smooth easing for natural motion
  float easedProgress = smoothstep(0.0, 1.0, aMorphProgress);
  vec3 interpolatedPos = mix(aPosition, aTargetPosition, easedProgress);

  // Apply guided velocity adjustment
  // Particles slightly deviate from direct path following flow field
  vec3 flowInfluence = guidedDir * distanceToTarget * uFlowStrength * 0.5;
  vec3 finalPos = interpolatedPos + flowInfluence * (1.0 - aMorphProgress);

  // Store for fragment shader
  vPosition = finalPos;
  vColor = aColor.rgb;

  // Fade in slightly at start of morphing, full opacity during, fade out at end
  float fadeIn = smoothstep(0.0, 0.2, aMorphProgress);
  float fadeOut = smoothstep(0.8, 1.0, aMorphProgress);
  vAlpha = fadeIn * (1.0 - fadeOut) * aColor.a;

  // Distance from target for visual effects
  vDistance = length(aTargetPosition - finalPos);

  gl_Position = projectionMatrix * modelViewMatrix * vec4(finalPos, 1.0);

  // Point size based on distance and morphing progress
  // Particles get smaller as they approach target
  float baseSizeMax = 3.0;
  float baseSizeMin = 1.0;
  float sizeByDistance = mix(baseSizeMax, baseSizeMin, aMorphProgress);
  gl_PointSize = max(sizeByDistance, 1.0);
}

#endif // GL_VERTEX_SHADER

// ============================================================================
// FRAGMENT SHADER
// ============================================================================

#ifdef GL_FRAGMENT_SHADER

uniform sampler2D uPointTexture;   // Point sprite texture (usually white circle)

varying vec3 vPosition;
varying vec3 vColor;
varying float vAlpha;
varying float vDistance;

void main() {
  // Sample point sprite texture
  vec2 uv = gl_PointCoord;

  // Create smooth circular gradient for soft particle appearance
  float dist = distance(uv, vec2(0.5)) * 2.0;
  float softCircle = exp(-dist * dist * 4.0);  // Gaussian falloff

  // Optional: Use actual texture
  // vec4 texColor = texture2D(uPointTexture, uv);
  // softCircle *= texColor.a;

  // Apply soft circle alpha
  float finalAlpha = softCircle * vAlpha;

  // Color output with subtle distance-based adjustment
  vec3 finalColor = vColor;

  gl_FragColor = vec4(finalColor, finalAlpha);
}

#endif // GL_FRAGMENT_SHADER
