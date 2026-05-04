export const particleFragShader = `
varying float vAlpha;

void main() {
  // Create circular particle with soft edges
  vec2 cxy = 2.0 * gl_PointCoord - 1.0;
  float r = dot(cxy, cxy);

  // Discard fragments outside circle
  if(r > 1.0) discard;

  // Bright center with soft glow falloff
  float intensity = exp(-r * 2.0);

  // Particle color - white with glow
  vec3 color = vec3(1.0);

  // Additive blend - particles glow and add light
  float alpha = vAlpha * intensity * 0.8;

  gl_FragColor = vec4(color, alpha);
}
`;
