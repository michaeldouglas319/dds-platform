export const velocityFragShader = `
uniform vec2 resolution;
uniform sampler2D textureVelocity;
uniform sampler2D texturePosition;
uniform mat4 handMatrices[16];
uniform vec3 palmVelocity;
uniform float handBounceRatio;
uniform float handForce;
uniform float gravity;
uniform float deltaTime;

const float INTERSECTION_PRECISION = 1.0;
const float FAR = 2000.0;

float hash(float v) {
  return fract(sin(v) * 12.419821);
}

float random(vec2 v) {
  return fract(sin(dot(v, vec2(12.9898, 78.233))) * 43758.5453);
}

float sdSphere(vec3 p, float s) {
  return length(p) - s;
}

float sdCappedCylinderLower(vec3 p, vec2 h) {
  vec2 d = abs(vec2(length(p.xz), p.y + h.y)) - h;
  return min(max(d.x, d.y), 0.0) + length(max(d, 0.0));
}

float sdFingerBone(in vec3 p, in mat4 fingerBone) {
  vec3 scale = vec3(fingerBone[0][3], fingerBone[1][3], fingerBone[2][3]);

  fingerBone[0][3] = 0.0;
  fingerBone[1][3] = 0.0;
  fingerBone[2][3] = 0.0;

  p = (fingerBone * vec4(p, 1.0)).xyz;

  return min(
    sdSphere(p, scale.x),
    sdCappedCylinderLower(p, vec2(scale.x, scale.y / 2.0))
  );
}

float sdHexPrism(vec3 p, vec2 h) {
  vec3 q = abs(p);
  return max(q.z - h.y, max((q.x * 0.866025 + q.y * 0.5), q.y) - h.x);
}

float map(in vec3 p) {
  float d = FAR;

  mat4 palmData = handMatrices[0];
  vec3 scale = vec3(palmData[0][3], palmData[1][3], palmData[2][3]);

  palmData[0][3] = 0.0;
  palmData[1][3] = 0.0;
  palmData[2][3] = 0.0;

  d = min(d, sdHexPrism((palmData * vec4(p, 1.0)).xyz, vec2(scale.x, scale.z / 2.0)));

  for(int i = 1; i < 16; i++) {
    d = min(d, sdFingerBone(p, handMatrices[i]));
  }

  return d;
}

vec3 calcNormal(in vec3 pos) {
  vec3 eps = vec3(0.02, 0.0, 0.0);

  return normalize(vec3(
    map(pos + eps.xyy) - map(pos - eps.xyy),
    map(pos + eps.yxy) - map(pos - eps.yxy),
    map(pos + eps.yyx) - map(pos - eps.yyx)
  ));
}

void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;

  vec4 positionInfo = texture2D(texturePosition, uv);
  vec3 position = positionInfo.xyz;
  vec3 velocity = texture2D(textureVelocity, uv).xyz;

  // Apply gravity
  velocity.y -= (0.03 - 0.005 * random(uv + vec2(5.0))) * gravity;

  float velocityDistance = length(velocity);
  float d = map(position);

  if(d < velocityDistance) {
    if(d > INTERSECTION_PRECISION) {
      // Raymarch to find exact collision point
      vec3 rd = normalize(velocity);
      position = position + rd * d;

      float dd = 0.0;
      for(int i = 0; i < 10; i++) {
        dd = map(position);
        if(dd < INTERSECTION_PRECISION || d > FAR) break;
        d += dd;
        position += rd * dd;
      }
    }

    // Calculate surface normal
    vec3 normal = calcNormal(position);

    // Reflect velocity off surface
    velocity = reflect(velocity, normal) * handBounceRatio;

    // Add palm velocity influence
    vec3 palmDirection = normalize(palmVelocity);
    velocity += palmVelocity * handForce * max(dot(palmDirection, normal), 0.0);
  }

  gl_FragColor = vec4(velocity, d);
}
`;
