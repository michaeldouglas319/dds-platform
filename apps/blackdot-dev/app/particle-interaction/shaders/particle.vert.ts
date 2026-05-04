export const particleVertShader = `
attribute vec2 fboUV;
uniform sampler2D texturePosition;
uniform float pointSize;

varying float vAlpha;

void main() {
  vec4 posInfo = texture2D(texturePosition, fboUV);
  vec3 pos = posInfo.xyz;

  vec4 worldPosition = modelMatrix * vec4(pos, 1.0);
  vec4 mvPosition = viewMatrix * worldPosition;

  // Calculate point size based on distance
  float size = pointSize * 200.0 / length(mvPosition.xyz);
  gl_PointSize = max(size, 1.0);

  // Fade out based on particle age
  vAlpha = smoothstep(0.0, 0.1, posInfo.w);
  gl_Position = projectionMatrix * mvPosition;
}
`;
