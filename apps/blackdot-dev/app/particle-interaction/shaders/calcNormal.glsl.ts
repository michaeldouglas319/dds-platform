export const calcNormalGLSL = `
vec3 calcNormal(in vec3 pos, in mat4 handMatrices[16]) {
  vec3 eps = vec3(0.02, 0.0, 0.0);

  return normalize(vec3(
    map(pos + eps.xyy, handMatrices) - map(pos - eps.xyy, handMatrices),
    map(pos + eps.yxy, handMatrices) - map(pos - eps.yxy, handMatrices),
    map(pos + eps.yyx, handMatrices) - map(pos - eps.yyx, handMatrices)
  ));
}
`;
