"use client"

import React, { useState, useRef } from 'react';
import { InteractiveMapScene } from '../scene/InteractiveMapScene';
import { JobInfoPanel } from '../components/JobInfoPanel';
import { MapControls } from '../components/MapControls';
import { resumeJobs } from '@/app/constants/resumeData.config';
import { getMapLayout } from '../config/map.config';

/**
 * Resume V4 Layout
 *
 * Interactive 3D map layout inspired by Plateforme 10 Interactive Map.
 * Features spatial navigation, annotation markers, and detailed job info panels.
 *
 * Key Features:
 * - 3D spatial resume layout with orbit controls
 * - Clickable annotation markers for each job
 * - Slide-in info panels with job details
 * - Morph animations on model interaction
 * - Graceful handling of missing data/annotations
 * - Responsive mobile and desktop controls
 */
export default function ResumeV4Layout() {
  const [activeAnnotationId, setActiveAnnotationId] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<typeof resumeJobs[0] | null>(null);
  const cameraControlsRef = useRef<any>(null);

  const mapLayout = getMapLayout();

  // Handle annotation click
  const handleAnnotationClick = (annotationId: string) => {
    // Find the job associated with this annotation
    const jobPosition = mapLayout.find(pos => pos.annotation.id === annotationId);
    if (!jobPosition) {
      console.warn('No job found for annotation:', annotationId);
      return;
    }

    const job = resumeJobs.find(j => j.id === jobPosition.jobId);
    if (!job) {
      console.warn('No job data found for:', jobPosition.jobId);
      return;
    }

    setActiveAnnotationId(annotationId);
    setSelectedJob(job);
  };

  // Handle panel close
  const handleClosePanel = () => {
    setActiveAnnotationId(null);
    setSelectedJob(null);
  };

  // Camera control handlers
  const handleZoomIn = () => {
    if (!cameraControlsRef.current) return;
    const controls = cameraControlsRef.current;
    if (controls.getDistance) {
      const currentDistance = controls.getDistance();
      controls.dollyTo(currentDistance * 0.8, true);
    }
  };

  const handleZoomOut = () => {
    if (!cameraControlsRef.current) return;
    const controls = cameraControlsRef.current;
    if (controls.getDistance) {
      const currentDistance = controls.getDistance();
      controls.dollyTo(currentDistance * 1.2, true);
    }
  };

  const handleResetCamera = () => {
    if (!cameraControlsRef.current) return;
    const controls = cameraControlsRef.current;
    if (controls.reset) {
      controls.reset(true);
    }
  };

  const handleRotateLeft = () => {
    if (!cameraControlsRef.current) return;
    const controls = cameraControlsRef.current;
    if (controls.rotate) {
      controls.rotate(-0.5, 0, true);
    }
  };

  const handleRotateRight = () => {
    if (!cameraControlsRef.current) return;
    const controls = cameraControlsRef.current;
    if (controls.rotate) {
      controls.rotate(0.5, 0, true);
    }
  };

  return (
    <div className="relative w-full h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black overflow-hidden">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/80 to-transparent backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            Michael Douglas
          </h1>
          <p className="text-sm md:text-base text-gray-300 mt-1">
            Interactive Resume - Explore my career journey
          </p>
        </div>
      </header>

      {/* 3D Scene */}
      <div className="absolute inset-0">
        <InteractiveMapScene
          activeAnnotationId={activeAnnotationId}
          onAnnotationClick={handleAnnotationClick}
          cameraControlsRef={cameraControlsRef}
        />
      </div>

      {/* Map Controls */}
      <MapControls
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetCamera={handleResetCamera}
        onRotateLeft={handleRotateLeft}
        onRotateRight={handleRotateRight}
      />

      {/* Info Panel */}
      <JobInfoPanel
        job={selectedJob}
        isOpen={!!selectedJob}
        onClose={handleClosePanel}
      />

      {/* Footer hint */}
      {!selectedJob && (
        <div className="absolute bottom-6 right-6 z-20 bg-black/60 backdrop-blur-md rounded-lg px-4 py-2 border border-white/10">
          <p className="text-sm text-gray-300">
            Click on markers to explore positions
          </p>
        </div>
      )}
    </div>
  );
}
