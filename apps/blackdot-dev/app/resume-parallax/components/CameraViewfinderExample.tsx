'use client'

import { Canvas } from '@react-three/fiber'
import { CameraViewfinder } from '@/components/primitives'

/**
 * CameraViewfinderExample
 *
 * Demonstrates the CameraViewfinder wrapper with a 3D model.
 * Can be used in resume, ideas, or business sections.
 *
 * Usage:
 * <CameraViewfinderExample />
 */

export function CameraViewfinderExample() {
  return (
    <div className="w-full space-y-8">
      {/* Example 1: Standard Camera View */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Standard Camera View (16:9)</h3>
        <p className="text-sm text-gray-400">
          Professional camera settings with recording indicator
        </p>
        <CameraViewfinder
          fps={60}
          resolution="HD"
          iso="100"
          aperture="F3.5"
          recording={true}
          showCorners={true}
        >
          <Canvas camera={{ position: [0, 0, 5] }}>
            {/* Your 3D model goes here */}
            <mesh>
              <boxGeometry args={[2, 2, 2]} />
              <meshPhongMaterial color="#fbbf24" />
            </mesh>
            <ambientLight intensity={0.5} />
            <directionalLight position={[5, 5, 5]} />
          </Canvas>
        </CameraViewfinder>
      </div>

      {/* Example 2: Compact Square View */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Compact Square View (1:1)</h3>
        <p className="text-sm text-gray-400">
          Product showcase with minimal camera info
        </p>
        <div className="max-w-md">
          <CameraViewfinder
            variant="compact"
            fps={30}
            iso="200"
            aperture="F2.0"
            recording={false}
            showCorners={true}
          >
            <Canvas camera={{ position: [0, 0, 4] }}>
              <mesh rotation={[0.2, 0.3, 0.1]}>
                <octahedronGeometry args={[1.5]} />
                <meshPhongMaterial color="#8b5cf6" />
              </mesh>
              <ambientLight intensity={0.6} />
              <directionalLight position={[5, 5, 5]} />
            </Canvas>
          </CameraViewfinder>
        </div>
      </div>

      {/* Example 3: Professional High-Res */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Professional High-Res</h3>
        <p className="text-sm text-gray-400">
          4K recording with detailed camera metadata
        </p>
        <CameraViewfinder
          fps={60}
          resolution="4K"
          iso="400"
          aperture="F1.4"
          focalLength="50mm"
          recording={true}
          showCorners={true}
        >
          <Canvas camera={{ position: [2, 2, 4] }}>
            <mesh rotation={[0.4, 0.5, 0.2]}>
              <tetrahedronGeometry args={[2]} />
              <meshPhongMaterial color="#ec4899" />
            </mesh>
            <ambientLight intensity={0.7} />
            <directionalLight position={[5, 5, 5]} intensity={1.2} />
          </Canvas>
        </CameraViewfinder>
      </div>

      {/* Example 4: Minimal Design */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Minimal Design (No Corners)</h3>
        <p className="text-sm text-gray-400">
          Clean look with metadata only
        </p>
        <CameraViewfinder
          fps={60}
          iso="100"
          aperture="F2.8"
          recording={false}
          showCorners={false}
          className="rounded-xl shadow-lg"
        >
          <Canvas camera={{ position: [0, 0, 5] }}>
            <mesh rotation={[0.3, 0.4, 0.1]}>
              <icosahedronGeometry args={[1.2]} />
              <meshPhongMaterial color="#3b82f6" />
            </mesh>
            <ambientLight intensity={0.8} />
            <directionalLight position={[5, 5, 5]} />
          </Canvas>
        </CameraViewfinder>
      </div>

      {/* Example 5: Side by Side Comparison */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Side-by-Side Comparison</h3>
        <p className="text-sm text-gray-400">
          Multiple models with different camera settings
        </p>
        <div className="grid grid-cols-2 gap-4">
          {/* Left Model */}
          <CameraViewfinder
            fps={60}
            iso="100"
            aperture="F3.5"
            recording={true}
            showCorners={true}
          >
            <Canvas camera={{ position: [0, 0, 5] }}>
              <mesh>
                <sphereGeometry args={[1.5, 32, 32]} />
                <meshPhongMaterial color="#fbbf24" />
              </mesh>
              <ambientLight intensity={0.5} />
              <directionalLight position={[5, 5, 5]} />
            </Canvas>
          </CameraViewfinder>

          {/* Right Model */}
          <CameraViewfinder
            fps={60}
            iso="100"
            aperture="F3.5"
            recording={true}
            showCorners={true}
          >
            <Canvas camera={{ position: [0, 0, 5] }}>
              <mesh>
                <torusGeometry args={[1.2, 0.4, 16, 100]} />
                <meshPhongMaterial color="#06b6d4" />
              </mesh>
              <ambientLight intensity={0.5} />
              <directionalLight position={[5, 5, 5]} />
            </Canvas>
          </CameraViewfinder>
        </div>
      </div>
    </div>
  )
}
