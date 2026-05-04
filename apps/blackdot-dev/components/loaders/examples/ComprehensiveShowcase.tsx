'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { Suspense } from 'react'
import { ConfigurableRings } from '../ConfigurableRings'
import { ConfigurableStack } from '../ConfigurableStack'
import { ConfigurableWave } from '../ConfigurableWave'
import { mapDataToVisuals, getStatusColor } from '@/hooks/useModelStats'

/**
 * Comprehensive showcase of all three configurable loaders
 *
 * Demonstrates a smart city visualization with:
 * - ConfigurableRings for network coverage zones (left)
 * - ConfigurableStack for building floors (center)
 * - ConfigurableWave for traffic activity (right)
 */

interface CityStats {
  networkCoverage: number[] // 4 coverage rings
  buildingOccupancy: number[] // 5 floor levels
  trafficActivity: number[] // 10 time periods
}

interface ComprehensiveShowcaseProps {
  stats?: CityStats
}

export function ComprehensiveShowcase({
  stats = {
    networkCoverage: [95, 88, 75, 60],
    buildingOccupancy: [100, 85, 70, 45, 20],
    trafficActivity: [15, 25, 35, 50, 65, 70, 65, 50, 35, 25],
  },
}: ComprehensiveShowcaseProps) {
  // Network coverage colors (green=good, red=poor)
  const networkColors = stats.networkCoverage.map((coverage) =>
    getStatusColor(coverage, 'percentage')
  )

  // Building occupancy colors
  const buildingColors = stats.buildingOccupancy.map((occupancy) =>
    getStatusColor(occupancy, 'percentage')
  )

  // Traffic activity visualization with heat mapping
  const { colors: trafficColors, heights: trafficHeights } = mapDataToVisuals(
    stats.trafficActivity,
    {
      maxHeight: 2,
      colorScheme: 'heat',
    }
  )

  return (
    <div className="w-full h-full bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 6, 15]} />
        <OrbitControls
          autoRotate
          autoRotateSpeed={2}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 2}
        />

        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 15, 10]} intensity={1} />

        <Suspense fallback={null}>
          {/* Ground plane */}
          <mesh position={[0, -2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[30, 30]} />
            <meshStandardMaterial
              color="#1e293b"
              roughness={0.8}
              metalness={0.1}
            />
          </mesh>

          {/* Central building (core) */}
          <mesh position={[0, 1, 0]}>
            <boxGeometry args={[2, 4, 2]} />
            <meshStandardMaterial
              color="#334155"
              metalness={0.4}
              roughness={0.6}
            />
          </mesh>

          {/* LEFT: Network Coverage Rings */}
          {/* Represents wireless network signal zones around the city */}
          <group position={[-8, 1.5, 0]}>
            <ConfigurableRings
              count={stats.networkCoverage.length}
              colors={networkColors}
              baseRadius={1}
              radiusIncrement={1.2}
              tubeRadius={0.08}
              rotationSpeed={0.8}
              staggerDelay={0.2}
              opacity={0.7}
            />
          </group>

          {/* Network coverage label */}
          <mesh position={[-8, 5, 0]}>
            <planeGeometry args={[2, 0.4]} />
            <meshStandardMaterial
              color="#0ea5e9"
              emissive="#0ea5e9"
              emissiveIntensity={0.4}
            />
          </mesh>

          {/* CENTER: Building with Floor Occupancy */}
          {/* Stacked visualization of floor-by-floor status */}
          <group position={[0, 2.5, 0]}>
            <ConfigurableStack
              count={stats.buildingOccupancy.length}
              colors={buildingColors}
              boxSize={[1.2, 0.2, 1.2]}
              spacing={0.4}
              rotationDegrees={90}
              duration={1.2}
              opacity={0.8}
            />
          </group>

          {/* Building label */}
          <mesh position={[0, 6, 0]}>
            <planeGeometry args={[2, 0.4]} />
            <meshStandardMaterial
              color="#8b5cf6"
              emissive="#8b5cf6"
              emissiveIntensity={0.4}
            />
          </mesh>

          {/* RIGHT: Traffic Activity Wave */}
          {/* Time-series visualization of vehicle activity */}
          <group position={[8, 1.5, 0]}>
            <ConfigurableWave
              count={stats.trafficActivity.length}
              colors={trafficColors}
              heights={trafficHeights}
              cylinderRadius={0.35}
              spacing={0.5}
              duration={1}
              opacity={0.85}
            />
          </group>

          {/* Traffic label */}
          <mesh position={[8, 5, 0]}>
            <planeGeometry args={[2, 0.4]} />
            <meshStandardMaterial
              color="#ef4444"
              emissive="#ef4444"
              emissiveIntensity={0.4}
            />
          </mesh>

          {/* Connecting lines between zones */}
          <line>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                args={[new Float32Array([-8, 0, 0, 0, 0, 0]), 3]}
              />
            </bufferGeometry>
            <lineBasicMaterial color="#475569" linewidth={1} />
          </line>

          <line>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                args={[new Float32Array([0, 0, 0, 8, 0, 0]), 3]}
              />
            </bufferGeometry>
            <lineBasicMaterial color="#475569" linewidth={1} />
          </line>
        </Suspense>
      </Canvas>

      {/* Top-left: Legend */}
      <div className="absolute top-4 left-4 bg-slate-800/80 backdrop-blur p-4 rounded-lg text-white text-xs space-y-3">
        <div>
          <h4 className="font-bold mb-2 text-sm">Signal Strength</h4>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span>Coverage Ring 1: {stats.networkCoverage[0]}%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-yellow-500" />
              <span>Coverage Ring 2: {stats.networkCoverage[1]}%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-orange-500" />
              <span>Coverage Ring 3: {stats.networkCoverage[2]}%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span>Coverage Ring 4: {stats.networkCoverage[3]}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top-center: Title */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-slate-800/80 backdrop-blur p-4 rounded-lg text-white text-center">
        <h1 className="text-xl font-bold">Smart City Analytics</h1>
        <p className="text-xs text-gray-400 mt-1">
          Three data visualization patterns in one scene
        </p>
      </div>

      {/* Top-right: Floor Occupancy */}
      <div className="absolute top-4 right-4 bg-slate-800/80 backdrop-blur p-4 rounded-lg text-white text-xs max-w-xs">
        <h4 className="font-bold mb-2 text-sm">Building Occupancy</h4>
        <div className="space-y-1">
          {stats.buildingOccupancy.map((occ, idx) => (
            <div key={idx} className="flex justify-between text-xs">
              <span>Floor {idx + 1}:</span>
              <span className="font-mono text-gray-400">{occ}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom-center: Stats Summary */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-slate-800/80 backdrop-blur p-4 rounded-lg text-white text-center text-xs">
        <div className="flex gap-6">
          <div>
            <p className="text-gray-400">Avg Network</p>
            <p className="font-bold text-lg">
              {Math.round(
                stats.networkCoverage.reduce((a, b) => a + b) /
                  stats.networkCoverage.length
              )}
              %
            </p>
          </div>
          <div>
            <p className="text-gray-400">Avg Occupancy</p>
            <p className="font-bold text-lg">
              {Math.round(
                stats.buildingOccupancy.reduce((a, b) => a + b) /
                  stats.buildingOccupancy.length
              )}
              %
            </p>
          </div>
          <div>
            <p className="text-gray-400">Peak Traffic</p>
            <p className="font-bold text-lg">
              {Math.max(...stats.trafficActivity)} vehicles
            </p>
          </div>
        </div>
      </div>

      {/* Bottom-left: Instructions */}
      <div className="absolute bottom-4 left-4 text-white text-xs text-gray-400">
        <p>💡 Use mouse to rotate • Scroll to zoom</p>
      </div>
    </div>
  )
}
