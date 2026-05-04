'use client';

import React from 'react';

interface SimulationControlsProps {
  isRunning: boolean;
  onPlayPause: () => void;
  onReset?: () => void;
}

export function SimulationControls({
  isRunning,
  onPlayPause,
  onReset,
}: SimulationControlsProps) {
  return (
    <div className="bg-card/80 backdrop-blur-sm rounded-lg p-4 min-w-[280px] border border-border">
      <h3 className="text-lg font-semibold mb-4 text-card-foreground">Simulation Controls</h3>

      <div className="flex gap-2 mb-4">
        <button
          onClick={onPlayPause}
          className={`flex-1 px-4 py-2 rounded font-medium transition-colors ${
            isRunning
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {isRunning ? '⏸ Pause' : '▶ Play'}
        </button>
        {onReset && (
          <button
            onClick={onReset}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded font-medium transition-colors"
          >
            ↻ Reset
          </button>
        )}
      </div>

      <div className="mb-2 text-sm text-muted-foreground">
        <p className="font-medium text-card-foreground mb-1">Drone Model</p>
        <p>Super Cam Reconnaissance</p>
        <p className="text-xs mt-1">Russian reconnaissance drone model</p>
      </div>
    </div>
  );
}
