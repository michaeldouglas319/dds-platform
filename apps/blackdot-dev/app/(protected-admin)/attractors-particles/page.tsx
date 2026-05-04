'use client'

import { Canvas } from '@react-three/fiber'
import { useState, Suspense } from 'react'
import { CurvedTakeoffOrbitV3 } from './v3/CurvedTakeoffOrbitV3'
import { V3_CONFIG, SYNCHRONIZED_FORMATION, GENTLE_DRIFT, CHAOTIC_SWARM } from './v3/config/attractors.config'

function SceneLoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color="#666" />
    </mesh>
  )
}

export default function AttractorsParticlesPage() {
  const [config, setConfig] = useState(V3_CONFIG)
  const [preset, setPreset] = useState<'default' | 'synchronized' | 'gentle' | 'chaotic'>('default')

  const handlePresetChange = (newPreset: typeof preset) => {
    setPreset(newPreset)
    switch (newPreset) {
      case 'synchronized':
        setConfig(SYNCHRONIZED_FORMATION)
        break
      case 'gentle':
        setConfig(GENTLE_DRIFT)
        break
      case 'chaotic':
        setConfig(CHAOTIC_SWARM)
        break
      default:
        setConfig(V3_CONFIG)
    }
  }

  return (
    <div className="w-full h-screen bg-slate-950 relative">
      <Canvas
        camera={{
          position: [3, 5, 8],
          fov: 25,
          near: 0.1,
          far: 1000,
        }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      >
        <Suspense fallback={<SceneLoadingFallback />}>
          <ambientLight intensity={0.5} color="#ffffff" />
          <directionalLight position={[4, 2, 0]} intensity={1.5} color="#ffffff" />
          <CurvedTakeoffOrbitV3 config={config} />
        </Suspense>
      </Canvas>

      {/* Control Panel */}
      <div className="absolute top-4 left-4 bg-slate-900/90 backdrop-blur p-4 rounded-lg text-white max-w-xs">
        <h2 className="text-lg font-bold mb-3">Attractors Particles</h2>

        <div className="space-y-2 mb-4">
          <label className="block text-sm font-semibold">Presets</label>
          <div className="space-y-1">
            {(['default', 'synchronized', 'gentle', 'chaotic'] as const).map((p) => (
              <button
                key={p}
                onClick={() => handlePresetChange(p)}
                className={`w-full px-2 py-1 rounded text-sm transition ${
                  preset === p
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 hover:bg-slate-600'
                }`}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2 border-t border-slate-700 pt-3">
          <label className="block text-sm font-semibold">Debug Options</label>
          <div className="space-y-1 text-xs">
            {(
              [
                'showHelpers',
                'showStageIndicators',
                'showAttractorZones',
                'showPhysicsBounds',
              ] as const
            ).map((option) => (
              <label key={option} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.debug[option]}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      debug: { ...config.debug, [option]: e.target.checked },
                    })
                  }
                  className="w-3 h-3"
                />
                <span>{option.replace('show', '')}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="text-xs text-slate-400 mt-3 border-t border-slate-700 pt-3">
          <p>262,144 particles</p>
          <p>3 interactive attractors</p>
          <p>Morphing stages: 2s→4s→2s</p>
        </div>
      </div>
    </div>
  )
}
