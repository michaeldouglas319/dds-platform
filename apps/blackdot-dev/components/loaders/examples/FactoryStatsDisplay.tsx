'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { Suspense } from 'react'
import { ConfigurableRings } from '../ConfigurableRings'
import { getStatusColor } from '@/hooks/useModelStats'

/**
 * Example: Factory building with production stage indicators
 *
 * Demonstrates attaching ConfigurableRings to a factory model
 * to show production stages and progress.
 */

interface ProductionStage {
  name: string
  progress: number
  active: boolean
}

interface FactoryStatsDisplayProps {
  stages?: ProductionStage[]
}

export function FactoryStatsDisplay({
  stages = [
    { name: 'Raw Materials', progress: 100, active: true },
    { name: 'Processing', progress: 75, active: true },
    { name: 'Assembly', progress: 50, active: true },
    { name: 'Packaging', progress: 25, active: false },
  ],
}: FactoryStatsDisplayProps) {
  const ringColors = stages.map((stage) =>
    getStatusColor(stage.progress, 'percentage')
  )

  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-900 to-slate-800">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 5, 15]} />
        <OrbitControls />

        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 10]} intensity={0.8} />

        <Suspense fallback={null}>
          {/* Factory building (placeholder - would be actual model) */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[4, 6, 4]} />
            <meshStandardMaterial
              color="#64748b"
              metalness={0.3}
              roughness={0.8}
            />
          </mesh>

          {/* Production stage indicators floating above factory */}
          <group position={[0, 8, 0]}>
            <ConfigurableRings
              count={stages.length}
              colors={ringColors}
              baseRadius={0.5}
              radiusIncrement={0.8}
              tubeRadius={0.12}
              rotationSpeed={1.2}
              opacity={0.9}
            />
          </group>

          {/* Stage labels */}
          {stages.map((stage, idx) => (
            <group
              key={idx}
              position={[Math.cos((idx / stages.length) * Math.PI * 2) * 6, 8, Math.sin((idx / stages.length) * Math.PI * 2) * 6]}
            >
              <mesh>
                <planeGeometry args={[2, 0.5]} />
                <meshStandardMaterial
                  color={ringColors[idx]}
                  emissive={ringColors[idx]}
                  emissiveIntensity={0.3}
                />
              </mesh>
            </group>
          ))}
        </Suspense>
      </Canvas>

      {/* Stats panel */}
      <div className="absolute bottom-4 left-4 bg-slate-800/80 backdrop-blur p-4 rounded-lg text-white text-sm">
        <h3 className="font-bold mb-2">Production Stages</h3>
        <div className="space-y-1">
          {stages.map((stage, idx) => (
            <div key={idx} className="flex justify-between items-center">
              <span className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: ringColors[idx] }}
                />
                {stage.name}
              </span>
              <span className="text-xs text-gray-400">{stage.progress}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
