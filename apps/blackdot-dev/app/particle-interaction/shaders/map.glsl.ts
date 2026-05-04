export const mapGLSL = `
const float GLOBAL_VAR_FAR = 2000.0;

float sdHexPrism(vec3 p, vec2 h) {
  vec3 q = abs(p);
  return max(q.z - h.y, max((q.x * 0.866025 + q.y * 0.5), q.y) - h.x);
}

float map(in vec3 p, in mat4 handMatrices[16]) {
  float d = GLOBAL_VAR_FAR;

  // Palm (hex prism)
  mat4 palmData = handMatrices[0];
  vec3 scale = vec3(palmData[0][3], palmData[1][3], palmData[2][3]);

  palmData[0][3] = 0.0;
  palmData[1][3] = 0.0;
  palmData[2][3] = 0.0;

  d = min(d, sdHexPrism((palmData * vec4(p, 1.0)).xyz, vec2(scale.x, scale.z / 2.0)));

  // Finger bones (spheres + cylinders)
  for(int i = 1; i < 16; i++) {
    d = min(d, sdFingerBone(p, handMatrices[i]));
  }

  return d;
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
`;
