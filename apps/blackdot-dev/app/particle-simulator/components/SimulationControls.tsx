'use client';

import React, { useState } from 'react';

interface SimulationControlsProps {
  isRunning: boolean;
  onPlayPause: () => void;
  onScenarioChange: (scenarioName: string, mode: 'coulomb' | 'windTunnel') => void;
  onReset?: () => void;
}

const SCENARIOS = [
  { name: 'Coulomb Forces', value: 'divider1', disabled: true },
  { name: 'EPN Model', value: 'epn', mode: 'coulomb' as const },
  { name: 'Quark Model', value: 'quark', mode: 'coulomb' as const },
  { name: 'Force Map', value: 'forceMap', mode: 'coulomb' as const },
  { name: 'Two Bodies', value: 'twoBodies', mode: 'coulomb' as const },
  { name: 'Solar System', value: 'solarSystem', mode: 'coulomb' as const },

  { name: 'Wind Tunnel', value: 'divider2', disabled: true },
  { name: 'Laminar Flow', value: 'windTunnelLaminar', mode: 'windTunnel' as const },
  { name: 'Cylinder', value: 'windTunnelCylinder', mode: 'windTunnel' as const },
  { name: 'Sphere', value: 'windTunnelSphere', mode: 'windTunnel' as const },
  { name: 'Box', value: 'windTunnelBox', mode: 'windTunnel' as const },
  { name: 'Aircraft', value: 'windTunnelPlane', mode: 'windTunnel' as const },
  { name: 'Drone', value: 'windTunnelDrone', mode: 'windTunnel' as const },
  { name: 'Shear Flow', value: 'windTunnelShear', mode: 'windTunnel' as const },
  { name: 'Vortex', value: 'windTunnelVortex', mode: 'windTunnel' as const },
  { name: 'Von Kármán Vortex (Beta)', value: 'windTunnelVortexStreet', mode: 'windTunnel' as const },
];

export function SimulationControls({
  isRunning,
  onPlayPause,
  onScenarioChange,
  onReset,
}: SimulationControlsProps) {
  const [selectedScenario, setSelectedScenario] = useState('epn');

  const handleScenarioChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const scenario = SCENARIOS.find((s) => s.value === value);
    if (scenario && !scenario.disabled && scenario.mode) {
      setSelectedScenario(value);
      onScenarioChange(value, scenario.mode);
    }
  };

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

      <div className="mb-2">
        <label className="text-sm font-medium block mb-2 text-card-foreground">Scenario</label>
        <select
          value={selectedScenario}
          onChange={handleScenarioChange}
          className="w-full bg-input border border-border rounded px-3 py-2 text-foreground"
        >
          {SCENARIOS.map((scenario) => (
            <option
              key={scenario.value}
              value={scenario.value}
              disabled={scenario.disabled || false}
            >
              {scenario.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
