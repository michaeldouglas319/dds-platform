"use client"

import React from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

interface MapControlsProps {
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onResetCamera?: () => void;
  onRotateLeft?: () => void;
  onRotateRight?: () => void;
}

/**
 * Map Controls Component
 *
 * Provides UI controls for camera navigation (similar to Plateforme 10's controls).
 * Displays instructions for desktop and mobile interaction.
 */
export function MapControls({
  onZoomIn,
  onZoomOut,
  onResetCamera,
  onRotateLeft,
  onRotateRight,
}: MapControlsProps) {
  return (
    <div className="fixed bottom-6 left-6 z-30 space-y-4">
      {/* Control buttons */}
      <div className="flex flex-col gap-2 bg-black/60 backdrop-blur-md rounded-lg p-2 border border-white/10">
        {/* Zoom controls */}
        <button
          onClick={onZoomIn}
          className="p-2 hover:bg-white/10 rounded transition-colors"
          aria-label="Zoom in"
          title="Zoom in"
        >
          <ZoomIn className="w-5 h-5 text-white" />
        </button>
        <button
          onClick={onZoomOut}
          className="p-2 hover:bg-white/10 rounded transition-colors"
          aria-label="Zoom out"
          title="Zoom out"
        >
          <ZoomOut className="w-5 h-5 text-white" />
        </button>

        <div className="h-px bg-white/10 my-1" />

        {/* Rotation controls */}
        <button
          onClick={onRotateLeft}
          className="p-2 hover:bg-white/10 rounded transition-colors"
          aria-label="Rotate left"
          title="Rotate left"
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
        <button
          onClick={onRotateRight}
          className="p-2 hover:bg-white/10 rounded transition-colors"
          aria-label="Rotate right"
          title="Rotate right"
        >
          <ChevronRight className="w-5 h-5 text-white" />
        </button>

        <div className="h-px bg-white/10 my-1" />

        {/* Reset camera */}
        <button
          onClick={onResetCamera}
          className="p-2 hover:bg-white/10 rounded transition-colors"
          aria-label="Reset camera"
          title="Reset camera"
        >
          <Maximize2 className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Instructions */}
      <div className="bg-black/60 backdrop-blur-md rounded-lg p-4 border border-white/10 max-w-xs">
        {/* Desktop instructions */}
        <div className="hidden md:block space-y-1 text-xs text-gray-300">
          <p className="font-semibold text-white mb-2">Desktop Controls:</p>
          <p><span className="text-white">Left Click</span> - Rotate</p>
          <p><span className="text-white">Right Click</span> - Pan</p>
          <p><span className="text-white">Scroll</span> - Zoom</p>
        </div>

        {/* Mobile instructions */}
        <div className="md:hidden space-y-1 text-xs text-gray-300">
          <p className="font-semibold text-white mb-2">Touch Controls:</p>
          <p><span className="text-white">One Finger</span> - Rotate</p>
          <p><span className="text-white">Two Fingers</span> - Pan</p>
          <p><span className="text-white">Pinch</span> - Zoom</p>
        </div>
      </div>
    </div>
  );
}
