'use client'

import * as THREE from 'three';
import React, { Suspense, useEffect, useState, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { PerspectiveCamera, Environment, MeshDistortMaterial, ContactShadows, useGLTF } from '@react-three/drei';
import { useSpring } from '@react-spring/core';
import { a } from '@react-spring/three';

// React-spring animates native elements, in this case <mesh/> etc,
// but it can also handle 3rd–party objs, just wrap them in "a".
const AnimatedMaterial = a(MeshDistortMaterial);

export interface ModelConfig {
  path: string;
  scale?: number | [number, number, number];
  position?: [number, number, number];
  rotation?: [number, number, number];
  color?: string;
}

export interface InteractiveModelSceneProps {
  /** Array of model configurations for transitions */
  models?: ModelConfig[];
  /** Initial model index */
  initialModelIndex?: number;
  /** Background color spring setter */
  setBg?: (bg: { background: string; fill: string }) => void;
  /** Initial background color */
  initialBackground?: string;
  /** Initial text fill color */
  initialFill?: string;
  /** Enable mouse following */
  enableMouseFollow?: boolean;
  /** Enable mode switching (dark/light) */
  enableModeSwitch?: boolean;
  /** Custom sphere geometry args */
  sphereArgs?: [number, number, number];
  /** Environment preset */
  environment?: 'warehouse' | 'sunset' | 'dawn' | 'night' | 'forest' | 'apartment' | 'studio' | 'city';
  /** Custom colors */
  colors?: {
    hover?: string;
    dark?: string;
    light?: string;
    default?: string;
  };
}

/**
 * Reusable Interactive Model Scene Component
 * Based on gold standard with smooth model transitions
 */
export default function InteractiveModelScene({
  models = [],
  initialModelIndex = 0,
  setBg,
  initialBackground = '#f0f0f0',
  initialFill = '#202020',
  enableMouseFollow = true,
  enableModeSwitch = true,
  sphereArgs = [1, 64, 64],
  environment = 'warehouse',
  colors = {
    hover: '#E8B059',
    dark: '#202020',
    light: 'white',
    default: 'white',
  },
}: InteractiveModelSceneProps) {
  const sphere = useRef<THREE.Mesh>(null);
  const light = useRef<THREE.PointLight>(null);
  const [mode, setMode] = useState(false);
  const [down, setDown] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [currentModelIndex, setCurrentModelIndex] = useState(initialModelIndex);
  const [previousModelIndex, setPreviousModelIndex] = useState<number | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { previousRoot } = useThree();
  const isPortal = !!previousRoot;

  // Get current and previous model configs
  const currentModel = models.length > 0 ? models[currentModelIndex] : null;
  const previousModel = previousModelIndex !== null && models.length > 0 ? models[previousModelIndex] : null;

  // Load models - hooks must be called unconditionally
  // Always call useGLTF for both current and previous model paths
  const currentModelData = useGLTF(currentModel?.path || '/assets/models/building.glb');
  const previousModelData = useGLTF(previousModel?.path || '/assets/models/building.glb');

  // Change cursor on hovered state
  useEffect(() => {
    if (isPortal) return;
    document.body.style.cursor = hovered
      ? 'none'
      : `url('data:image/svg+xml;base64,${btoa(
          '<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="16" r="10" fill="#E8B059"/></svg>'
        )}'), auto`;
  }, [hovered, isPortal]);

  // Make the bubble float and follow the mouse
  // This is frame-based animation, useFrame subscribes the component to the render-loop
  useFrame((state) => {
    if (!enableMouseFollow || isPortal) return;

    if (light.current) {
      light.current.position.x = state.mouse.x * 20;
      light.current.position.y = state.mouse.y * 20;
    }

    if (sphere.current) {
      sphere.current.position.x = THREE.MathUtils.lerp(
        sphere.current.position.x,
        hovered ? state.mouse.x / 2 : 0,
        0.2
      );
      sphere.current.position.y = THREE.MathUtils.lerp(
        sphere.current.position.y,
        Math.sin(state.clock.elapsedTime / 1.5) / 6 + (hovered ? state.mouse.y / 2 : 0),
        0.2
      );
    }
  });

  // Springs for color and overall looks, this is state-driven animation
  // React-spring is physics based and turns static props into animated values
  const [{ wobble, coat, color, ambient, env, modelOpacity, modelScale }] = useSpring(
    {
      wobble: down ? 1.2 : hovered ? 1.05 : 1,
      coat: mode && !hovered ? 0.04 : 1,
      ambient: mode && !hovered ? 1.5 : 0.5,
      env: mode && !hovered ? 0.4 : 1,
      color: hovered ? colors.hover : mode ? colors.dark : colors.default,
      modelOpacity: isTransitioning ? 0 : 1,
      modelScale: isTransitioning ? 0.8 : 1,
      config: (n: string) => {
        if (n === 'wobble' && hovered) {
          return { mass: 2, tension: 1000, friction: 10 };
        }
        return { mass: 1, tension: 170, friction: 26 }; // Default config
      },
    },
    [mode, hovered, down, isTransitioning, colors]
  );

  // Handle model transition
  const transitionToModel = (index: number) => {
    if (index === currentModelIndex || index < 0 || index >= models.length) return;
    
    setPreviousModelIndex(currentModelIndex);
    setIsTransitioning(true);
    
    // Wait for fade out, then switch model
    setTimeout(() => {
      setCurrentModelIndex(index);
      setIsTransitioning(false);
      // Clear previous model index after transition completes
      setTimeout(() => setPreviousModelIndex(null), 500);
    }, 300);
  };

  // Cycle through models on click if multiple models provided
  const handleClick = () => {
    if (models.length > 1) {
      const nextIndex = (currentModelIndex + 1) % models.length;
      transitionToModel(nextIndex);
    }
    
    if (enableModeSwitch) {
      setDown(false);
      const newMode = !mode;
      setMode(newMode);
      if (setBg) {
        setBg({
          background: !newMode ? (initialBackground ?? '#ffffff') : (colors.dark ?? '#202020'),
          fill: !newMode ? (initialFill ?? '#000000') : (initialBackground ?? '#ffffff'),
        });
      }
    }
  };

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 4]} fov={75}>
        <a.ambientLight intensity={ambient} />
        <a.pointLight ref={light} position-z={-15} intensity={env} color="#F8C069" />
      </PerspectiveCamera>
      <Suspense fallback={null}>
        {/* Render sphere if no models provided */}
        {!currentModel && (
          <a.mesh
            ref={sphere}
            scale={wobble}
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => setHovered(false)}
            onPointerDown={() => setDown(true)}
            onPointerUp={handleClick}>
            <sphereGeometry args={sphereArgs} />
            <AnimatedMaterial
              color={color}
              envMapIntensity={env}
              clearcoat={coat}
              clearcoatRoughness={0}
              metalness={0.1}
            />
          </a.mesh>
        )}

        {/* Render previous model (fading out) */}
        {previousModel && isTransitioning && (
          <a.group
            scale={modelOpacity.to((v) => [v, v, v])}
            visible={modelOpacity.to((v) => v > 0.01)}
            position={previousModel.position || [0, 0, 0]}
            rotation={previousModel.rotation || [0, 0, 0]}
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => setHovered(false)}
            onPointerDown={() => setDown(true)}
            onPointerUp={handleClick}>
            <primitive
              object={previousModelData.scene.clone()}
              scale={previousModel.scale || 1}
            />
          </a.group>
        )}

        {/* Render current 3D model (fading in) */}
        {currentModel && (
          <a.group
            scale={modelScale.to((v) => [v, v, v])}
            visible={modelOpacity.to((v) => v > 0.01)}
            position={currentModel.position || [0, 0, 0]}
            rotation={currentModel.rotation || [0, 0, 0]}
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => setHovered(false)}
            onPointerDown={() => setDown(true)}
            onPointerUp={handleClick}>
            <primitive
              object={currentModelData.scene.clone()}
              scale={currentModel.scale || 1}
            />
          </a.group>
        )}

        <Environment preset={environment} />
        <ContactShadows
          rotation={[Math.PI / 2, 0, 0]}
          position={[0, -1.6, 0]}
          opacity={mode ? 0.8 : 0.4}
          width={15}
          height={15}
          blur={2.5}
          far={1.6}
        />
      </Suspense>
    </>
  );
}

