'use client';

import { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ImprovedNoise } from 'three/examples/jsm/math/ImprovedNoise.js';

interface CloudInstanceProps {
  position?: [number, number, number];
  scale?: [number, number, number];
  baseColor?: number;
  threshold?: number;
  opacity?: number;
  range?: number;
  steps?: number;
  light?: THREE.Light; // Optional: single light ref
  lights?: THREE.Light[]; // Optional: multiple lights (e.g., from particles)
  showCore?: boolean; // Show solid sphere at center for light comparison
}

/**
 * React Three Fiber component for a volume cloud
 * Add multiple instances to scene without interfering with other functionality
 *
 * Usage:
 * ```
 * <Canvas>
 *   <CurvedTakeoffOrbitV3 ... />
 *   <CloudInstance position={[0, 5, 0]} scale={[2, 2, 2]} />
 *   <CloudInstance position={[5, 3, -5]} scale={[1.5, 1.5, 1.5]} baseColor={0xa0a8b8} />
 * </Canvas>
 * ```
 */
export function CloudInstance(props: CloudInstanceProps) {
  const {
    position = [0, 0, 0],
    scale = [1, 1, 1],
    baseColor = 0x3a4452,
    threshold = 0.3,
    opacity = 0.15,
    range = 0.12,
    steps = 100,
    light = null,
    lights = null,
    showCore = false,
  } = props;

  const { camera, scene } = useThree();
  const meshRef = useRef<THREE.Mesh | null>(null);
  const coreRef = useRef<THREE.Mesh | null>(null);
  const lightRef = useRef<THREE.Light | null>(light);
  const lightsRef = useRef<THREE.Light[]>(lights || []);

  // Keep lights ref in sync
  useEffect(() => {
    lightsRef.current = lights || [];
  }, [lights]);

  useEffect(() => {
    // Generate 3D Perlin noise texture
    const size = 128;
    const data = new Uint8Array(size * size * size);
    const perlin = new ImprovedNoise();
    const vector = new THREE.Vector3();
    const noiseScale = 0.05;

    let i = 0;
    for (let z = 0; z < size; z++) {
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const d = 1.0 - vector.set(x, y, z).subScalar(size / 2).divideScalar(size).length();
          data[i] = (128 + 128 * perlin.noise(x * noiseScale / 1.5, y * noiseScale, z * noiseScale / 1.5)) * d * d;
          i++;
        }
      }
    }

    const texture = new THREE.Data3DTexture(data, size, size, size);
    texture.format = THREE.RedFormat;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.unpackAlignment = 1;
    texture.needsUpdate = true;

    // Vertex shader
    const vertexShader = `
      in vec3 position;

      uniform mat4 modelMatrix;
      uniform mat4 modelViewMatrix;
      uniform mat4 projectionMatrix;
      uniform vec3 cameraPos;

      out vec3 vOrigin;
      out vec3 vDirection;

      void main() {
        vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );

        vOrigin = vec3( inverse( modelMatrix ) * vec4( cameraPos, 1.0 ) ).xyz;
        vDirection = position - vOrigin;

        gl_Position = projectionMatrix * mvPosition;
      }
    `;

    // Fragment shader
    const fragmentShader = `
      precision highp float;
      precision highp sampler3D;

      uniform mat4 modelViewMatrix;
      uniform mat4 projectionMatrix;

      in vec3 vOrigin;
      in vec3 vDirection;

      out vec4 color;

      uniform vec3 base;
      uniform sampler3D map;

      uniform float threshold;
      uniform float range;
      uniform float opacity;
      uniform float steps;
      uniform float frame;
      uniform vec3 lightDir;
      uniform vec3 lightColor;

      uint wang_hash(uint seed) {
        seed = (seed ^ 61u) ^ (seed >> 16u);
        seed *= 9u;
        seed = seed ^ (seed >> 4u);
        seed *= 0x27d4eb2du;
        seed = seed ^ (seed >> 15u);
        return seed;
      }

      float randomFloat(inout uint seed) {
        return float(wang_hash(seed)) / 4294967296.;
      }

      vec2 hitBox( vec3 orig, vec3 dir ) {
        const vec3 box_min = vec3( - 0.5 );
        const vec3 box_max = vec3( 0.5 );
        vec3 inv_dir = 1.0 / dir;
        vec3 tmin_tmp = ( box_min - orig ) * inv_dir;
        vec3 tmax_tmp = ( box_max - orig ) * inv_dir;
        vec3 tmin = min( tmin_tmp, tmax_tmp );
        vec3 tmax = max( tmin_tmp, tmax_tmp );
        float t0 = max( tmin.x, max( tmin.y, tmin.z ) );
        float t1 = min( tmax.x, min( tmax.y, tmax.z ) );
        return vec2( t0, t1 );
      }

      float sample1( vec3 p ) {
        return texture( map, p ).r;
      }

      float shading( vec3 coord ) {
        float step = 0.01;
        return sample1( coord + vec3( - step ) ) - sample1( coord + vec3( step ) );
      }

      vec4 linearToSRGB( in vec4 value ) {
        return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
      }

      void main(){
        vec3 rayDir = normalize( vDirection );
        vec2 bounds = hitBox( vOrigin, rayDir );

        if ( bounds.x > bounds.y ) discard;

        bounds.x = max( bounds.x, 0.0 );

        float stepSize = ( bounds.y - bounds.x ) / steps;

        uint seed = uint( gl_FragCoord.x ) * uint( 1973 ) + uint( gl_FragCoord.y ) * uint( 9277 ) + uint( frame ) * uint( 26699 );
        vec3 size = vec3( textureSize( map, 0 ) );
        float randNum = randomFloat( seed ) * 2.0 - 1.0;
        vec3 p = vOrigin + bounds.x * rayDir;
        p += rayDir * randNum * ( 1.0 / size );

        vec4 ac = vec4( base, 0.0 );

        for ( float i = 0.0; i < steps; i += 1.0 ) {

          float t = bounds.x + i * stepSize;

          float d = sample1( p + 0.5 );

          d = smoothstep( threshold - range, threshold + range, d ) * opacity;

          // Blend procedural shading with external light
          float col = shading( p + 0.5 ) * 2.0 + 0.1;
          float lightInfluence = length( lightColor ) / 3.0; // How much light is present
          col = mix( col, col + 0.5, lightInfluence ); // Brighten where lights are

          ac.rgb += ( 1.0 - ac.a ) * d * col * lightColor;

          ac.a += ( 1.0 - ac.a ) * d;

          if ( ac.a >= 0.95 ) break;

          p += rayDir * stepSize;

        }

        color = linearToSRGB( ac );

        if ( color.a == 0.0 ) discard;

      }
    `;

    // Create mesh
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.RawShaderMaterial({
      glslVersion: THREE.GLSL3,
      uniforms: {
        base: { value: new THREE.Color(baseColor) },
        map: { value: texture },
        cameraPos: { value: new THREE.Vector3() },
        threshold: { value: threshold },
        opacity: { value: opacity },
        range: { value: range },
        steps: { value: steps },
        frame: { value: 0 },
        lightDir: { value: new THREE.Vector3(1, 1, 1).normalize() },
        lightColor: { value: new THREE.Vector3(1, 1, 1) },
      },
      vertexShader,
      fragmentShader,
      side: THREE.BackSide,
      transparent: true,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(...position);
    mesh.scale.set(...scale);

    meshRef.current = mesh;
    scene.add(mesh);

    // Optional core sphere for light comparison
    let core: THREE.Mesh | null = null;
    if (showCore) {
      const coreGeo = new THREE.SphereGeometry(0.15, 32, 32);
      const coreMat = new THREE.MeshPhongMaterial({
        color: baseColor,
        emissive: 0x111111,
        shininess: 100,
      });
      core = new THREE.Mesh(coreGeo, coreMat);
      core.position.copy(mesh.position);
      coreRef.current = core;
      scene.add(core);
    }

    return () => {
      scene.remove(mesh);
      if (core) scene.remove(core);
      geometry.dispose();
      material.dispose();
      texture.dispose();
      if (core) {
        (core.geometry as THREE.SphereGeometry).dispose();
        (core.material as THREE.MeshPhongMaterial).dispose();
      }
    };
  }, [scene, position, scale, baseColor, threshold, opacity, range, steps, showCore]);

  // Animation frame update
  useFrame(({ camera }) => {
    if (meshRef.current && meshRef.current.material instanceof THREE.RawShaderMaterial) {
      const material = meshRef.current.material as THREE.RawShaderMaterial;
      material.uniforms.cameraPos.value.copy(camera.position);
      material.uniforms.frame.value++;
      meshRef.current.rotation.y -= 0.00005; // Very slow rotation

      // Apply combined lighting from multiple particle lights or single light
      const allLights = lightsRef.current && lightsRef.current.length > 0 ? lightsRef.current : (lightRef.current ? [lightRef.current] : []);

      if (allLights.length > 0) {
        const combinedDir = new THREE.Vector3(0, 0, 0);
        const combinedColor = new THREE.Vector3(0, 0, 0);
        let totalInfluence = 0;

        allLights.forEach((l) => {
          if (!l) return;

          let lightDir = new THREE.Vector3(1, 1, 1).normalize();
          let lightColor = new THREE.Vector3(1, 1, 1);
          let lightInfluence = 1.0;

          if (l instanceof THREE.DirectionalLight) {
            lightDir.set(0, 0, 1).applyQuaternion(l.quaternion);
            // Extract RGB from color and scale by intensity
            const color = l.color;
            lightColor.set(color.r, color.g, color.b).multiplyScalar(l.intensity);
            lightInfluence = 1.0;
          } else if (l instanceof THREE.PointLight && meshRef.current) {
            lightDir.subVectors(l.position, meshRef.current.position);
            const distance = lightDir.length();
            lightDir.normalize();

            // Distance-based attenuation
            const range = (l as any).distance || 100;
            lightInfluence = Math.max(0, 1 - (distance / range));

            // Extract RGB from color and scale by intensity
            const color = l.color;
            lightColor.set(color.r, color.g, color.b).multiplyScalar((l as any).intensity || 1);
          }

          // Accumulate
          combinedDir.add(lightDir.multiplyScalar(lightInfluence));
          combinedColor.add(lightColor.multiplyScalar(lightInfluence));
          totalInfluence += lightInfluence;
        });

        // Average if multiple lights
        if (totalInfluence > 0) {
          combinedDir.divideScalar(allLights.length).normalize();
          combinedColor.divideScalar(Math.max(1, allLights.length * 0.5));
        } else {
          combinedDir.set(1, 1, 1).normalize();
          combinedColor.set(1, 1, 1);
        }

        material.uniforms.lightDir.value = combinedDir;
        material.uniforms.lightColor.value = combinedColor;
      }
    }
  });

  return null;
}
