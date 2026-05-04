/**
 * V3 Config Editor - Live Parameter Tuning
 *
 * Sidebar with sliders for all V3 parameters
 */

'use client';

import { useState } from 'react';
import * as THREE from 'three';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import type { V3Config } from '../config/v3.config';

interface V3ConfigEditorProps {
  config: V3Config;
  onConfigChange: (config: V3Config) => void;
}

export function V3ConfigEditor({ config, onConfigChange }: V3ConfigEditorProps) {
  const [isOpen, setIsOpen] = useState(true);

  const updateConfig = (updates: Partial<V3Config>) => {
    onConfigChange({ ...config, ...updates });
  };

  const updateSource = (sourceIndex: number, updates: any) => {
    const newSources = [...config.sources];
    newSources[sourceIndex] = { ...newSources[sourceIndex], ...updates };
    updateConfig({ sources: newSources });
  };

  const updatePhysics = (updates: any) => {
    updateConfig({ physics: { ...config.physics, ...updates } });
  };

  const updateBlueGate = (updates: any) => {
    updateConfig({ blueGate: { ...config.blueGate, ...updates } });
  };

  const updateExitRequirements = (updates: any) => {
    updateConfig({ exitRequirements: { ...config.exitRequirements, ...updates } });
  };

  const updateModelOrientation = (updates: any) => {
    updateConfig({ modelOrientation: { ...config.modelOrientation, ...updates } });
  };

  const updateCollision = (updates: any) => {
    updateConfig({ collision: { ...config.collision, ...updates } });
  };

  const updateTrajectorySettings = (updates: any) => {
    updateConfig({ trajectorySettings: { ...config.trajectorySettings, ...updates } });
  };

  const updateDebug = (updates: any) => {
    updateConfig({ debug: { ...config.debug, ...updates } });
  };

  // Convert radians to degrees for display
  const radToDeg = (rad: number) => (rad * 180) / Math.PI;
  const degToRad = (deg: number) => (deg * Math.PI) / 180;

  return (
    <>
      {/* Toggle Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-20 left-4 z-50 bg-slate-800/95 backdrop-blur-sm"
      >
        {isOpen ? 'Hide' : 'Show'} Config
      </Button>

      {/* Sidebar */}
      {isOpen && (
        <div className="fixed left-4 top-32 z-40 w-80 max-h-[calc(100vh-140px)] overflow-y-auto bg-slate-900/95 backdrop-blur-sm rounded-lg border border-slate-700 shadow-lg">
          <div className="p-4 space-y-6">
            {/* Header */}
            <div className="border-b border-slate-700 pb-2">
              <h3 className="text-white font-bold text-lg">V3 Configuration</h3>
              <p className="text-slate-400 text-xs">Live parameter tuning</p>
            </div>

            {/* Particle Count */}
            <div className="space-y-2">
              <Label className="text-white text-sm font-semibold">
                Particle Count: {config.particleCount}
              </Label>
              <Slider
                value={[config.particleCount]}
                onValueChange={([val]) => updateConfig({ particleCount: val })}
                min={10}
                max={200}
                step={10}
                className="w-full"
              />
            </div>

            {/* Orbit Settings */}
            <div className="space-y-3 border-t border-slate-700 pt-3">
              <h4 className="text-white text-sm font-semibold">Orbit Settings</h4>

              <div className="space-y-2">
                <Label className="text-slate-300 text-xs">
                  Orbit Radius: {config.orbit.radius.toFixed(1)}
                </Label>
                <Slider
                  value={[config.orbit.radius]}
                  onValueChange={([val]) =>
                    updateConfig({ orbit: { ...config.orbit, radius: val } })
                  }
                  min={10}
                  max={50}
                  step={1}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300 text-xs">
                  Donut Height (Y): {config.orbit.center.y.toFixed(1)}
                </Label>
                <Slider
                  value={[config.orbit.center.y]}
                  onValueChange={([val]) =>
                    updateConfig({
                      orbit: {
                        ...config.orbit,
                        center: new THREE.Vector3(
                          config.orbit.center.x,
                          val,
                          config.orbit.center.z
                        ),
                      },
                    })
                  }
                  min={5}
                  max={60}
                  step={1}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300 text-xs">
                  Orbit Speed: {config.orbit.nominalSpeed.toFixed(1)}
                </Label>
                <Slider
                  value={[config.orbit.nominalSpeed]}
                  onValueChange={([val]) => {
                    // Update both orbit speed and physics nominalOrbitSpeed
                    updateConfig({
                      orbit: { ...config.orbit, nominalSpeed: val },
                      physics: { ...config.physics, nominalOrbitSpeed: val },
                    });
                  }}
                  min={0.5}
                  max={15.0}
                  step={0.5}
                  className="w-full"
                />
              </div>
            </div>

            {/* Sources */}
            {config.sources.map((source, idx) => (
              <div key={source.id} className="space-y-3 border-t border-slate-700 pt-3">
                <h4 className="text-white text-sm font-semibold capitalize">
                  {source.id.replace('-', ' ')}
                </h4>

                <div className="space-y-2">
                  <Label className="text-slate-300 text-xs">
                    Intercept Location: {radToDeg(source.orbitEntryAngle).toFixed(0)}°
                  </Label>
                  <Slider
                    value={[radToDeg(source.orbitEntryAngle)]}
                    onValueChange={([val]) =>
                      updateSource(idx, { orbitEntryAngle: degToRad(val) })
                    }
                    min={0}
                    max={360}
                    step={5}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300 text-xs">
                    Spawn Rate: {source.spawnRate.toFixed(1)}s
                  </Label>
                  <Slider
                    value={[source.spawnRate]}
                    onValueChange={([val]) => updateSource(idx, { spawnRate: val })}
                    min={0.5}
                    max={5.0}
                    step={0.1}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300 text-xs">
                    Model Scale: {source.modelScale.toFixed(1)}
                  </Label>
                  <Slider
                    value={[source.modelScale]}
                    onValueChange={([val]) => updateSource(idx, { modelScale: val })}
                    min={0.1}
                    max={5.0}
                    step={0.1}
                    className="w-full"
                  />
                </div>
              </div>
            ))}

            {/* Physics */}
            <div className="space-y-3 border-t border-slate-700 pt-3">
              <h4 className="text-white text-sm font-semibold">Physics</h4>

              <div className="space-y-2">
                <Label className="text-slate-300 text-xs">
                  Gravitational Constant: {config.physics.gravitationalConstant.toFixed(0)}
                </Label>
                <Slider
                  value={[config.physics.gravitationalConstant]}
                  onValueChange={([val]) => updatePhysics({ gravitationalConstant: val })}
                  min={10}
                  max={300}
                  step={10}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300 text-xs">
                  Tangential Boost: {config.physics.tangentialBoost.toFixed(0)}
                </Label>
                <Slider
                  value={[config.physics.tangentialBoost]}
                  onValueChange={([val]) => updatePhysics({ tangentialBoost: val })}
                  min={0}
                  max={500}
                  step={10}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300 text-xs">
                  Radial Confinement: {config.physics.radialConfinement.toFixed(0)}
                </Label>
                <Slider
                  value={[config.physics.radialConfinement]}
                  onValueChange={([val]) => updatePhysics({ radialConfinement: val })}
                  min={0}
                  max={200}
                  step={10}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300 text-xs">
                  Donut Thickness: {config.physics.donutThickness.toFixed(1)}
                </Label>
                <Slider
                  value={[config.physics.donutThickness]}
                  onValueChange={([val]) => updatePhysics({ donutThickness: val })}
                  min={2}
                  max={20}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>

            {/* Blue Gate */}
            <div className="space-y-3 border-t border-slate-700 pt-3">
              <h4 className="text-white text-sm font-semibold">Blue Gate Attraction</h4>

              <div className="space-y-2">
                <Label className="text-slate-300 text-xs">
                  Gate Radius: {config.blueGate.radius.toFixed(1)}
                </Label>
                <Slider
                  value={[config.blueGate.radius]}
                  onValueChange={([val]) => updateBlueGate({ radius: val })}
                  min={2}
                  max={15}
                  step={0.5}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300 text-xs flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={config.blueGate.entryAttraction.enabled}
                    onChange={(e) =>
                      updateBlueGate({
                        entryAttraction: {
                          ...config.blueGate.entryAttraction,
                          enabled: e.target.checked,
                        },
                      })
                    }
                    className="w-4 h-4"
                  />
                  Enable Entry Attraction
                </Label>
              </div>

              {config.blueGate.entryAttraction.enabled && (
                <div className="space-y-2">
                  <Label className="text-slate-300 text-xs">
                    Entry Strength: {config.blueGate.entryAttraction.maxStrength.toFixed(1)}
                  </Label>
                  <Slider
                    value={[config.blueGate.entryAttraction.maxStrength]}
                    onValueChange={([val]) =>
                      updateBlueGate({
                        entryAttraction: {
                          ...config.blueGate.entryAttraction,
                          maxStrength: val,
                        },
                      })
                    }
                    min={0}
                    max={5}
                    step={0.1}
                    className="w-full"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-slate-300 text-xs">
                  Exit Strength: {config.blueGate.exitAttraction.maxStrength.toFixed(1)}
                </Label>
                <Slider
                  value={[config.blueGate.exitAttraction.maxStrength]}
                  onValueChange={([val]) =>
                    updateBlueGate({
                      exitAttraction: {
                        ...config.blueGate.exitAttraction,
                        maxStrength: val,
                      },
                    })
                  }
                  min={0}
                  max={10}
                  step={0.5}
                  className="w-full"
                />
              </div>
            </div>

            {/* Exit Requirements */}
            <div className="space-y-3 border-t border-slate-700 pt-3">
              <h4 className="text-white text-sm font-semibold">Exit Requirements</h4>

              <div className="space-y-2">
                <Label className="text-slate-300 text-xs">
                  Min Orbits: {(config.exitRequirements.minAngleTraveled / (Math.PI * 2)).toFixed(1)}
                </Label>
                <Slider
                  value={[config.exitRequirements.minAngleTraveled / (Math.PI * 2)]}
                  onValueChange={([val]) =>
                    updateExitRequirements({ minAngleTraveled: val * Math.PI * 2 })
                  }
                  min={0.5}
                  max={3.0}
                  step={0.1}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300 text-xs">
                  Min Time in Orbit: {config.exitRequirements.minTimeInOrbit.toFixed(1)}s
                </Label>
                <Slider
                  value={[config.exitRequirements.minTimeInOrbit]}
                  onValueChange={([val]) => updateExitRequirements({ minTimeInOrbit: val })}
                  min={2}
                  max={20}
                  step={0.5}
                  className="w-full"
                />
              </div>
            </div>

            {/* 3D Orbit - Vertical Wave */}
            <div className="space-y-3 border-t border-slate-700 pt-3">
              <h4 className="text-white text-sm font-semibold">3D Orbit (Vertical Wave)</h4>

              <div className="space-y-2">
                <Label className="text-slate-300 text-xs flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={config.verticalWave.enabled}
                    onChange={(e) =>
                      updateConfig({
                        verticalWave: { ...config.verticalWave, enabled: e.target.checked },
                      })
                    }
                    className="w-4 h-4"
                  />
                  Enable 3D Orbit
                </Label>
              </div>

              {config.verticalWave.enabled && (
                <>
                  <div className="space-y-2">
                    <Label className="text-slate-300 text-xs">
                      Wave Amplitude: {(config.verticalWave.amplitudeMultiplier * 100).toFixed(0)}%
                    </Label>
                    <Slider
                      value={[config.verticalWave.amplitudeMultiplier]}
                      onValueChange={([val]) =>
                        updateConfig({
                          verticalWave: { ...config.verticalWave, amplitudeMultiplier: val },
                        })
                      }
                      min={0}
                      max={1.0}
                      step={0.05}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-300 text-xs">
                      Wave Frequency: {config.verticalWave.frequency.toFixed(1)} waves/orbit
                    </Label>
                    <Slider
                      value={[config.verticalWave.frequency]}
                      onValueChange={([val]) =>
                        updateConfig({
                          verticalWave: { ...config.verticalWave, frequency: val },
                        })
                      }
                      min={0}
                      max={8.0}
                      step={0.5}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-300 text-xs">
                      Spring Strength: {config.verticalWave.springConstant.toFixed(1)}
                    </Label>
                    <Slider
                      value={[config.verticalWave.springConstant]}
                      onValueChange={([val]) =>
                        updateConfig({
                          verticalWave: { ...config.verticalWave, springConstant: val },
                        })
                      }
                      min={0}
                      max={20.0}
                      step={0.5}
                      className="w-full"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Orientation Settings */}
            <div className="space-y-3 border-t border-slate-700 pt-3">
              <h4 className="text-white text-sm font-semibold">Orientation Mode</h4>

              <div className="space-y-2">
                <Label className="text-slate-300 text-xs">Mode</Label>
                <select
                  value={config.orientation.mode}
                  onChange={(e) =>
                    updateConfig({
                      orientation: {
                        ...config.orientation,
                        mode: e.target.value as any,
                      },
                    })
                  }
                  className="w-full bg-slate-800 text-white text-xs p-2 rounded border border-slate-600"
                >
                  <option value="fixed">Fixed (No Rotation)</option>
                  <option value="tangent">Tangent (Face Velocity)</option>
                  <option value="combo">Combo (Velocity + Banking)</option>
                  <option value="radial">Radial (Face Center)</option>
                  <option value="tumble">Tumble (Free Rotation)</option>
                </select>
              </div>

              {(config.orientation.mode === 'tangent' || config.orientation.mode === 'combo') && (
                <div className="space-y-2">
                  <Label className="text-slate-300 text-xs">
                    Smoothing: {(config.orientation.tangentSmoothing * 100).toFixed(0)}%
                  </Label>
                  <Slider
                    value={[config.orientation.tangentSmoothing]}
                    onValueChange={([val]) =>
                      updateConfig({
                        orientation: { ...config.orientation, tangentSmoothing: val },
                      })
                    }
                    min={0}
                    max={0.95}
                    step={0.05}
                    className="w-full"
                  />
                </div>
              )}

              {config.orientation.mode === 'combo' && (
                <>
                  <div className="space-y-2">
                    <Label className="text-slate-300 text-xs">
                      Bank Intensity: {config.orientation.bankMultiplier.toFixed(1)}x
                    </Label>
                    <Slider
                      value={[config.orientation.bankMultiplier]}
                      onValueChange={([val]) =>
                        updateConfig({
                          orientation: { ...config.orientation, bankMultiplier: val },
                        })
                      }
                      min={0}
                      max={3.0}
                      step={0.1}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-300 text-xs">
                      Max Bank Angle: {config.orientation.maxBankAngle.toFixed(0)}°
                    </Label>
                    <Slider
                      value={[config.orientation.maxBankAngle]}
                      onValueChange={([val]) =>
                        updateConfig({
                          orientation: { ...config.orientation, maxBankAngle: val },
                        })
                      }
                      min={0}
                      max={90}
                      step={5}
                      className="w-full"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Model Orientation Override */}
            <div className="space-y-3 border-t border-slate-700 pt-3">
              <h4 className="text-white text-sm font-semibold">Model Orientation</h4>
              <p className="text-slate-400 text-[10px]">Native model transform override</p>

              <div className="space-y-2">
                <Label className="text-slate-300 text-xs">
                  Model Scale: {config.modelOrientation.scale.toFixed(2)}
                </Label>
                <Slider
                  value={[config.modelOrientation.scale]}
                  onValueChange={([val]) => updateModelOrientation({ scale: val })}
                  min={0.1}
                  max={2.0}
                  step={0.05}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300 text-xs">
                  Rotation X (Pitch): {radToDeg(config.modelOrientation.rotationX).toFixed(0)}°
                </Label>
                <Slider
                  value={[radToDeg(config.modelOrientation.rotationX)]}
                  onValueChange={([val]) => updateModelOrientation({ rotationX: degToRad(val) })}
                  min={0}
                  max={360}
                  step={15}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300 text-xs">
                  Rotation Y (Yaw): {radToDeg(config.modelOrientation.rotationY).toFixed(0)}°
                </Label>
                <Slider
                  value={[radToDeg(config.modelOrientation.rotationY)]}
                  onValueChange={([val]) => updateModelOrientation({ rotationY: degToRad(val) })}
                  min={0}
                  max={360}
                  step={15}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300 text-xs">
                  Rotation Z (Roll): {radToDeg(config.modelOrientation.rotationZ).toFixed(0)}°
                </Label>
                <Slider
                  value={[radToDeg(config.modelOrientation.rotationZ)]}
                  onValueChange={([val]) => updateModelOrientation({ rotationZ: degToRad(val) })}
                  min={0}
                  max={360}
                  step={15}
                  className="w-full"
                />
              </div>
            </div>

            {/* Collision/Repulsion Settings */}
            <div className="space-y-3 border-t border-slate-700 pt-3">
              <h4 className="text-white text-sm font-semibold">Collision Avoidance</h4>
              <p className="text-slate-400 text-[10px]">Prevent particle overlap</p>

              <div className="space-y-2">
                <Label className="text-slate-300 text-xs flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={config.collision.enabled}
                    onChange={(e) => updateCollision({ enabled: e.target.checked })}
                    className="w-4 h-4"
                  />
                  Enable Collision Repulsion
                </Label>
              </div>

              {config.collision.enabled && (
                <>
                  <div className="space-y-2">
                    <Label className="text-slate-300 text-xs">
                      Collision Width: {config.collision.dimensions.width.toFixed(1)}
                    </Label>
                    <Slider
                      value={[config.collision.dimensions.width]}
                      onValueChange={([val]) => updateCollision({ dimensions: { ...config.collision.dimensions, width: val } })}
                      min={1}
                      max={10}
                      step={0.1}
                      className="w-full"
                    />
                    <p className="text-slate-500 text-[10px]">Collision detection width (X-axis)</p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-300 text-xs">
                      Repulsion Strength: {config.collision.strength.toFixed(1)}
                    </Label>
                    <Slider
                      value={[config.collision.strength]}
                      onValueChange={([val]) => updateCollision({ strength: val })}
                      min={0}
                      max={10}
                      step={0.5}
                      className="w-full"
                    />
                    <p className="text-slate-500 text-[10px]">Force pushing particles apart</p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-300 text-xs">
                      Damping: {(config.collision.damping * 100).toFixed(0)}%
                    </Label>
                    <Slider
                      value={[config.collision.damping]}
                      onValueChange={([val]) => updateCollision({ damping: val })}
                      min={0}
                      max={1}
                      step={0.05}
                      className="w-full"
                    />
                    <p className="text-slate-500 text-[10px]">Reduces oscillation after collision</p>
                  </div>
                </>
              )}
            </div>

            {/* Trajectory Curve Settings */}
            <div className="space-y-3 border-t border-slate-700 pt-3">
              <h4 className="text-white text-sm font-semibold">Trajectory Curves</h4>
              <p className="text-slate-400 text-[10px]">Control entrance/exit curve shape</p>

              <div className="space-y-2">
                <Label className="text-slate-300 text-xs">
                  Curve Tension: {config.trajectorySettings.curveTension.toFixed(2)}
                </Label>
                <Slider
                  value={[config.trajectorySettings.curveTension]}
                  onValueChange={([val]) => updateTrajectorySettings({ curveTension: val })}
                  min={0}
                  max={1.0}
                  step={0.05}
                  className="w-full"
                />
                <p className="text-slate-500 text-[10px]">0 = sharp, 1 = smooth</p>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300 text-xs">
                  Arc Height: {config.trajectorySettings.midpointHeightMultiplier.toFixed(1)}x
                </Label>
                <Slider
                  value={[config.trajectorySettings.midpointHeightMultiplier]}
                  onValueChange={([val]) => updateTrajectorySettings({ midpointHeightMultiplier: val })}
                  min={0.2}
                  max={2.0}
                  step={0.1}
                  className="w-full"
                />
                <p className="text-slate-500 text-[10px]">Height of trajectory arc</p>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300 text-xs">
                  Approach Angle: {config.trajectorySettings.approachAngle.toFixed(0)}°
                </Label>
                <Slider
                  value={[config.trajectorySettings.approachAngle]}
                  onValueChange={([val]) => updateTrajectorySettings({ approachAngle: val })}
                  min={0}
                  max={90}
                  step={5}
                  className="w-full"
                />
                <p className="text-slate-500 text-[10px]">Entry angle to orbit</p>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300 text-xs">
                  Landing Speed: {(config.trajectorySettings.landingSpeed * 100).toFixed(0)}%
                </Label>
                <Slider
                  value={[config.trajectorySettings.landingSpeed]}
                  onValueChange={([val]) => updateTrajectorySettings({ landingSpeed: val })}
                  min={0.3}
                  max={1.0}
                  step={0.05}
                  className="w-full"
                />
                <p className="text-slate-500 text-[10px]">Speed during landing</p>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300 text-xs">
                  Orbit Approach Distance: {config.trajectorySettings.preOrbitDistance.toFixed(1)}
                </Label>
                <Slider
                  value={[config.trajectorySettings.preOrbitDistance]}
                  onValueChange={([val]) => updateTrajectorySettings({ preOrbitDistance: val })}
                  min={3}
                  max={15}
                  step={0.5}
                  className="w-full"
                />
                <p className="text-slate-500 text-[10px]">Tangent waypoint distance before orbit</p>
              </div>
            </div>

            {/* Exit Path Settings */}
            <div className="space-y-3 border-t border-slate-700 pt-3">
              <h4 className="text-white text-sm font-semibold">Exit Path Settings</h4>
              <p className="text-slate-400 text-[10px]">Control landing curve (separate from entry)</p>

              <div className="space-y-2">
                <Label className="text-slate-300 text-xs">
                  Exit Curve Tension: {config.trajectorySettings.exitCurveTension.toFixed(2)}
                </Label>
                <Slider
                  value={[config.trajectorySettings.exitCurveTension]}
                  onValueChange={([val]) => updateTrajectorySettings({ exitCurveTension: val })}
                  min={0}
                  max={1.0}
                  step={0.05}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300 text-xs">
                  Exit Arc Height: {config.trajectorySettings.exitMidpointHeightMultiplier.toFixed(1)}x
                </Label>
                <Slider
                  value={[config.trajectorySettings.exitMidpointHeightMultiplier]}
                  onValueChange={([val]) => updateTrajectorySettings({ exitMidpointHeightMultiplier: val })}
                  min={0.2}
                  max={2.0}
                  step={0.1}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300 text-xs">
                  Exit Departure Distance: {config.trajectorySettings.exitPreOrbitDistance.toFixed(1)}
                </Label>
                <Slider
                  value={[config.trajectorySettings.exitPreOrbitDistance]}
                  onValueChange={([val]) => updateTrajectorySettings({ exitPreOrbitDistance: val })}
                  min={3}
                  max={20}
                  step={0.5}
                  className="w-full"
                />
                <p className="text-slate-500 text-[10px]">Tangent waypoint distance after orbit</p>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300 text-xs">
                  Exit Landing Speed: {(config.trajectorySettings.exitLandingSpeed * 100).toFixed(0)}%
                </Label>
                <Slider
                  value={[config.trajectorySettings.exitLandingSpeed]}
                  onValueChange={([val]) => updateTrajectorySettings({ exitLandingSpeed: val })}
                  min={0.3}
                  max={1.0}
                  step={0.05}
                  className="w-full"
                />
              </div>
            </div>

            {/* Debug Visuals */}
            <div className="space-y-3 border-t border-slate-700 pt-3">
              <h4 className="text-white text-sm font-semibold">Debug Visuals</h4>
              <p className="text-slate-400 text-[10px]">Show helper overlays</p>

              <div className="space-y-2">
                <Label className="text-slate-300 text-xs flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={config.debug.showTrajectories}
                    onChange={(e) => updateDebug({ showTrajectories: e.target.checked })}
                    className="w-4 h-4"
                  />
                  Show Trajectory Curves
                </Label>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300 text-xs flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={config.debug.showWaypoints}
                    onChange={(e) => updateDebug({ showWaypoints: e.target.checked })}
                    className="w-4 h-4"
                  />
                  Show Waypoints
                </Label>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300 text-xs flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={config.debug.showHandoffZone}
                    onChange={(e) => updateDebug({ showHandoffZone: e.target.checked })}
                    className="w-4 h-4"
                  />
                  Show Handoff Zone (85-95%)
                </Label>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300 text-xs flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={config.debug.showGateZones}
                    onChange={(e) => updateDebug({ showGateZones: e.target.checked })}
                    className="w-4 h-4"
                  />
                  Show Blue Gate Zones
                </Label>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300 text-xs flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={config.debug.showOrbitPath}
                    onChange={(e) => updateDebug({ showOrbitPath: e.target.checked })}
                    className="w-4 h-4"
                  />
                  Show Orbit Circle
                </Label>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300 text-xs flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={config.debug.showCollisionSpheres}
                    onChange={(e) => updateDebug({ showCollisionSpheres: e.target.checked })}
                    className="w-4 h-4"
                  />
                  Show Collision Spheres
                </Label>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
