// ============================================================================
// COMMON SHADER UTILITIES
// Reusable functions for particle system shaders
// ============================================================================

// ============================================================================
// MATHEMATICAL UTILITIES
// ============================================================================

const float PI = 3.14159265359;
const float TWO_PI = 6.28318530718;

// Clamp value between min and max
float clamp01(float x) {
  return clamp(x, 0.0, 1.0);
}

vec3 clamp01(vec3 v) {
  return clamp(v, vec3(0.0), vec3(1.0));
}

// Linear interpolation
float mix01(float a, float b, float t) {
  return mix(a, b, clamp01(t));
}

vec3 mix01(vec3 a, vec3 b, float t) {
  return mix(a, b, clamp01(t));
}

// Cubic hermite curve
float hermite(float t) {
  t = clamp01(t);
  return t * t * (3.0 - 2.0 * t);
}

// Smoothstep with configurable range
float smoothstep(float a, float b, float x) {
  float t = clamp((x - a) / (b - a), 0.0, 1.0);
  return t * t * (3.0 - 2.0 * t);
}

// ============================================================================
// NOISE FUNCTIONS
// ============================================================================

// 2D Simplex noise (pseudo-random)
// Based on Inigo Quilez's noise functions
float noise2D(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.13);
  p3 += dot(p3, p3.yzx + 3.333);
  return fract((p3.x + p3.y) * p3.z);
}

// 3D Simplex noise (pseudo-random)
float noise3D(vec3 p) {
  vec3 p3 = fract(p * 0.1031);
  p3 += dot(p3, p3.yzx + 19.19);
  return fract((p3.x + p3.y) * p3.z);
}

// Hash function for pseudo-random values
float hash(float n) {
  return fract(sin(n * 43758.5453));
}

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

float hash(vec3 p) {
  return fract(sin(dot(p, vec3(12.9898, 78.233, 45.164))) * 43758.5453);
}

// Perlin-like noise (improved)
float perlin(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);

  vec2 u = f * f * (3.0 - 2.0 * f);

  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));

  float ab = mix(a, b, u.x);
  float cd = mix(c, d, u.x);

  return mix(ab, cd, u.y);
}

// ============================================================================
// VECTOR UTILITIES
// ============================================================================

// Rotate vector around axis
vec3 rotateAroundAxis(vec3 v, vec3 axis, float angle) {
  axis = normalize(axis);
  float s = sin(angle);
  float c = cos(angle);
  float oc = 1.0 - c;

  return v * c +
         cross(axis, v) * s +
         axis * dot(axis, v) * oc;
}

// Create rotation matrix around axis
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

// Faster rotation around Z axis (common case)
vec2 rotateZ(vec2 v, float angle) {
  float s = sin(angle);
  float c = cos(angle);
  return mat2(c, -s, s, c) * v;
}

// Faster rotation around Y axis
vec3 rotateY(vec3 v, float angle) {
  float s = sin(angle);
  float c = cos(angle);
  return vec3(
    c * v.x + s * v.z,
    v.y,
    -s * v.x + c * v.z
  );
}

// ============================================================================
// COLOR UTILITIES
// ============================================================================

// HSV to RGB conversion
vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

// RGB to HSV conversion
vec3 rgb2hsv(vec3 c) {
  vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
  vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
  vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

  float d = q.x - min(q.w, q.y);
  float e = 1.0e-10;

  return vec3(
    abs(q.z + (q.w - q.y) / (6.0 * d + e)),
    d / (q.x + e),
    q.x
  );
}

// Tone mapping (for HDR)
vec3 toneMapACES(vec3 color) {
  float a = 2.51;
  float b = 0.03;
  float c = 2.43;
  float d = 0.59;
  float e = 0.14;

  return clamp((color * (a * color + b)) / (color * (c * color + d) + e), 0.0, 1.0);
}

// ============================================================================
// EASING FUNCTIONS
// ============================================================================

// Linear
float easeLinear(float t) {
  return t;
}

// Quadratic in/out
float easeInQuad(float t) {
  return t * t;
}

float easeOutQuad(float t) {
  return t * (2.0 - t);
}

float easeInOutQuad(float t) {
  return t < 0.5 ? 2.0 * t * t : -1.0 + 4.0 * t - 2.0 * t * t;
}

// Cubic in/out
float easeInCubic(float t) {
  return t * t * t;
}

float easeOutCubic(float t) {
  float f = t - 1.0;
  return f * f * f + 1.0;
}

float easeInOutCubic(float t) {
  return t < 0.5 ? 4.0 * t * t * t : 1.0 + 4.0 * (t - 1.0) * (2.0 * (t - 2.0)) * (2.0 * (t - 2.0));
}

// Exponential in/out
float easeInExpo(float t) {
  return (pow(2.0, 10.0 * t - 10.0));
}

float easeOutExpo(float t) {
  return (1.0 - pow(2.0, -10.0 * t));
}

// ============================================================================
// TEXTURE UTILITIES
// ============================================================================

// Sample with bilinear filtering (for better quality)
vec4 sampleBilinear(sampler2D tex, vec2 uv, vec2 texSize) {
  vec2 pixelSize = 1.0 / texSize;
  vec2 uvPixels = uv * texSize - 0.5;
  vec2 uvFloor = floor(uvPixels);
  vec2 uvFrac = fract(uvPixels);

  vec2 uv00 = (uvFloor + vec2(0.0, 0.0)) * pixelSize;
  vec2 uv10 = (uvFloor + vec2(1.0, 0.0)) * pixelSize;
  vec2 uv01 = (uvFloor + vec2(0.0, 1.0)) * pixelSize;
  vec2 uv11 = (uvFloor + vec2(1.0, 1.0)) * pixelSize;

  vec4 s00 = texture2D(tex, uv00);
  vec4 s10 = texture2D(tex, uv10);
  vec4 s01 = texture2D(tex, uv01);
  vec4 s11 = texture2D(tex, uv11);

  vec4 row0 = mix(s00, s10, uvFrac.x);
  vec4 row1 = mix(s01, s11, uvFrac.x);

  return mix(row0, row1, uvFrac.y);
}

// ============================================================================
// GEOMETRIC UTILITIES
// ============================================================================

// Distance from point to line
float distanceToLine(vec3 p, vec3 lineStart, vec3 lineEnd) {
  vec3 pa = p - lineStart;
  vec3 ba = lineEnd - lineStart;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * h);
}

// Distance from point to sphere
float distanceToSphere(vec3 p, vec3 center, float radius) {
  return length(p - center) - radius;
}

// Distance from point to box
float distanceToBox(vec3 p, vec3 boxSize) {
  vec3 q = abs(p) - boxSize;
  return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
}
