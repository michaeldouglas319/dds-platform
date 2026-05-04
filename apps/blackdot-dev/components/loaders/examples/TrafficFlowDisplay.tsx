'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { Suspense } from 'react'
import { ConfigurableWave } from '../ConfigurableWave'
import { mapDataToVisuals } from '@/hooks/useModelStats'

/**
 * Example: Traffic intersection with activity visualization
 *
 * Demonstrates attaching ConfigurableWave loaders to show
 * traffic flow patterns and activity levels.
 */

interface TrafficData {
  hour: number
  vehicleCount: number
  avgSpeed: number
}

interface TrafficFlowDisplayProps {
  trafficData?: TrafficData[]
}

export function TrafficFlowDisplay({
  trafficData = [
    { hour: 0, vehicleCount: 5, avgSpeed: 40 },
    { hour: 1, vehicleCount: 8, avgSpeed: 35 },
    { hour: 2, vehicleCount: 15, avgSpeed: 45 },
    { hour: 3, vehicleCount: 28, avgSpeed: 40 },
    { hour: 4, vehicleCount: 42, avgSpeed: 30 },
    { hour: 5, vehicleCount: 65, avgSpeed: 20 },
    { hour: 6, vehicleCount: 85, avgSpeed: 15 },
    { hour: 7, vehicleCount: 92, avgSpeed: 10 },
    { hour: 8, vehicleCount: 88, avgSpeed: 12 },
    { hour: 9, vehicleCount: 75, avgSpeed: 18 },
  ],
}: TrafficFlowDisplayProps) {
  const vehicleCounts = trafficData.map((d) => d.vehicleCount)
  const { colors, heights } = mapDataToVisuals(vehicleCounts, {
    maxHeight: 2,
    colorScheme: 'heat',
  })

  const peakTraffic = Math.max(...vehicleCounts)
  const avgTraffic =
    vehicleCounts.reduce((a, b) => a + b, 0) / vehicleCounts.length

  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-900 to-slate-800">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 8, 15]} />
        <OrbitControls />

        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 10]} intensity={0.8} />

        <Suspense fallback={null}>
          {/* Intersection (4-way) */}
          {/* Horizontal road */}
          <mesh position={[0, -0.1, 0]}>
            <planeGeometry args={[20, 4]} />
            <meshStandardMaterial color="#2d3748" />
          </mesh>

          {/* Vertical road */}
          <mesh position={[0, -0.1, 0]} rotation={[0, Math.PI / 2, 0]}>
            <planeGeometry args={[20, 4]} />
            <meshStandardMaterial color="#2d3748" />
          </mesh>

          {/* Center intersection marker */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.5, 0.05, 0.5]} />
            <meshStandardMaterial
              color="#fbbf24"
              emissive="#fbbf24"
              emissiveIntensity={0.6}
            />
          </mesh>

          {/* Traffic activity visualization - North direction */}
          <group position={[0, 1.5, -8]}>
            <ConfigurableWave
              count={trafficData.length}
              colors={colors}
              heights={heights}
              cylinderRadius={0.4}
              spacing={0.6}
              duration={1.2}
              opacity={0.8}
            />
          </group>

          {/* Traffic activity visualization - East direction */}
          <group
            position={[8, 1.5, 0]}
            rotation={[0, Math.PI / 2, 0]}
          >
            <ConfigurableWave
              count={trafficData.length}
              colors={colors}
              heights={heights}
              cylinderRadius={0.4}
              spacing={0.6}
              duration={1.2}
              opacity={0.8}
            />
          </group>

          {/* Traffic activity visualization - South direction */}
          <group
            position={[0, 1.5, 8]}
            rotation={[0, Math.PI, 0]}
          >
            <ConfigurableWave
              count={trafficData.length}
              colors={colors}
              heights={heights}
              cylinderRadius={0.4}
              spacing={0.6}
              duration={1.2}
              opacity={0.8}
            />
          </group>

          {/* Traffic activity visualization - West direction */}
          <group
            position={[-8, 1.5, 0]}
            rotation={[0, -Math.PI / 2, 0]}
          >
            <ConfigurableWave
              count={trafficData.length}
              colors={colors}
              heights={heights}
              cylinderRadius={0.4}
              spacing={0.6}
              duration={1.2}
              opacity={0.8}
            />
          </group>
        </Suspense>
      </Canvas>

      {/* Traffic stats panel */}
      <div className="absolute bottom-4 right-4 bg-slate-800/80 backdrop-blur p-4 rounded-lg text-white text-sm max-w-xs">
        <h3 className="font-bold mb-3">Traffic Analysis</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Peak Traffic:</span>
            <span className="font-mono font-bold text-red-400">{peakTraffic} vehicles</span>
          </div>
          <div className="flex justify-between">
            <span>Average Traffic:</span>
            <span className="font-mono font-bold text-yellow-400">
              {Math.round(avgTraffic)} vehicles
            </span>
          </div>
          <div className="flex justify-between">
            <span>Monitoring:</span>
            <span className="text-xs text-gray-400">24-hour period</span>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute top-4 left-4 bg-slate-800/80 backdrop-blur p-3 rounded-lg text-white text-xs">
        <h4 className="font-bold mb-2">Traffic Intensity</h4>
        <div className="flex gap-2">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span>Low</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span>Medium</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span>High</span>
          </div>
        </div>
      </div>
    </div>
  )
}
