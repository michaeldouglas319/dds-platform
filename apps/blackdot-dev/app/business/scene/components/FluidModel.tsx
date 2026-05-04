'use client';

import { useRef, useMemo, useEffect, memo, useCallback, useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { Center } from '@react-three/drei';
import * as THREE from 'three';
import { useCachedModel } from '@/lib/threejs/utils/modelCache';
import { optimizeGLTFScene } from '@/lib/threejs/optimization/modelOptimization';
import { detectDeviceCapabilities, getOptimalModelOptions } from '@/lib/threejs/optimization/deviceCapability';
import type { ModelConfig } from '@/lib/config/content';
import type { FluidConfig } from '@/lib/threejs/physics/fluidConfig';
import { FluidSolver } from '@/lib/threejs/physics/fluidSolver';
import { FluidVisualization } from './FluidVisualization';

interface FluidModelProps {
  modelConfig: ModelConfig;
  fluidConfig?: FluidConfig;
  onForceUpdate?: (forces: { force: THREE.Vector3; velocity: number; pressure: number }) => void;
  onSimulationStateChange?: (state: { isRunning: boolean; frameCount: number; time: number }) => void;
  onModelDimensionsChange?: (dimensions: { width: number; height: number; depth: number }) => void;
}

export const FluidModel = memo(function FluidModel({
  modelConfig,
  fluidConfig,
  onForceUpdate,
  onSimulationStateChange,
}: FluidModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const modelRef = useRef<THREE.Group | null>(null);
  const solverRef = useRef<FluidSolver | null>(null);
  const { gl } = useThree();
  const [isSimulating, setIsSimulating] = useState(false);

  // Initialize solver
  useEffect(() => {
    if (!fluidConfig) {
      solverRef.current = null;
      return;
    }
    solverRef.current = new FluidSolver(fluidConfig);
    setIsSimulating(true); // Auto-start simulation
  }, [fluidConfig]);

  // Load and optimize model
  const deviceCapabilities = useMemo(() => detectDeviceCapabilities(), []);
  const modelOptions = useMemo(() => getOptimalModelOptions(deviceCapabilities), [deviceCapabilities]);

  if (!modelConfig.path) {
    return null;
  }

  const model = useCachedModel(modelConfig.path, (scene) => optimizeGLTFScene(scene, modelOptions) as THREE.Group);

  // Start simulation
  const startSimulation = useCallback(() => {
    if (solverRef.current) {
      solverRef.current.reset();
      setIsSimulating(true);
    }
  }, []);

  // Stop simulation
  const stopSimulation = useCallback(() => {
    setIsSimulating(false);
  }, []);

  // Pause simulation
  const pauseSimulation = useCallback(() => {
    setIsSimulating((prev) => !prev);
  }, []);

  // Update simulation
  useFrame((state, dt) => {
    const solver = solverRef.current;
    if (!solver || !isSimulating || !modelRef.current) return;

    // Update solver with model motion
    if (groupRef.current) {
      const pos = groupRef.current.position;
      const gridRes = solver.getGridResolution();

      // Normalize position to grid coordinates
      const gx = pos.x * gridRes[0] * 0.5 + gridRes[0] * 0.5;
      const gy = pos.y * gridRes[1] * 0.5 + gridRes[1] * 0.5;
      const gz = pos.z * gridRes[2] * 0.5 + gridRes[2] * 0.5;

      // Add continuous velocity disturbance to create visible flow
      const angle = state.clock.elapsedTime * 0.5;
      const forceStrength = 0.3;
      solver.addVelocity(
        gx + Math.sin(angle) * 0.2,
        gy,
        gz + Math.cos(angle) * 0.2,
        Math.sin(angle) * forceStrength,
        0.1,
        Math.cos(angle) * forceStrength,
        2
      );

      // Mark model as solid boundary
      let minDist = Infinity;
      modelRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh && child.geometry) {
          const boundingBox = new THREE.Box3().setFromObject(child);
          const size = boundingBox.getSize(new THREE.Vector3());
          const radius = Math.max(size.x, size.y, size.z) * 0.5;
          minDist = Math.min(minDist, radius);

          const childPos = new THREE.Vector3();
          child.getWorldPosition(childPos);
          const cgx = childPos.x * gridRes[0] * 0.5 + gridRes[0] * 0.5;
          const cgy = childPos.y * gridRes[1] * 0.5 + gridRes[1] * 0.5;
          const cgz = childPos.z * gridRes[2] * 0.5 + gridRes[2] * 0.5;

          solver.setSolidBoundary(cgx, cgy, cgz, Math.max(1, Math.floor(radius * gridRes[0] * 0.5)));
        }
      });
    }

    // Step simulation
    solver.step(dt);

    // Calculate forces on model
    if (onForceUpdate && modelRef.current) {
      let totalForce = new THREE.Vector3();
      let totalVelocity = 0;
      let maxPressure = 0;
      let sampleCount = 0;

      modelRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh && child.geometry) {
          const positions = (child.geometry as THREE.BufferGeometry).getAttribute('position');
          if (positions) {
            for (let i = 0; i < Math.min(positions.count, 100); i++) {
              const vertex = new THREE.Vector3().fromBufferAttribute(positions, i);
              const worldPos = child.localToWorld(vertex.clone());

              const gridRes = solver.getGridResolution();
              const gx = worldPos.x * gridRes[0] * 0.5 + gridRes[0] * 0.5;
              const gy = worldPos.y * gridRes[1] * 0.5 + gridRes[1] * 0.5;
              const gz = worldPos.z * gridRes[2] * 0.5 + gridRes[2] * 0.5;

              const vel = solver.getVelocity(gx, gy, gz);
              const pressure = solver.getPressure(gx, gy, gz);

              totalForce.add(vel.multiplyScalar(pressure * 0.1));
              totalVelocity += vel.length();
              maxPressure = Math.max(maxPressure, Math.abs(pressure));
              sampleCount++;
            }
          }
        }
      });

      if (sampleCount > 0) {
        onForceUpdate({
          force: totalForce.divideScalar(sampleCount),
          velocity: totalVelocity / sampleCount,
          pressure: maxPressure,
        });
      }
    }

    // Update simulation state
    if (onSimulationStateChange) {
      onSimulationStateChange({
        isRunning: true,
        frameCount: solver.getFrameCount(),
        time: solver.getTotalTime(),
      });
    }
  });

  // Cleanup
  useEffect(() => {
    return () => {
      try {
        const webglContext = gl.getContext() as WebGLRenderingContext | WebGL2RenderingContext | null;
        if (webglContext && !webglContext.isContextLost()) {
          if (modelRef.current) {
            modelRef.current.traverse((child) => {
              if (child instanceof THREE.Mesh) {
                if (child.geometry) child.geometry.dispose();
                if (child.material) {
                  const materials = Array.isArray(child.material) ? child.material : [child.material];
                  materials.forEach((mat) => {
                    Object.keys(mat).forEach((key) => {
                      const value = (mat as Record<string, unknown>)[key];
                      if (value instanceof THREE.Texture) {
                        value.dispose();
                      }
                    });
                    mat.dispose();
                  });
                }
              }
            });
          }
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('FluidModel cleanup error:', error);
        }
      }
    };
  }, [gl]);

  useEffect(() => {
    modelRef.current = model as THREE.Group;
  }, [model]);

  const scale = modelConfig.scale || 1;
  const position = modelConfig.position || [0, 0, 0];
  const rotation = modelConfig.rotation || [0, 0, 0];

  return (
    <Center>
      <group
        ref={groupRef}
        scale={scale}
        position={position as [number, number, number]}
        rotation={rotation as [number, number, number]}
      >
        <primitive object={model} />
        {fluidConfig && (
          <FluidVisualization
            solver={solverRef.current}
            config={fluidConfig}
          />
        )}
      </group>
    </Center>
  );
});

FluidModel.displayName = 'FluidModel';
