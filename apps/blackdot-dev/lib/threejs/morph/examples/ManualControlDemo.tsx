/**
 * Manual Control Demo
 *
 * Demonstrates imperative API control with UI sliders.
 * Shows how to control individual morph influences directly.
 */

'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { BoxGeometry } from 'three'
import { MorphModel } from '../MorphModel'
import {
  generateSpherifyMorph,
  generateTwistMorph,
  generateWaveMorph,
  generateInflateMorph,
} from '../generators'
import { MorphControls } from '../types'
import { useMemo, useRef, useState } from 'react'

export default function ManualControlDemo() {
  const morphRef = useRef<MorphControls>(null)
  const [influences, setInfluences] = useState([0, 0, 0, 0])

  // Create geometry
  const geometry = useMemo(() => new BoxGeometry(2, 2, 2, 32, 32, 32), [])

  // Generate morph targets
  const morphTargets = useMemo(
    () => [
      generateSpherifyMorph(geometry, 'spherify', 1.0),
      generateTwistMorph(geometry, 'twist', 0.6, 'y'),
      generateWaveMorph(geometry, 'wave', 0.5, 3.0, 'y'),
      generateInflateMorph(geometry, 'inflate', 0.7),
    ],
    [geometry]
  )

  const morphNames = ['Spherify', 'Twist', 'Wave', 'Inflate']

  // Handle slider change
  const handleInfluenceChange = (index: number, value: number) => {
    const newInfluences = [...influences]
    newInfluences[index] = value
    setInfluences(newInfluences)
    morphRef.current?.setInfluence(index, value, false)
  }

  // Preset states
  const presets = [
    { name: 'Reset', influences: [0, 0, 0, 0] },
    { name: 'Sphere', influences: [1, 0, 0, 0] },
    { name: 'Twisted', influences: [0, 1, 0, 0] },
    { name: 'Wavy', influences: [0, 0, 1, 0] },
    { name: 'Inflated', influences: [0, 0, 0, 1] },
    { name: 'Mix 1', influences: [0.7, 0.3, 0, 0] },
    { name: 'Mix 2', influences: [0, 0.5, 0.5, 0] },
    { name: 'All', influences: [0.4, 0.3, 0.2, 0.1] },
  ]

  const applyPreset = (presetInfluences: number[]) => {
    presetInfluences.forEach((value, index) => {
      morphRef.current?.setInfluence(index, value, true)
    })
    setInfluences(presetInfluences)
  }

  return (
    <div className="flex h-screen w-full bg-gray-950">
      {/* 3D Canvas */}
      <div className="flex-1">
        <Canvas camera={{ position: [5, 5, 5], fov: 50 }}>
          <ambientLight intensity={0.4} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <directionalLight position={[-10, -10, -5]} intensity={0.3} />

          <MorphModel ref={morphRef} morphTargets={morphTargets}>
            <mesh geometry={geometry}>
              <meshStandardMaterial
                color="#3b82f6"
                metalness={0.4}
                roughness={0.3}
              />
            </mesh>
          </MorphModel>

          <OrbitControls
            enableDamping
            dampingFactor={0.05}
            minDistance={3}
            maxDistance={12}
          />

          <gridHelper args={[10, 10, '#333', '#111']} />
        </Canvas>
      </div>

      {/* Control Panel */}
      <div className="w-80 overflow-y-auto bg-gray-900 p-6 text-white">
        <h2 className="mb-6 text-2xl font-bold">Morph Controls</h2>

        {/* Individual Sliders */}
        <div className="mb-8 space-y-4">
          {morphTargets.map((target, index) => (
            <div key={target.name}>
              <label className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium">{morphNames[index]}</span>
                <span className="rounded bg-gray-700 px-2 py-1 font-mono text-xs">
                  {influences[index].toFixed(2)}
                </span>
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={influences[index]}
                onChange={(e) =>
                  handleInfluenceChange(index, parseFloat(e.target.value))
                }
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-700 accent-blue-500"
              />
            </div>
          ))}
        </div>

        {/* Presets */}
        <div className="border-t border-gray-700 pt-6">
          <h3 className="mb-4 text-lg font-semibold">Presets</h3>
          <div className="grid grid-cols-2 gap-2">
            {presets.map((preset) => (
              <button
                key={preset.name}
                onClick={() => applyPreset(preset.influences)}
                className="rounded-lg bg-gray-800 px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-700 active:bg-gray-600"
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="mt-8 rounded-lg bg-blue-500/10 p-4 text-xs text-blue-300">
          <p className="font-semibold">Tip:</p>
          <p className="mt-1">
            Combine multiple morphs for unique effects. Presets animate smoothly
            using GSAP.
          </p>
        </div>
      </div>
    </div>
  )
}
