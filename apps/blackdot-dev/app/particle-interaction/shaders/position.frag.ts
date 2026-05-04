export const positionFragShader = `
uniform vec2 resolution;
uniform sampler2D textureVelocity2;
uniform sampler2D textureVelocity;
uniform sampler2D texturePosition;
uniform mat4 handMatrices[16];
uniform float dropRadius;
uniform float fromY;
uniform float yDynamicRange;

const float INTERSECTION_PRECISION = 1.0;
const float FAR = 2000.0;
const float PI_2 = 6.2831853072;

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
  vec3 prevVelocity = texture2D(textureVelocity2, uv).xyz;
  vec4 velocityInfo = texture2D(textureVelocity, uv);
  vec3 velocity = velocityInfo.xyz;

  float d = velocityInfo.w;

  positionInfo.w -= 0.01;

  if(positionInfo.w < 0.0) {
    // Reset particle
    positionInfo.w = 1.0 + random(uv + vec2(2.0));
    float a = hash(uv.x) * PI_2;
    float r = pow(hash(uv.y), 0.75) * dropRadius;
    position = vec3(cos(a) * r, fromY + random(uv + vec2(1.0)) * yDynamicRange, sin(a) * r);
  } else {
    float velocityDistance = length(prevVelocity);
    if(d < velocityDistance) {
      if(d > INTERSECTION_PRECISION) {
        // Raymarch
        vec3 rd = normalize(prevVelocity);
        position = position + rd * d;

        float dd = 0.0;
        for(int i = 0; i < 10; i++) {
          dd = map(position);
          if(dd < INTERSECTION_PRECISION || d > FAR) break;
          d += dd;
          position += rd * dd;
        }
      }

      vec3 normal = calcNormal(position);

      if(d < 0.0) {
        position += normal * (-d + INTERSECTION_PRECISION);
      }
    }

    // Integrate position
    position += velocity;
  }

  gl_FragColor = vec4(position, positionInfo.w);
}
`;
