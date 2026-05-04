/**
 * Scene Manager
 * Orchestrates multi-model scenes with unified control
 *
 * Features:
 * - Manage multiple models in a single scene
 * - Automatic camera transitions between models
 * - Unified lighting setup
 * - Scene state management
 * - Performance optimization for multi-model scenes
 */

'use client';

import React, { useCallback, useMemo, useState, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { SceneDefinition, CameraConfig } from '../models/types';
import { modelRegistry } from '../models/registry';
import { computeFramingCamera } from '../camera/utilities';

interface SceneManagerProps {
  scene: SceneDefinition;
  currentModelIndex?: number;
  onModelChange?: (index: number, modelId: string) => void;
  onCameraTransition?: (from: CameraConfig, to: CameraConfig) => void;
  autoTransition?: number; // Auto-transition between models (ms), 0 to disable
}

/**
 * Hook for managing multi-model scene state
 */
export function useSceneManager(
  scene: SceneDefinition,
  onModelChange?: (index: number, modelId: string) => void
) {
  const [currentModelIndex, setCurrentModelIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const autoTransitionTimer = useRef<NodeJS.Timeout | null>(null);

  const currentModel = useMemo(() => {
    const modelRef = scene.models[currentModelIndex];
    if (!modelRef) return null;
    return modelRegistry[modelRef.modelId];
  }, [currentModelIndex, scene.models]);

  const goToModel = useCallback(
    (index: number) => {
      if (index < 0 || index >= scene.models.length) return;
      if (index === currentModelIndex) return;

      setIsTransitioning(true);
      setCurrentModelIndex(index);

      const modelRef = scene.models[index];
      onModelChange?.(index, modelRef.modelId);

      // Reset transition flag after animation
      setTimeout(() => setIsTransitioning(false), 600);
    },
    [currentModelIndex, scene.models, onModelChange]
  );

  const nextModel = useCallback(() => {
    goToModel((currentModelIndex + 1) % scene.models.length);
  }, [currentModelIndex, scene.models.length, goToModel]);

  const prevModel = useCallback(() => {
    goToModel(
      (currentModelIndex - 1 + scene.models.length) % scene.models.length
    );
  }, [currentModelIndex, scene.models.length, goToModel]);

  const startAutoTransition = useCallback((intervalMs: number) => {
    if (autoTransitionTimer.current) {
      clearInterval(autoTransitionTimer.current);
    }
    autoTransitionTimer.current = setInterval(() => {
      nextModel();
    }, intervalMs);
  }, [nextModel]);

  const stopAutoTransition = useCallback(() => {
    if (autoTransitionTimer.current) {
      clearInterval(autoTransitionTimer.current);
      autoTransitionTimer.current = null;
    }
  }, []);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (autoTransitionTimer.current) {
        clearInterval(autoTransitionTimer.current);
      }
    };
  }, []);

  return {
    currentModelIndex,
    currentModel,
    isTransitioning,
    goToModel,
    nextModel,
    prevModel,
    startAutoTransition,
    stopAutoTransition,
  };
}

/**
 * Scene Manager Component
 * Coordinates multiple models and camera transitions
 */
export function SceneManagerComponent({
  scene,
  currentModelIndex: _currentModelIndex = 0,
  onModelChange,
  onCameraTransition,
  autoTransition = 0,
}: SceneManagerProps) {
  const sceneManager = useSceneManager(
    scene,
    onModelChange
  );

  const cameraTarget = useRef<CameraConfig | null>(null);
  const cameraCurrent = useRef<CameraConfig | null>(null);
  const transitionProgress = useRef(0);

  // Update camera target when model changes
  React.useEffect(() => {
    if (!sceneManager.currentModel) return;

    const modelRef = scene.models[sceneManager.currentModelIndex];
    const camera =
      modelRef.camera ||
      sceneManager.currentModel.defaultCamera ||
      computeFramingCamera(sceneManager.currentModel.boundingBox);

    if (!cameraCurrent.current) {
      // First time: snap to target
      cameraCurrent.current = camera;
      cameraTarget.current = camera;
      applyCamera(camera);
    } else {
      // Transition to new camera
      cameraTarget.current = camera;
      transitionProgress.current = 0;
      onCameraTransition?.(cameraCurrent.current, camera);
    }
  }, [sceneManager.currentModelIndex, sceneManager.currentModel, scene.models, onCameraTransition]);

  // Smooth camera transitions each frame
  useFrame((state, dt) => {
    if (!cameraTarget.current || !cameraCurrent.current) return;

    // Smooth transition with damping
    transitionProgress.current = Math.min(
      transitionProgress.current + dt * 2, // 0.5s transition
      1
    );

    // Lerp position
    const pos = new THREE.Vector3(
      THREE.MathUtils.lerp(
        cameraCurrent.current.position[0],
        cameraTarget.current.position[0],
        transitionProgress.current
      ),
      THREE.MathUtils.lerp(
        cameraCurrent.current.position[1],
        cameraTarget.current.position[1],
        transitionProgress.current
      ),
      THREE.MathUtils.lerp(
        cameraCurrent.current.position[2],
        cameraTarget.current.position[2],
        transitionProgress.current
      )
    );
    state.camera.position.copy(pos);

    // Lerp target
    const targetPos = new THREE.Vector3(
      THREE.MathUtils.lerp(
        cameraCurrent.current.target[0],
        cameraTarget.current.target[0],
        transitionProgress.current
      ),
      THREE.MathUtils.lerp(
        cameraCurrent.current.target[1],
        cameraTarget.current.target[1],
        transitionProgress.current
      ),
      THREE.MathUtils.lerp(
        cameraCurrent.current.target[2],
        cameraTarget.current.target[2],
        transitionProgress.current
      )
    );
    state.camera.lookAt(targetPos);

    // When transition complete, update current camera
    if (transitionProgress.current >= 1) {
      cameraCurrent.current = cameraTarget.current;
    }
  });

  // Auto-transition setup
  React.useEffect(() => {
    if (autoTransition > 0) {
      sceneManager.startAutoTransition(autoTransition);
    }
    return () => sceneManager.stopAutoTransition();
  }, [autoTransition, sceneManager]);

  return (
    <group>
      {/* Lighting */}
      <ambientLight intensity={scene.lighting?.ambient ?? 1.2} />
      {scene.lighting?.directional && (
        <directionalLight
          position={scene.lighting.directional.position}
          intensity={scene.lighting.directional.intensity}
          castShadow
        />
      )}

      {/* Models */}
      {scene.models.map((modelRef, index) => (
        <ModelInstance
          key={modelRef.modelId}
          modelId={modelRef.modelId}
          transform={modelRef.transform}
          isVisible={index === sceneManager.currentModelIndex}
          isTransitioning={sceneManager.isTransitioning}
        />
      ))}
    </group>
  );
}

/**
 * Single model instance in scene
 */
interface ModelTransform {
  position?: [number, number, number] | THREE.Vector3;
  rotation?: [number, number, number] | THREE.Euler;
  scale?: number | [number, number, number] | THREE.Vector3;
}

interface ModelInstanceProps {
  modelId: string;
  transform?: ModelTransform;
  isVisible: boolean;
  isTransitioning: boolean;
}

function ModelInstance({ modelId, transform, isVisible, isTransitioning }: ModelInstanceProps) {
  // Simplified - in real implementation would load actual model
  const model = modelRegistry[modelId];
  if (!model) return null;

  const { position = [0, 0, 0], rotation = [0, 0, 0], scale = 1 } = transform || model.defaultTransform || {};

  const positionVec = (Array.isArray(position) ? position : position instanceof THREE.Vector3 ? [position.x, position.y, position.z] : [0, 0, 0]) as [number, number, number];
  const rotationVec = (Array.isArray(rotation) ? rotation : rotation instanceof THREE.Euler ? [rotation.x, rotation.y, rotation.z] : [0, 0, 0]) as [number, number, number];
  const scaleVec = (typeof scale === 'number' ? [scale, scale, scale] : Array.isArray(scale) ? scale : scale instanceof THREE.Vector3 ? [scale.x, scale.y, scale.z] : [1, 1, 1]) as [number, number, number];

  return (
    <group
      visible={isVisible}
      position={positionVec}
      rotation={rotationVec}
      scale={scaleVec}
    >
      {/* Model would be loaded here via useGLTF or similar */}
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="lightblue" />
      </mesh>
    </group>
  );
}

/**
 * Apply camera configuration
 */
function applyCamera(config: CameraConfig, camera?: THREE.PerspectiveCamera): void {
  if (!camera) return;
  camera.position.set(...config.position);
  camera.lookAt(...config.target);
  if (config.fov) camera.fov = config.fov;
}

/**
 * Model carousel component
 * Shows list of models with selection
 */
export function ModelCarousel({
  scene,
  currentIndex,
  onSelect,
}: {
  scene: SceneDefinition;
  currentIndex: number;
  onSelect: (index: number) => void;
}) {
  return (
    <div
      style={{
        display: 'flex',
        gap: '8px',
        padding: '16px',
        background: 'rgba(0, 0, 0, 0.5)',
        borderRadius: '8px',
        overflow: 'auto',
      }}
    >
      {scene.models.map((modelRef, index) => {
        const model = modelRegistry[modelRef.modelId];
        return (
          <button
            key={modelRef.modelId}
            onClick={() => onSelect(index)}
            style={{
              padding: '8px 16px',
              background: index === currentIndex ? '#4CAF50' : '#333',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                index === currentIndex ? '#45a049' : '#555';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                index === currentIndex ? '#4CAF50' : '#333';
            }}
          >
            {model?.metadata.name || modelRef.modelId}
          </button>
        );
      })}
    </div>
  );
}
