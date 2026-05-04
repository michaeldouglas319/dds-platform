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

// Enhanced Simplex noise for organic movement
vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
float snoise(vec2 v){
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.yw)), 0.0);
  m = m*m ;
  m = m*m ;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

// 3D noise for more organic movement
float noise3D(vec3 p) {
  return snoise(p.xy) * 0.5 + snoise(p.yz) * 0.3 + snoise(p.zx) * 0.2;
}

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
    aHeight + sin(currentAngle) * effectiveRadius * sin(inclination) + sin(t * 0.4 + aNoiseOffset) * 0.3,
    sin(currentAngle) * effectiveRadius
  );
  
  // Calculate direction from object center to particle
  vec3 toParticle = orbitPos - uObjectPosition;
  float distToObject = length(toParticle);
  vec3 dirToParticle = distToObject > 0.01 ? normalize(toParticle) : vec3(1.0, 0.0, 0.0);
  
  // Spherical coordinates relative to object (theta, phi)
  float theta = atan(dirToParticle.z, dirToParticle.x); // Azimuth angle
  float phi = acos(dirToParticle.y); // Polar angle
  
  // Shape-aware noise - follows object contours
  // Use spherical coordinates for noise sampling to match object shape
  vec2 sphericalNoise = vec2(theta, phi);
  
  // Multi-layered noise that follows object shape
  // Noise frequency based on distance - tighter near object
  float noiseScale = 1.0 + smoothstep(0.5, 2.0, distToObject) * 2.0;
  
  vec3 noisePos1 = vec3(
    sphericalNoise.x * noiseScale + t * 0.3 + aNoiseOffset,
    sphericalNoise.y * noiseScale + t * 0.2 + aNoiseOffset,
    distToObject * 0.5 + t * 0.25
  );
  
  vec3 noisePos2 = vec3(
    sphericalNoise.x * noiseScale * 2.0 + t * 0.5 + aNoiseOffset * 2.0,
    sphericalNoise.y * noiseScale * 2.0 + t * 0.4 + aNoiseOffset * 2.0,
    distToObject * 1.0 + t * 0.5
  );
  
  // Noise in radial direction (toward/away from object)
  float radialNoise = noise3D(noisePos1) * 0.3 + noise3D(noisePos2) * 0.15;
  
  // Noise in tangential directions (around object surface)
  float tangentialNoise1 = noise3D(noisePos1.yzx) * 0.4 + noise3D(noisePos2.yzx) * 0.2;
  float tangentialNoise2 = noise3D(noisePos1.zxy) * 0.4 + noise3D(noisePos2.zxy) * 0.2;
  
  // Apply noise along object's surface tangent directions
  // Create tangent vectors perpendicular to radial direction
  vec3 tangent1 = normalize(cross(dirToParticle, vec3(0.0, 1.0, 0.0)));
  if (length(tangent1) < 0.01) {
    tangent1 = normalize(cross(dirToParticle, vec3(0.0, 0.0, 1.0)));
  }
  vec3 tangent2 = normalize(cross(dirToParticle, tangent1));
  
  // Combine radial and tangential noise
  vec3 noise = dirToParticle * radialNoise + 
               tangent1 * tangentialNoise1 + 
               tangent2 * tangentialNoise2;
  
  vec3 pos = orbitPos + noise;
  
  // Enhanced avoidance with flow field - particles follow "wind" of agitation
  vec3 toCenter = uObjectPosition - pos;
  float distToCenter = length(toCenter);
  float avoidanceDist = uAvoidanceRadius * 3.0; // Extended influence for smoother flow
  
  // Flow field - creates turbulent "wind" that particles follow
  vec3 flowField = vec3(
    sin(uTime * 0.5 + pos.x * 2.0) * 0.1,
    cos(uTime * 0.7 + pos.y * 2.0) * 0.1,
    sin(uTime * 0.6 + pos.z * 2.0) * 0.1
  );
  
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
    
    // Add flow field turbulence (wind of agitation)
    pos += flowField * avoidanceStrength * 0.3;
  } else {
    // Even outside avoidance zone, particles follow flow field
    pos += flowField * 0.15;
  }
  
  vPosition = pos;
  vDistance = distToCenter;
  
  // Calculate intensity based on distance and movement
  float speedFactor = length(noise);
  vIntensity = 0.7 + smoothstep(avoidanceDist, uAvoidanceRadius, distToCenter) * 0.3;
  vIntensity += speedFactor * 0.2;
  
  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  
  // Larger particles for better visibility
  float baseSize = 6.0;
  gl_PointSize = baseSize * uPixelRatio;
  gl_PointSize *= (1.0 / -mvPosition.z);
  
  // Size variation based on distance and movement
  float sizeVariation = 1.0 + sin(t * 2.0 + aNoiseOffset) * 0.2;
  sizeVariation += smoothstep(avoidanceDist, uAvoidanceRadius, distToCenter) * 0.4;
  gl_PointSize *= sizeVariation;
}



