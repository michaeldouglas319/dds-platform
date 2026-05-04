import * as THREE from 'three';
import { parse } from '../helpers/shaderParse';
import { loadShader } from '../helpers/shaderLoader';
import { MeshMotionMaterial } from './MeshMotionMaterial';
import * as fbo from './fbo';
import { settings } from './settings';

// Shader sources matching original
const particleVertSource = `
attribute vec2 fboUV;
uniform sampler2D texturePosition;

#ifdef USE_BILLBOARD
  attribute vec3 positionFlip;
  uniform float flipRatio;
#else
  varying float vAlpha;
#endif

// chunk(shadowmap_pars_vertex);

void main() {
  vec4 posInfo = texture2D(texturePosition, fboUV);
  vec3 pos = posInfo.xyz;

  vec4 worldPosition = modelMatrix * vec4(pos, 1.0);
  vec4 mvPosition = viewMatrix * worldPosition;

  #ifdef USE_BILLBOARD
    vec4 flipOffset = vec4(mix(position, positionFlip, flipRatio) * 0.5, 1.0);
    worldPosition += flipOffset;
  #else
    gl_PointSize = (500.0 / length(mvPosition.xyz));
    mvPosition.y += gl_PointSize * 0.5;
  #endif

  // chunk(shadowmap_vertex);

  #ifdef USE_BILLBOARD
    gl_Position = projectionMatrix * (mvPosition + flipOffset);
  #else
    vAlpha = smoothstep(0.0, 0.1, posInfo.w);
    gl_Position = projectionMatrix * mvPosition;
  #endif
}
`;

const particleFragSource = `
// chunk(common);
// chunk(packing);
// chunk(bsdfs);
// chunk(lights_pars);
// chunk(fog_pars_fragment);
// chunk(shadowmap_pars_fragment);
// chunk(shadowmask_pars_fragment);

#ifdef USE_BILLBOARD
#else
  varying float vAlpha;
#endif

void main() {
  vec3 outgoingLight = vec3(1.0);

  outgoingLight *= 0.1 + pow(0.7 + vec3(getShadowMask()) * 0.3, vec3(1.5)) * 0.9;
  // chunk(fog_fragment);

  #ifdef USE_BILLBOARD
    gl_FragColor = vec4(outgoingLight, 1.0);
  #else
    float d = length(gl_PointCoord.xy - 0.5) * 2.0;
    gl_FragColor = vec4(outgoingLight, vAlpha) * (1.0 - step(1.0, d));
  #endif
}
`;

const distanceVertSource = `
attribute vec2 fboUV;
uniform sampler2D texturePosition;

#ifdef USE_BILLBOARD
  attribute vec3 positionFlip;
  uniform float flipRatio;
#endif

varying vec4 vWorldPosition;

void main() {
  vec3 pos = texture2D(texturePosition, fboUV).xyz;

  vec4 worldPosition = modelMatrix * vec4(pos, 1.0);
  vec4 mvPosition = viewMatrix * worldPosition;

  #ifdef USE_BILLBOARD
    vec4 flipOffset = vec4(mix(position, positionFlip, flipRatio) * 0.5, 1.0);
    gl_Position = projectionMatrix * (mvPosition + flipOffset);
  #else
    gl_PointSize = (300.0 / length(mvPosition.xyz));
    mvPosition.y += gl_PointSize * 0.5;
    gl_Position = projectionMatrix * mvPosition;
  #endif

  vWorldPosition = worldPosition;
}
`;

const distanceFragSource = `
uniform vec3 lightPos;
varying vec4 vWorldPosition;

vec4 pack1K(float depth) {
  depth /= 1000.0;
  const vec4 bitSh = vec4(256.0 * 256.0 * 256.0, 256.0 * 256.0, 256.0, 1.0);
  const vec4 bitMsk = vec4(0.0, 1.0 / 256.0, 1.0 / 256.0, 1.0 / 256.0);
  vec4 res = fract(depth * bitSh);
  res -= res.xxyz * bitMsk;
  return res;
}

float unpack1K(vec4 color) {
  const vec4 bitSh = vec4(1.0 / (256.0 * 256.0 * 256.0), 1.0 / (256.0 * 256.0), 1.0 / 256.0, 1.0);
  return dot(color, bitSh) * 1000.0;
}

void main() {
  gl_FragColor = pack1K(length(vWorldPosition.xyz - lightPos.xyz));
}
`;

const particleMotionVertSource = `
attribute vec2 fboUV;

uniform sampler2D texturePosition;
uniform sampler2D texturePrevPosition;

uniform mat4 u_prevModelViewMatrix;
varying vec2 v_motion;

#ifdef USE_BILLBOARD
  attribute vec3 positionFlip;
  uniform float flipRatio;
#endif

void main() {
  vec4 positionInfo = texture2D(texturePosition, fboUV);
  vec4 prevPositionInfo = texture2D(texturePrevPosition, fboUV);

  vec4 pos = modelViewMatrix * vec4(positionInfo.xyz, 1.0);
  vec4 prevPos = u_prevModelViewMatrix * vec4(prevPositionInfo.xyz, 1.0);

  #ifdef USE_BILLBOARD
    vec4 flipOffset = vec4(mix(position, positionFlip, flipRatio) * 0.5, 1.0);
    pos = projectionMatrix * (pos + flipOffset);
    prevPos = projectionMatrix * (prevPos + flipOffset);
  #else
    gl_PointSize = (300.0 / length(pos.xyz));
    pos.y += gl_PointSize * 0.5;
    pos = projectionMatrix * pos;

    prevPos.y += (300.0 / length(prevPos.xyz)) * 0.5;
    prevPos = projectionMatrix * prevPos;
  #endif

  gl_Position = pos;
  v_motion = (pos.xy / pos.w - prevPos.xy / prevPos.w) * 0.5 * step(positionInfo.w, prevPositionInfo.w);
}
`;

let _geometry: THREE.BufferGeometry;
let _material: THREE.ShaderMaterial;
let _distanceMaterial: THREE.ShaderMaterial;
let _motionMaterial: MeshMotionMaterial;
let _mesh: THREE.Mesh | THREE.Points | undefined;

// Keep export for backward compatibility but prefer getMesh()
export let mesh: THREE.Mesh | THREE.Points | undefined;

export function getMesh(): THREE.Mesh | THREE.Points | undefined {
  return _mesh;
}

export function init(renderer: THREE.WebGLRenderer, hand: any): THREE.Mesh | THREE.Points {
  fbo.init(renderer, hand);

  _initGeometry();
  _initMaterial();

  if (settings.useBillboardParticle) {
    _mesh = new THREE.Mesh(_geometry, _material);
  } else {
    _mesh = new THREE.Points(_geometry, _material);
  }

  // mesh.frustumCulled = false;
  _mesh.castShadow = true;
  _mesh.receiveShadow = true;
  (_mesh as any).customDistanceMaterial = _distanceMaterial;
  (_mesh as any).motionMaterial = _motionMaterial;

  // Update export for backward compatibility
  mesh = _mesh;

  return _mesh;
}

function _initGeometry(): void {
  const textureWidth = settings.simulatorTextureWidth;
  const textureHeight = settings.simulatorTextureHeight;

  const AMOUNT = fbo.AMOUNT;
  _geometry = new THREE.BufferGeometry();

  let position: Float32Array;
  let fboUV: Float32Array;

  if (settings.useBillboardParticle) {
    position = new Float32Array(AMOUNT * 3 * 3);
    fboUV = new Float32Array(AMOUNT * 3 * 2);

    const positionFlip = new Float32Array(AMOUNT * 3 * 3);
    // Use addAttribute for compatibility
    if ((_geometry as any).addAttribute) {
      (_geometry as any).addAttribute('positionFlip', new THREE.BufferAttribute(positionFlip, 3));
    } else {
      _geometry.setAttribute('positionFlip', new THREE.BufferAttribute(positionFlip, 3));
    }

    const angle = (Math.PI * 2) / 3;
    let i6: number, i9: number;
    for (let i = 0; i < AMOUNT; i++) {
      i6 = i * 6;
      i9 = i * 9;
      position[i9 + 0] = Math.sin(angle * 2 + Math.PI);
      position[i9 + 1] = Math.cos(angle * 2 + Math.PI);
      position[i9 + 3] = Math.sin(angle + Math.PI);
      position[i9 + 4] = Math.cos(angle + Math.PI);
      position[i9 + 6] = Math.sin(angle * 3 + Math.PI);
      position[i9 + 7] = Math.cos(angle * 3 + Math.PI);

      positionFlip[i9 + 0] = Math.sin(angle * 2);
      positionFlip[i9 + 1] = Math.cos(angle * 2);
      positionFlip[i9 + 3] = Math.sin(angle);
      positionFlip[i9 + 4] = Math.cos(angle);
      positionFlip[i9 + 6] = Math.sin(angle * 3);
      positionFlip[i9 + 7] = Math.cos(angle * 3);

      fboUV[i6 + 0] = fboUV[i6 + 2] = fboUV[i6 + 4] = (i % textureWidth) / textureHeight;
      fboUV[i6 + 1] = fboUV[i6 + 3] = fboUV[i6 + 5] = ~~(i / textureWidth) / textureHeight;
    }
  } else {
    position = new Float32Array(AMOUNT * 3);
    fboUV = new Float32Array(AMOUNT * 2);
    let i2: number;
    for (let i = 0; i < AMOUNT; i++) {
      i2 = i * 2;
      fboUV[i2 + 0] = (i % textureWidth) / textureHeight;
      fboUV[i2 + 1] = ~~(i / textureWidth) / textureHeight;
    }
  }
    // Use addAttribute for compatibility (setAttribute in newer Three.js)
    if ((_geometry as any).addAttribute) {
      (_geometry as any).addAttribute('position', new THREE.BufferAttribute(position, 3));
      (_geometry as any).addAttribute('fboUV', new THREE.BufferAttribute(fboUV, 2));
    } else {
      _geometry.setAttribute('position', new THREE.BufferAttribute(position, 3));
      _geometry.setAttribute('fboUV', new THREE.BufferAttribute(fboUV, 2));
    }
}

// Simple mixIn function matching mout/object/mixIn behavior
function mixIn<T extends Record<string, any>>(target: T, source: Record<string, any>): T {
  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      (target as any)[key] = source[key];
    }
  }
  return target;
}

function _initMaterial(): void {
  const uniforms = THREE.UniformsUtils.merge([
    THREE.UniformsLib.common,
    THREE.UniformsLib.fog,
    THREE.UniformsLib.lights,
  ]);

  _material = new THREE.ShaderMaterial({
    uniforms: mixIn(uniforms, {
      texturePosition: { value: undefined },
      flipRatio: { value: 0 },
    }) as any,
    defines: {
      USE_BILLBOARD: settings.useBillboardParticle,
    },
    vertexShader: parse(particleVertSource),
    fragmentShader: parse(particleFragSource),
    transparent: settings.useBillboardParticle ? false : true,
    blending: settings.useBillboardParticle ? THREE.NoBlending : THREE.NormalBlending,
    depthTest: true,
    depthWrite: true,
    fog: true,
    lights: true,
  });

  _distanceMaterial = new THREE.ShaderMaterial({
    uniforms: {
      lightPos: { value: new THREE.Vector3(0, 0, 0) },
      texturePosition: { value: undefined },
      flipRatio: { value: 0 },
    } as any,
    defines: {
      USE_BILLBOARD: settings.useBillboardParticle,
    },
    vertexShader: parse(distanceVertSource),
    fragmentShader: parse(distanceFragSource),
    depthTest: true,
    depthWrite: true,
    side: THREE.BackSide,
  });

  _motionMaterial = new MeshMotionMaterial({
    motionMultiplier: 0.1,
    uniforms: {
      texturePosition: { value: undefined },
      texturePrevPosition: { value: undefined },
      flipRatio: { value: 0 },
    } as any,
    defines: {
      USE_BILLBOARD: settings.useBillboardParticle,
    },
    vertexShader: parse(particleMotionVertSource),
    depthTest: true,
    depthWrite: true,
    side: THREE.BackSide,
  });
}

export function updateHand(hand: any): void {
  fbo.updateHand(hand);
}

export function update(dt?: number): void {
  // Update hand in FBO if needed
  fbo.update(dt ?? 0);

  if (_mesh) {
    const material = _mesh.material as THREE.ShaderMaterial;
    const customDistanceMaterial = (_mesh as any).customDistanceMaterial as THREE.ShaderMaterial;
    const motionMaterial = (_mesh as any).motionMaterial as THREE.ShaderMaterial;
    
    material.uniforms.texturePosition.value = fbo.positionRenderTarget;
    customDistanceMaterial.uniforms.texturePosition.value = fbo.positionRenderTarget;
    motionMaterial.uniforms.texturePosition.value = fbo.positionRenderTarget;
    motionMaterial.uniforms.texturePrevPosition.value = fbo.prevPositionRenderTarget;
    if (settings.useBillboardParticle) {
      material.uniforms.flipRatio.value ^= 1;
      customDistanceMaterial.uniforms.flipRatio.value ^= 1;
      motionMaterial.uniforms.flipRatio.value ^= 1;
    }
  }
}
