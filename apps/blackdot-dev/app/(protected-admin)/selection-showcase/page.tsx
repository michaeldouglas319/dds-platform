'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import {
  ChessExample,
  AircraftExample,
  DroneExample,
  GlobeExample,
  DiskExample,
  DetailComparisonExample,
} from './examples'

interface SelectionExample {
  name: string
  Component: React.ComponentType
  modelPath: string
  geometryType: 'sphere' | 'box' | 'icosahedron' | 'torus' | 'torusKnot' | 'cone' | 'cylinder'
  detail: number
  description: string
}

const examples: SelectionExample[] = [
  {
    name: 'Chess Set → Sphere',
    Component: ChessExample,
    modelPath: '/assets/models/chess_set.glb',
    geometryType: 'sphere',
    detail: 0.6,
    description: 'Balanced smoothness for chess pieces',
  },
  {
    name: 'Aircraft → Icosahedron',
    Component: AircraftExample,
    modelPath: '/assets/models/aircraft_presentation_cover.glb',
    geometryType: 'icosahedron',
    detail: 0.5,
    description: 'Sharp geometric transitions',
  },
  {
    name: 'Drone → Torus',
    Component: DroneExample,
    modelPath: '/assets/models/super_cam__-_rusian_reconnaissance_drone.glb',
    geometryType: 'torus',
    detail: 0.7,
    description: 'Circular morphing pattern',
  },
  {
    name: 'Golden Globe → Sphere',
    Component: GlobeExample,
    modelPath: '/assets/models/golden_globe_decoration.glb',
    geometryType: 'sphere',
    detail: 0.9,
    description: 'High-detail smooth morphing',
  },
  {
    name: 'Chess Set → Disk',
    Component: DiskExample,
    modelPath: '/assets/models/chess_set.glb',
    geometryType: 'cylinder',
    detail: 0.6,
    description: 'Flatten to flat disk geometry',
  },
  {
    name: 'Detail Comparison',
    Component: DetailComparisonExample,
    modelPath: '/assets/models/chess_set.glb',
    geometryType: 'sphere',
    detail: 0.6,
    description: 'Three detail levels (0.3, 0.6, 0.9)',
  },
]

function SelectionPreview({
  name,
  Component,
  geometryType,
  detail,
  description,
}: SelectionExample) {
  return (
    <div className="border rounded-lg bg-card h-full flex flex-col">
      <div className="p-4 border-b">
        <h3 className="font-semibold text-lg text-foreground">{name}</h3>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
        <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
          <div>
            Type: <span className="font-mono">{geometryType}</span>
          </div>
          <div>
            Detail: <span className="font-mono">{detail.toFixed(1)}</span>
          </div>
        </div>
      </div>
      <div className="h-[400px] bg-black/20 rounded-lg overflow-hidden flex-1">
        <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <OrbitControls enableDamping dampingFactor={0.05} />
          <Component />
        </Canvas>
      </div>
    </div>
  )
}


export default function SelectionShowcase() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-foreground">Selection Showcase</h1>
          <p className="text-muted-foreground text-lg">
            Interactive 3D model morphing with adjustable detail levels. Hover to morph.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {examples.map((example, index) => (
            <SelectionPreview key={index} {...example} />
          ))}
        </div>
      </div>
    </div>
  )
}
