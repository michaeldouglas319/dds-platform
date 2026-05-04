"use client"

import React, { useRef } from 'react';
import { StandardCanvas } from '@/components/three';
import { OrbitControls, Environment, Grid } from '@react-three/drei';
import * as THREE from 'three';
import { getMapLayout, CAMERA_CONFIG } from '../config/map.config';
import { AnnotationMarker } from '../components/AnnotationMarker';
import { JobModel } from './JobModel';

interface InteractiveMapSceneProps {
  activeAnnotationId: string | null;
  onAnnotationClick: (annotationId: string) => void;
  cameraControlsRef?: React.RefObject<unknown>;
}

/**
 * Interactive Map Scene
 *
 * Main 3D scene component displaying the interactive resume map.
 * Renders all job positions as 3D models with annotation markers.
 *
 * Features:
 * - OrbitControls for camera navigation
 * - Grid floor for spatial reference
 * - Dynamic lighting
 * - Graceful handling of missing models/annotations
 */
export function InteractiveMapScene({
  activeAnnotationId,
  onAnnotationClick,
  cameraControlsRef,
}: InteractiveMapSceneProps) {
  const mapLayout = getMapLayout();

  return (
    <StandardCanvas
      camera={{
        position: CAMERA_CONFIG.defaultPosition,
        fov: 50,
        near: 0.1,
        far: 1000,
      }}
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1,
      }}
      shadows
      route="resumev4"
      componentName="InteractiveMapScene"
    >
      {/* Lighting */}
      <SceneLighting />

      {/* Environment */}
      <Environment preset="city" />

      {/* Grid floor */}
      <Grid
        args={[50, 50]}
        cellSize={1}
        cellThickness={0.5}
        cellColor="#6b7280"
        sectionSize={5}
        sectionThickness={1}
        sectionColor="#3b82f6"
        fadeDistance={30}
        fadeStrength={1}
        followCamera={false}
        infiniteGrid
      />

      {/* Camera Controls */}
      <OrbitControls
        ref={cameraControlsRef as React.RefObject<any>}
        target={CAMERA_CONFIG.defaultTarget}
        minDistance={CAMERA_CONFIG.minDistance}
        maxDistance={CAMERA_CONFIG.maxDistance}
        enableDamping={CAMERA_CONFIG.enableDamping}
        dampingFactor={CAMERA_CONFIG.dampingFactor}
        enablePan={CAMERA_CONFIG.enablePan}
        enableZoom={CAMERA_CONFIG.enableZoom}
        enableRotate={CAMERA_CONFIG.enableRotate}
        autoRotate={CAMERA_CONFIG.autoRotate}
        autoRotateSpeed={CAMERA_CONFIG.autoRotateSpeed}
        maxPolarAngle={Math.PI / 2} // Prevent camera from going below ground
      />

      {/* Job positions with models and annotations */}
      {mapLayout.map((jobPosition) => {
        const isActive = activeAnnotationId === jobPosition.annotation.id;

        return (
          <React.Fragment key={jobPosition.jobId}>
            {/* 3D Model with morph animations */}
            <JobModel
              jobPosition={jobPosition}
              isActive={isActive}
            />

            {/* Annotation Marker */}
            <AnnotationMarker
              annotation={jobPosition.annotation}
              isActive={isActive}
              onClick={onAnnotationClick}
            />
          </React.Fragment>
        );
      })}
    </StandardCanvas>
  );
}

/**
 * Scene Lighting Setup
 */
function SceneLighting() {
  return (
    <>
      {/* Ambient light for overall illumination */}
      <ambientLight intensity={0.4} />

      {/* Main directional light (sun) */}
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />

      {/* Fill light from opposite side */}
      <directionalLight
        position={[-5, 5, -5]}
        intensity={0.3}
      />

      {/* Rim light from behind */}
      <pointLight
        position={[0, 5, -10]}
        intensity={0.5}
        color="#3b82f6"
      />
    </>
  );
}
