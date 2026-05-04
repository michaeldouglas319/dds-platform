import * as THREE from 'three';
import { parse } from '../helpers/shaderParse';
import { loadShader } from '../helpers/shaderLoader';

// Motion blur shaders
const motionBlurMotionVert = `
// chunk(morphtarget_pars_vertex);
// chunk(skinning_pars_vertex);

uniform mat4 u_prevModelViewMatrix;

varying vec2 v_motion;

void main() {
  // chunk(skinbase_vertex);
  // chunk(begin_vertex);
  // chunk(morphtarget_vertex);
  // chunk(skinning_vertex);

  vec4 pos = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
  vec4 prevPos = projectionMatrix * u_prevModelViewMatrix * vec4(transformed, 1.0);
  gl_Position = pos;
  v_motion = (pos.xy / pos.w - prevPos.xy / prevPos.w) * 0.5;
}
`;

const motionBlurMotionFrag = `
uniform float u_motionMultiplier;

varying vec2 v_motion;

void main() {
  gl_FragColor = vec4(v_motion * u_motionMultiplier, gl_FragCoord.z, 1.0);
}
`;

export class MeshMotionMaterial extends THREE.ShaderMaterial {
  motionMultiplier: number;

  constructor(parameters?: {
    motionMultiplier?: number;
    uniforms?: Record<string, THREE.IUniform>;
    defines?: Record<string, any>;
    vertexShader?: string;
    [key: string]: any;
  }) {
    parameters = parameters || {};

    const uniforms = parameters.uniforms || {};
    const vertexShader = parameters.vertexShader || parse(motionBlurMotionVert);
    const fragmentShader = parse(motionBlurMotionFrag);
    const motionMultiplier = parameters.motionMultiplier || 1;

    super({
      uniforms: {
        u_prevModelViewMatrix: { value: new THREE.Matrix4() },
        u_motionMultiplier: { value: 1 },
        ...uniforms,
      },
      vertexShader,
      fragmentShader,
      ...parameters,
    });

    this.motionMultiplier = motionMultiplier;
  }
}
