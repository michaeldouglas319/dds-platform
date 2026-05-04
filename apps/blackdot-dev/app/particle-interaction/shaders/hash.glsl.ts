export const hashGLSL = `
float hash(float v) {
  return fract(sin(v) * 12.419821);
}
`;
