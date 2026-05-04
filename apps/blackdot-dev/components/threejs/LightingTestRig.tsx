'use client';

import { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface LightingTestRigProps {
  position?: [number, number, number];
  lightCount?: number;
  lightRadius?: number;
  lightColor?: 'rainbow' | 'white' | 'blue-red';
  sphereSize?: number;
}

/**
 * Lighting test rig with multiple PointLights and reflective spheres
 * Use to test how lights interact with materials
 *
 * Compare reflective spheres with nearby CloudInstance to see the difference
 *
 * Usage:
 * ```
 * <Canvas>
 *   <LightingTestRig position={[0, 0, 0]} lightCount={4} />
 *   <CloudInstance position={[0, 5, 0]} scale={[2, 2, 2]} />
 * </Canvas>
 * ```
 */
export function LightingTestRig(props: LightingTestRigProps) {
  const {
    position = [0, 0, 0],
    lightCount = 4,
    lightRadius = 8,
    lightColor = 'rainbow',
    sphereSize = 0.3,
  } = props;

  const { scene } = useThree();
  const lightsRef = useRef<THREE.PointLight[]>([]);
  const spheresRef = useRef<THREE.Mesh[]>([]);

  useEffect(() => {
    const lights: THREE.PointLight[] = [];
    const spheres: THREE.Mesh[] = [];

    // Create lights and reflective spheres
    for (let i = 0; i < lightCount; i++) {
      const angle = (i / lightCount) * Math.PI * 2;
      const x = position[0] + Math.cos(angle) * lightRadius;
      const y = position[1] + 5;
      const z = position[2] + Math.sin(angle) * lightRadius;

      // Determine light color
      let color: number;
      if (lightColor === 'rainbow') {
        color = new THREE.Color().setHSL(i / lightCount, 1, 0.5).getHex();
      } else if (lightColor === 'blue-red') {
        color = i % 2 === 0 ? 0x0040ff : 0xff4000;
      } else {
        color = 0xffffff;
      }

      // Create PointLight
      const light = new THREE.PointLight(color, 200, 50);
      light.position.set(x, y, z);
      lights.push(light);
      scene.add(light);

      // Create reflective sphere to show light position and color
      const sphereGeo = new THREE.SphereGeometry(sphereSize, 32, 32);
      const sphereMat = new THREE.MeshPhongMaterial({
        color: new THREE.Color(color),
        emissive: new THREE.Color(color),
        emissiveIntensity: 0.5,
        shininess: 100,
      });
      const sphere = new THREE.Mesh(sphereGeo, sphereMat);
      sphere.position.copy(light.position);
      spheres.push(sphere);
      scene.add(sphere);
    }

    lightsRef.current = lights;
    spheresRef.current = spheres;

    return () => {
      lights.forEach((light) => scene.remove(light));
      spheres.forEach((sphere) => {
        scene.remove(sphere);
        (sphere.geometry as THREE.SphereGeometry).dispose();
        (sphere.material as THREE.MeshPhongMaterial).dispose();
      });
    };
  }, [scene, position, lightCount, lightRadius, lightColor, sphereSize]);

  // Animate lights in circular patterns
  useFrame(() => {
    const time = performance.now() / 1000;

    lightsRef.current.forEach((light, i) => {
      const basePeriod = 5 + i * 0.5; // Each light has different period
      const localTime = (time % basePeriod) / basePeriod;
      const angle = (i / lightCount) * Math.PI * 2 + localTime * Math.PI * 2;

      light.position.x = position[0] + Math.cos(angle) * lightRadius;
      light.position.y = position[1] + 5 + Math.sin(time * 0.5 + i) * 2;
      light.position.z = position[2] + Math.sin(angle) * lightRadius;

      // Update sphere position to match light
      if (spheresRef.current[i]) {
        spheresRef.current[i].position.copy(light.position);
      }
    });
  });

  return null;
}
