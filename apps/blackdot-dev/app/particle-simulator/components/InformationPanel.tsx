'use client';

import React, { useState } from 'react';

interface StatisticsProp {
  fps: number;
  totalEnergy: number;
  collisions: number;
  avgVelocity: number;
}

interface ForceMetrics {
  dragForce?: number;
  dragCoefficient?: number;
  liftForce?: number;
  liftCoefficient?: number;
  momentumDeficit?: number;
}

interface InformationPanelProps {
  statistics: StatisticsProp;
  forceMetrics?: ForceMetrics;
  scenario?: string;
}

export function InformationPanel({ statistics, forceMetrics, scenario }: InformationPanelProps) {
  const [expanded, setExpanded] = useState(true);
  const fpsColor =
    statistics.fps >= 60
      ? '#4caf50'
      : statistics.fps >= 30
        ? '#ff9800'
        : '#f44336';
  
  // Show force metrics for cylinder scenario
  const showForceMetrics = forceMetrics && scenario && (
    scenario.toLowerCase().includes('cylinder') || 
    scenario.toLowerCase() === 'windtunnelcylinder'
  );

  return (
    <div className="bg-card/80 backdrop-blur-sm rounded-lg border border-border min-w-[280px] overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-center justify-between bg-muted/50 hover:bg-muted/70 transition-colors"
      >
        <h3 className="text-lg font-semibold text-card-foreground">Information</h3>
        <span className={`transform transition-transform ${expanded ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>

      {expanded && (
        <div className="p-4 space-y-4">
          {/* FPS */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-card-foreground">FPS</span>
              <span className="text-sm font-semibold" style={{ color: fpsColor }}>
                {statistics.fps.toFixed(1)}
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div
                className="h-full transition-all"
                style={{
                  width: `${Math.min(100, (statistics.fps / 60) * 100)}%`,
                  backgroundColor: fpsColor,
                }}
              />
            </div>
          </div>

          {/* Total Energy */}
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-card-foreground">Total Energy</span>
            <span className="text-sm font-mono text-muted-foreground">
              {statistics.totalEnergy.toExponential(2)}
            </span>
          </div>

          {/* Collisions */}
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-card-foreground">Collisions</span>
            <span className="text-sm font-mono text-muted-foreground">
              {statistics.collisions}
            </span>
          </div>

          {/* Average Velocity */}
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-card-foreground">Avg Velocity</span>
            <span className="text-sm font-mono text-muted-foreground">
              {statistics.avgVelocity.toFixed(3)}
            </span>
          </div>

          {/* Force Metrics - Show for cylinder scenario */}
          {showForceMetrics && forceMetrics && (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-sm font-semibold mb-2 text-card-foreground">Aerodynamic Forces:</p>
              {forceMetrics.dragCoefficient !== undefined && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-card-foreground">Drag Coefficient (C_D)</span>
                    <span className="text-sm font-mono text-muted-foreground">
                      {forceMetrics.dragCoefficient.toFixed(4)}
                    </span>
                  </div>
                  {forceMetrics.dragForce !== undefined && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-card-foreground">Drag Force</span>
                      <span className="text-sm font-mono text-muted-foreground">
                        {forceMetrics.dragForce.toFixed(2)} N
                      </span>
                    </div>
                  )}
                  {forceMetrics.momentumDeficit !== undefined && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-card-foreground">Momentum Deficit</span>
                      <span className="text-sm font-mono text-muted-foreground">
                        {forceMetrics.momentumDeficit.toFixed(2)} kg·m/s
                      </span>
                    </div>
                  )}
                  {forceMetrics.dragCoefficient === 0 && (
                    <p className="text-xs text-muted-foreground italic mt-2">
                      Note: Potential flow (inviscid) has zero drag (D'Alembert's paradox). 
                      Real viscous flow would show C_D ≈ 0.5-1.2.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Legend */}
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-sm font-semibold mb-2 text-card-foreground">Legend:</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Gravity: Attractive force</li>
              <li>• Charge: Repulsive/attractive force</li>
              <li>• Nuclear: Short-range binding force</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
