'use client';

import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useMemo, useRef, useCallback } from 'react';
import {
  velocityFragShader,
  positionFragShader,
  fboVertShader,
} from '../shaders/index';

interface FBOParticles {
  particleGeometry: THREE.BufferGeometry;
  positionTexture: THREE.Texture;
  velocityTexture: THREE.Texture;
  velocityMaterial: THREE.ShaderMaterial;
  positionMaterial: THREE.ShaderMaterial;
  compute: (handMatrices: Float32Array, deltaTime: number) => void;
}

export function useFBOParticles(
  particleCount: number,
  initialConfig?: {
    dropRadius?: number;
    fromY?: number;
    yDynamicRange?: number;
  }
): FBOParticles {
  const { gl, camera } = useThree();
  const configRef = useRef({
    dropRadius: initialConfig?.dropRadius ?? 150,
    fromY: initialConfig?.fromY ?? 200,
    yDynamicRange: initialConfig?.yDynamicRange ?? 50,
  });

  // Calculate texture dimensions (must be power of 2 for best performance)
  const textureSize = useMemo(() => {
    let size = 2;
    while (size * size < particleCount) {
      size *= 2;
    }
    return size;
  }, [particleCount]);

  // Create FBO render targets
  const { positionFBO, velocityFBO, prevVelocityFBO } = useMemo(() => {
    const createRenderTarget = () =>
      new THREE.WebGLRenderTarget(textureSize, textureSize, {
        minFilter: THREE.NearestFilter,
        magFilter: THREE.NearestFilter,
        format: THREE.RGBAFormat,
        type: THREE.FloatType,
        generateMipmaps: false,
      });

    return {
      positionFBO: createRenderTarget(),
      velocityFBO: createRenderTarget(),
      prevVelocityFBO: createRenderTarget(),
    };
  }, [textureSize]);

  // Create data textures for initialization
  const initDataTextures = useMemo(() => {
    // Initialize position data
    const positionData = new Float32Array(textureSize * textureSize * 4);
    for (let i = 0; i < particleCount; i++) {
      const idx = i * 4;
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 200;

      positionData[idx] = Math.cos(angle) * radius;
      positionData[idx + 1] = 300 + Math.random() * 100;
      positionData[idx + 2] = Math.sin(angle) * radius;
      positionData[idx + 3] = Math.random();
    }

    // Initialize velocity data
    const velocityData = new Float32Array(textureSize * textureSize * 4);
    for (let i = 0; i < textureSize * textureSize * 4; i += 4) {
      velocityData[i] = (Math.random() - 0.5) * 1;
      velocityData[i + 1] = -5 - Math.random() * 3;
      velocityData[i + 2] = (Math.random() - 0.5) * 1;
      velocityData[i + 3] = 0;
    }

    // Create data textures
    const posTexture = new THREE.DataTexture(positionData, textureSize, textureSize, THREE.RGBAFormat, THREE.FloatType);
    posTexture.magFilter = THREE.NearestFilter;
    posTexture.minFilter = THREE.NearestFilter;
    posTexture.needsUpdate = true;

    const velTexture = new THREE.DataTexture(velocityData, textureSize, textureSize, THREE.RGBAFormat, THREE.FloatType);
    velTexture.magFilter = THREE.NearestFilter;
    velTexture.minFilter = THREE.NearestFilter;
    velTexture.needsUpdate = true;

    return { posTexture, velTexture };
  }, [textureSize, particleCount]);

  // Copy initialization data to FBO targets on first frame
  const initializedRef = useRef(false);

  // Create compute scenes
  const { velocityMaterial, positionMaterial, computeScene, orthoCamera } = useMemo(() => {
    const orthoCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    const scene = new THREE.Scene();

    // Velocity compute material
    const velMaterial = new THREE.ShaderMaterial({
      uniforms: {
        resolution: {
          value: new THREE.Vector2(textureSize, textureSize),
        },
        texturePosition: { value: positionFBO.texture },
        textureVelocity: { value: velocityFBO.texture },
        handMatrices: {
          value: new Array(16).fill(0).map(() => new THREE.Matrix4()),
        },
        palmVelocity: { value: new THREE.Vector3(0, 0, 0) },
        handBounceRatio: { value: 0.1 },
        handForce: { value: 0.015 },
        gravity: { value: 10 },
        deltaTime: { value: 0.016 },
      },
      vertexShader: fboVertShader,
      fragmentShader: velocityFragShader,
      depthWrite: false,
      depthTest: false,
    });

    // Position compute material
    const posMaterial = new THREE.ShaderMaterial({
      uniforms: {
        resolution: {
          value: new THREE.Vector2(textureSize, textureSize),
        },
        texturePosition: { value: positionFBO.texture },
        textureVelocity: { value: velocityFBO.texture },
        textureVelocity2: { value: prevVelocityFBO.texture },
        handMatrices: {
          value: new Array(16).fill(0).map(() => new THREE.Matrix4()),
        },
        dropRadius: { value: configRef.current.dropRadius },
        fromY: { value: configRef.current.fromY },
        yDynamicRange: { value: configRef.current.yDynamicRange },
      },
      vertexShader: fboVertShader,
      fragmentShader: positionFragShader,
      depthWrite: false,
      depthTest: false,
    });

    // Create quad mesh for compute passes
    const quadGeometry = new THREE.PlaneGeometry(2, 2);
    const velQuad = new THREE.Mesh(quadGeometry, velMaterial);
    const posQuad = new THREE.Mesh(quadGeometry, posMaterial);

    scene.add(velQuad, posQuad);

    return {
      velocityMaterial: velMaterial,
      positionMaterial: posMaterial,
      computeScene: scene,
      orthoCamera,
    };
  }, [textureSize, positionFBO, velocityFBO, prevVelocityFBO]);

  // Compute function
  const compute = useCallback(
    (handMatrices: Float32Array, deltaTime: number) => {
      // Initialize FBO textures from data textures on first call
      if (!initializedRef.current) {
        // Use a simple render pass to copy init data to FBO
        const initScene = new THREE.Scene();
        const quadGeometry = new THREE.PlaneGeometry(2, 2);

        // Copy position data
        const posInitMaterial = new THREE.MeshBasicMaterial({
          map: initDataTextures.posTexture,
        });
        const posQuad = new THREE.Mesh(quadGeometry, posInitMaterial);
        initScene.add(posQuad);

        gl.setRenderTarget(positionFBO);
        gl.render(initScene, orthoCamera);

        // Copy velocity data
        initScene.clear();
        const velInitMaterial = new THREE.MeshBasicMaterial({
          map: initDataTextures.velTexture,
        });
        const velQuad = new THREE.Mesh(quadGeometry, velInitMaterial);
        initScene.add(velQuad);

        gl.setRenderTarget(velocityFBO);
        gl.render(initScene, orthoCamera);

        gl.setRenderTarget(null);
        initializedRef.current = true;
      }

      // Update hand matrices in materials
      const matrices = new Array(16).fill(0).map(() => new THREE.Matrix4());
      for (let i = 0; i < 16; i++) {
        const offset = i * 16;
        matrices[i].fromArray(Array.from(handMatrices.slice(offset, offset + 16)));
      }

      velocityMaterial.uniforms.handMatrices.value = matrices;
      velocityMaterial.uniforms.deltaTime.value = deltaTime;
      positionMaterial.uniforms.handMatrices.value = matrices;

      // Render velocity compute pass
      velocityMaterial.uniforms.texturePosition.value = positionFBO.texture;
      velocityMaterial.uniforms.textureVelocity.value = velocityFBO.texture;
      gl.setRenderTarget(velocityFBO);
      gl.render(computeScene, orthoCamera);

      // Copy velocity to prevVelocity for next frame
      positionMaterial.uniforms.textureVelocity2.value = velocityFBO.texture;

      // Render position compute pass
      positionMaterial.uniforms.texturePosition.value = positionFBO.texture;
      positionMaterial.uniforms.textureVelocity.value = velocityFBO.texture;
      gl.setRenderTarget(positionFBO);
      gl.render(computeScene, orthoCamera);

      // Reset render target
      gl.setRenderTarget(null);
    },
    [gl, orthoCamera, velocityMaterial, positionMaterial, computeScene, positionFBO, velocityFBO, prevVelocityFBO, initDataTextures]
  );

  // Create particle geometry
  const particleGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();

    // Position buffer (dummy, will be fetched from texture in vertex shader)
    const positions = new Float32Array(particleCount * 3);
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // FBO UVs for texture coordinate lookup
    const fboUVs = new Float32Array(particleCount * 2);
    for (let i = 0; i < particleCount; i++) {
      const u = (i % textureSize) / textureSize;
      const v = Math.floor(i / textureSize) / textureSize;
      fboUVs[i * 2] = u;
      fboUVs[i * 2 + 1] = v;
    }
    geometry.setAttribute('fboUV', new THREE.BufferAttribute(fboUVs, 2));

    return geometry;
  }, [particleCount, textureSize]);

  return {
    particleGeometry,
    positionTexture: positionFBO.texture,
    velocityTexture: velocityFBO.texture,
    velocityMaterial,
    positionMaterial,
    compute,
  };
}
