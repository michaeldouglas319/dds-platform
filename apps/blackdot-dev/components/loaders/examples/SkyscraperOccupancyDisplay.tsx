'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { Suspense } from 'react'
import { ConfigurableStack } from '../ConfigurableStack'
import { mapDataToVisuals, getStatusColor } from '@/hooks/useModelStats'

/**
 * Example: Skyscraper with floor occupancy indicators
 *
 * Demonstrates attaching ConfigurableStack to a building model
 * to show floor-by-floor occupancy status.
 */

interface FloorStatus {
  floor: number
  occupancy: number // 0-100
  capacity: number
}

interface SkyscraperOccupancyDisplayProps {
  floors?: FloorStatus[]
}

export function SkyscraperOccupancyDisplay({
  floors = [
    { floor: 1, occupancy: 95, capacity: 100 },
    { floor: 2, occupancy: 80, capacity: 100 },
    { floor: 3, occupancy: 65, capacity: 100 },
    { floor: 4, occupancy: 45, capacity: 100 },
    { floor: 5, occupancy: 30, capacity: 100 },
  ],
}: SkyscraperOccupancyDisplayProps) {
  const floorColors = floors.map((floor) =>
    getStatusColor(floor.occupancy, 'percentage')
  )

  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-900 to-slate-800">
      <Canvas>
        <PerspectiveCamera makeDefault position={[8, 5, 8]} />
        <OrbitControls />

        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 10]} intensity={0.8} />

        <Suspense fallback={null}>
          {/* Building tower (simplified geometry) */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[3, 10, 3]} />
            <meshStandardMaterial
              color="#475569"
              metalness={0.4}
              roughness={0.6}
            />
          </mesh>

          {/* Floor markers (light line on building) */}
          {floors.map((floor, idx) => (
            <mesh
              key={idx}
              position={[0, 5 - (idx * 2), 1.6]}
            >
              <boxGeometry args={[3.2, 0.1, 0.2]} />
              <meshStandardMaterial
                color={floorColors[idx]}
                emissive={floorColors[idx]}
                emissiveIntensity={0.5}
              />
            </mesh>
          ))}

          {/* Occupancy indicator stack floating beside building */}
          <group position={[5, 0, 0]}>
            <ConfigurableStack
              count={floors.length}
              colors={floorColors}
              boxSize={[1.5, 0.3, 1.5]}
              spacing={0.8}
              rotationDegrees={90}
              duration={1.5}
              opacity={0.85}
            />
          </group>
        </Suspense>
      </Canvas>

      {/* Floor occupancy panel */}
      <div className="absolute bottom-4 left-4 bg-slate-800/80 backdrop-blur p-4 rounded-lg text-white text-sm max-w-xs">
        <h3 className="font-bold mb-3">Floor Occupancy</h3>
        <div className="space-y-2">
          {floors.map((floor, idx) => (
            <div key={idx} className="flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <span>Floor {floor.floor}</span>
                <span className="text-xs text-gray-400">
                  {floor.occupancy}/{floor.capacity}
                </span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${floor.occupancy}%`,
                    backgroundColor: floorColors[idx],
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
