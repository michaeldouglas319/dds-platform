import * as THREE from 'three';
import { parse } from '../helpers/shaderParse';
import { loadShader } from '../helpers/shaderLoader';
import { settings } from './settings';

// Shader sources
const fboVert = `
void main() {
  gl_Position = vec4(position, 1.0);
}
`;

const fboThroughFrag = `
uniform vec2 resolution;
uniform sampler2D inputTexture;

void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec3 color = texture2D(inputTexture, uv).xyz;
  gl_FragColor = vec4(color, 1.0);
}
`;

const velocityFragSource = `
uniform vec2 resolution;

uniform sampler2D textureVelocity;
uniform sampler2D texturePosition;
uniform mat4 data[16];
uniform vec3 palmVelocity;

uniform float handBounceRatio;
uniform float handForce;
uniform float gravity;

const float INTERSECTION_PRECISION = 1.0;
const float FAR = 2000.0;

#pragma glslify: map = require(./map)
#pragma glslify: calcNormal = require(./calcNormal)
#pragma glslify: hash = require(./hash)
#pragma glslify: random = require(glsl-random)

void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;

  vec4 positionInfo = texture2D(texturePosition, uv);
  vec3 position = positionInfo.xyz;
  vec3 velocity = texture2D(textureVelocity, uv).xyz;

  float d = map(position);

  if(positionInfo.w < 0.005) {
    d = FAR;
    velocity = vec3(0.0, random(uv) * 1.0, 0.0);
  } else {
    if(position.y < 0.0) {
      float groundBounceRatio = random(position.xz);
      velocity.y *= -0.5 * groundBounceRatio;
      velocity.xz *= 0.5 * groundBounceRatio;

      // add some fake physics on the floor to make it looks better when
      // the hand is not blocking the particles
      float strength = length(velocity) * pow(positionInfo.w, 3.0);
      velocity.x += (random(uv + 0.1) - 0.5) * strength;
      velocity.z += (random(uv + 0.4) - 0.5) * strength;
    } else {
      velocity.y -= (0.03 - 0.005 * random(uv + 5.0)) * gravity;
    }

    float velocityDistance = length(velocity);
    d = map(position);
    if(d < velocityDistance) {
      if(d > INTERSECTION_PRECISION) {
        // raymarch
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
      vec3 normal = calcNormal(position);

      velocity = reflect(velocity, normal) * handBounceRatio;
      vec3 palmDirection = normalize(palmVelocity);
      velocity += palmVelocity * handForce * max(dot(palmDirection, normal), 0.0);
    }
  }

  gl_FragColor = vec4(velocity, d);
}
`;

const positionFragSource = `
uniform vec2 resolution;

uniform sampler2D textureVelocity2;
uniform sampler2D textureVelocity;
uniform sampler2D texturePosition;
uniform mat4 data[16];

uniform float dropRadius;
uniform float fromY;
uniform float yDynamicRange;

const float INTERSECTION_PRECISION = 1.0;
const float FAR = 2000.0;
const float PI_2 = 6.2831853072;

#pragma glslify: map = require(./map)
#pragma glslify: calcNormal = require(./calcNormal)
#pragma glslify: hash = require(./hash)
#pragma glslify: random = require(glsl-random)

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
    positionInfo.w = 1.0 + random(uv + 2.0);
    float a = hash(uv.x) * PI_2;
    float r = pow(hash(uv.y), 0.75) * dropRadius;
    position = vec3(cos(a) * r, fromY + random(uv + 1.0) * yDynamicRange, sin(a) * r);
  } else {
    float velocityDistance = length(prevVelocity);
    if(d < velocityDistance) {
      if(d > INTERSECTION_PRECISION) {
        // raymarch
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

    position += velocity;
  }

  gl_FragColor = vec4(position, positionInfo.w);
}
`;

export interface HandData {
  palmOutputMatrix: THREE.Matrix4;
  fingerBones: Array<{ outputMatrix: THREE.Matrix4 }>;
  palmVelocity: THREE.Vector3;
}

let _copyShader: THREE.ShaderMaterial;
let _velocityShader: THREE.ShaderMaterial;
let _positionShader: THREE.ShaderMaterial;
let _velocityRenderTarget: THREE.WebGLRenderTarget;
let _velocityRenderTarget2: THREE.WebGLRenderTarget;
let _positionRenderTarget: THREE.WebGLRenderTarget;
let _positionRenderTarget2: THREE.WebGLRenderTarget;

let _renderer: THREE.WebGLRenderer;
let _fboMesh: THREE.Mesh;
let _fboScene: THREE.Scene;
let _fboCamera: THREE.Camera;
let _data: THREE.Matrix4[];
let _hand: HandData | undefined;

export let AMOUNT: number;
export let positionRenderTarget: THREE.WebGLRenderTarget | undefined;
export let prevPositionRenderTarget: THREE.WebGLRenderTarget | undefined;

export function init(renderer: THREE.WebGLRenderer, hand: HandData): void {
  _renderer = renderer;
  _hand = hand;

  const gl = _renderer.getContext();
  
  // Check for vertex texture support
  const maxVertexTextures = gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS);
  if (!maxVertexTextures || maxVertexTextures === 0) {
    console.error('No support for vertex shader textures!');
    return;
  }
  
  // Check WebGL version - WebGL2 has native float texture support
  // React Three Fiber uses WebGL2 by default in modern browsers
  const version = gl.getParameter(gl.VERSION) || '';
  const isWebGL2 = version.includes('WebGL 2') || 
                   (gl as any).MAX_COLOR_ATTACHMENTS !== undefined;
  
  if (!isWebGL2) {
    // WebGL1: Check for float texture extension
    const floatExtension = gl.getExtension('OES_texture_float');
    if (!floatExtension) {
      console.warn('OES_texture_float extension not available. Trying to continue anyway...');
      // Don't return - try to continue, as some browsers might still work
    } else {
      // Also try to get linear filtering support (optional but recommended)
      gl.getExtension('OES_texture_float_linear');
    }
  }
  // WebGL2: Float textures are supported natively, no extension needed

  AMOUNT = settings.simulatorTextureWidth * settings.simulatorTextureHeight;

  _data = [hand.palmOutputMatrix];
  for (let i = 0, len = hand.fingerBones.length; i < len; i++) {
    _data.push(hand.fingerBones[i].outputMatrix);
  }

  _fboScene = new THREE.Scene();
  _fboCamera = new THREE.Camera();
  _fboCamera.position.z = 1;

  _copyShader = new THREE.ShaderMaterial({
    uniforms: {
      resolution: {
        value: new THREE.Vector2(settings.simulatorTextureWidth, settings.simulatorTextureHeight),
      },
      inputTexture: { value: null },
    } as any,
    vertexShader: parse(fboVert),
    fragmentShader: parse(fboThroughFrag),
  });

  const velocityFrag = loadShader(velocityFragSource);
  _velocityShader = new THREE.ShaderMaterial({
    uniforms: {
      texturePosition: { value: null },
      textureVelocity: { value: null },
      resolution: {
        value: new THREE.Vector2(settings.simulatorTextureWidth, settings.simulatorTextureHeight),
      },
      data: { value: _data },
      handBounceRatio: { value: settings.handBounceRatio },
      handForce: { value: settings.handForce },
      gravity: { value: settings.gravity },
      palmVelocity: { value: hand.palmVelocity },
    } as any,
    defines: {
      HAND_AMOUNT: settings.hands,
      MATRIX_AMOUNT: settings.hands * 16,
    },
    vertexShader: parse(fboVert),
    fragmentShader: parse(velocityFrag),
    transparent: false,
    depthWrite: false,
    depthTest: false,
  });

  const positionFrag = loadShader(positionFragSource);
  _positionShader = new THREE.ShaderMaterial({
    uniforms: {
      resolution: {
        value: new THREE.Vector2(settings.simulatorTextureWidth, settings.simulatorTextureHeight),
      },
      texturePosition: { value: null },
      textureVelocity: { value: null },
      textureVelocity2: { value: null },
      dropRadius: { value: settings.particlesDropRadius },
      fromY: { value: settings.particlesFromY },
      yDynamicRange: { value: settings.particlesYDynamicRange },
      data: { value: _data },
    } as any,
    defines: {
      HAND_AMOUNT: settings.hands,
      MATRIX_AMOUNT: settings.hands * 16,
    },
    vertexShader: parse(fboVert),
    fragmentShader: parse(positionFrag),
    transparent: false,
    depthWrite: false,
    depthTest: false,
  });

  // Use PlaneBufferGeometry for compatibility (PlaneGeometry in newer Three.js)
  const PlaneGeo = (THREE as any).PlaneBufferGeometry || THREE.PlaneGeometry;
  _fboMesh = new THREE.Mesh(new PlaneGeo(2, 2), _copyShader);
  _fboScene.add(_fboMesh);

  _velocityRenderTarget = new THREE.WebGLRenderTarget(
    settings.simulatorTextureWidth,
    settings.simulatorTextureHeight,
    {
      wrapS: THREE.RepeatWrapping,
      wrapT: THREE.RepeatWrapping,
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      format: THREE.RGBAFormat,
      type: THREE.FloatType,
      depthBuffer: false,
      stencilBuffer: false,
    }
  );
  _velocityRenderTarget2 = _velocityRenderTarget.clone();
  _copyTexture(_createVelocityTexture(), _velocityRenderTarget);
  _copyTexture(_velocityRenderTarget, _velocityRenderTarget2);

  _positionRenderTarget = new THREE.WebGLRenderTarget(
    settings.simulatorTextureWidth,
    settings.simulatorTextureHeight,
    {
      wrapS: THREE.RepeatWrapping,
      wrapT: THREE.RepeatWrapping,
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      format: THREE.RGBAFormat,
      type: THREE.FloatType,
      depthBuffer: false,
      stencilBuffer: false,
    }
  );
  _positionRenderTarget2 = _positionRenderTarget.clone();

  _copyTexture(_createPositionTexture(), _positionRenderTarget);
  _copyTexture(_positionRenderTarget, _positionRenderTarget2);
}

function _updateVelocity(dt: number): void {
  // swap
  const tmp = _velocityRenderTarget;
  _velocityRenderTarget = _velocityRenderTarget2;
  _velocityRenderTarget2 = tmp;

  _fboMesh.material = _velocityShader;
  _velocityShader.uniforms.textureVelocity.value = _velocityRenderTarget2;
  _velocityShader.uniforms.texturePosition.value = _positionRenderTarget;
  _renderer.setRenderTarget(_velocityRenderTarget);
  _renderer.render(_fboScene, _fboCamera);
  _renderer.setRenderTarget(null);
}

function _updatePosition(dt: number): void {
  // swap
  const tmp = _positionRenderTarget;
  _positionRenderTarget = _positionRenderTarget2;
  _positionRenderTarget2 = tmp;

  _fboMesh.material = _positionShader;
  _positionShader.uniforms.texturePosition.value = _positionRenderTarget2;
  _positionShader.uniforms.textureVelocity.value = _velocityRenderTarget;
  _positionShader.uniforms.textureVelocity2.value = _velocityRenderTarget2;
  _renderer.setRenderTarget(_positionRenderTarget);
  _renderer.render(_fboScene, _fboCamera);
  _renderer.setRenderTarget(null);
}

function _copyTexture(input: THREE.Texture | THREE.WebGLRenderTarget, output: THREE.WebGLRenderTarget): void {
  _fboMesh.material = _copyShader;
  _copyShader.uniforms.inputTexture.value = input instanceof THREE.Texture ? input : input.texture;
  _renderer.setRenderTarget(output);
  _renderer.render(_fboScene, _fboCamera);
  _renderer.setRenderTarget(null);
}

function _createVelocityTexture(): THREE.DataTexture {
  const a = new Float32Array(AMOUNT * 4);
  for (let i = 0, len = a.length; i < len; i += 4) {
    a[i + 0] = 0;
    a[i + 1] = -Math.random() * 10;
    a[i + 2] = 0;
  }
  const texture = new THREE.DataTexture(
    a,
    settings.simulatorTextureWidth,
    settings.simulatorTextureHeight,
    THREE.RGBAFormat,
    THREE.FloatType
  );
  texture.minFilter = THREE.NearestFilter;
  texture.magFilter = THREE.NearestFilter;
  texture.needsUpdate = true;
  texture.flipY = false;
  return texture;
}

function _createPositionTexture(): THREE.DataTexture {
  const a = new Float32Array(AMOUNT * 4);
  const baseRadius = settings.particlesDropRadius;
  const fromY = settings.particlesFromY;
  const yDynamicRange = settings.particlesYDynamicRange;
  let radius: number, angle: number;
  for (let i = 0, len = a.length; i < len; i += 4) {
    angle = Math.random() * Math.PI;
    radius = Math.pow(Math.random(), 0.75) * baseRadius;
    a[i + 0] = Math.cos(angle) * radius;
    a[i + 1] = fromY + Math.random() * yDynamicRange;
    a[i + 2] = Math.sin(angle) * radius;
    a[i + 3] = 0.5 + Math.random();
  }
  const texture = new THREE.DataTexture(
    a,
    settings.simulatorTextureWidth,
    settings.simulatorTextureHeight,
    THREE.RGBAFormat,
    THREE.FloatType
  );
  texture.minFilter = THREE.NearestFilter;
  texture.magFilter = THREE.NearestFilter;
  texture.needsUpdate = true;
  texture.generateMipmaps = false;
  texture.flipY = false;
  return texture;
}

export function updateHand(hand: HandData): void {
  _hand = hand;
  // Update hand data in shader uniforms
  _data[0] = hand.palmOutputMatrix;
  for (let i = 0, len = hand.fingerBones.length; i < len; i++) {
    _data[i + 1] = hand.fingerBones[i].outputMatrix;
  }
  _velocityShader.uniforms.data.value = _data;
  _velocityShader.uniforms.palmVelocity.value = hand.palmVelocity;
  _positionShader.uniforms.data.value = _data;
}

export function update(dt: number): void {
  _positionShader.uniforms.dropRadius.value = settings.particlesDropRadius;
  _positionShader.uniforms.fromY.value = settings.particlesFromY;
  _positionShader.uniforms.yDynamicRange.value = settings.particlesYDynamicRange;

  _velocityShader.uniforms.handBounceRatio.value = settings.handBounceRatio;
  _velocityShader.uniforms.handForce.value = settings.handForce;
  _velocityShader.uniforms.gravity.value = settings.gravity;

  _updateVelocity(dt);
  _updatePosition(dt);

  positionRenderTarget = _positionRenderTarget;
  prevPositionRenderTarget = _positionRenderTarget2;
}
