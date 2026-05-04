'use client'

import { useState, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import { Item1 } from '@/components/shared/loaders/Item1'
import { Item2 } from '@/components/shared/loaders/Item2'
import { Item3 } from '@/components/shared/loaders/Item3'
import { Item4 } from '@/components/shared/loaders/Item4'
import { Item5 } from '@/components/shared/loaders/Item5'
import { Item6 } from '@/components/shared/loaders/Item6'
import { Item7 } from '@/components/shared/loaders/Item7'
import { Item8 } from '@/components/shared/loaders/Item8'
import { Item9 } from '@/components/shared/loaders/Item9'
import { Item10 } from '@/components/shared/loaders/Item10'
import { Item11 } from '@/components/shared/loaders/Item11'
import { Item12 } from '@/components/shared/loaders/Item12'
import { MaterialSelector } from '@/components/shared/loaders/MaterialSelector'

const loaders = [
  { name: 'Item 1 - Rotating Toruses', Component: Item1 },
  { name: 'Item 2 - Circular Formation', Component: Item2 },
  { name: 'Item 3', Component: Item3 },
  { name: 'Item 4', Component: Item4 },
  { name: 'Item 5', Component: Item5 },
  { name: 'Item 6', Component: Item6 },
  { name: 'Item 7', Component: Item7 },
  { name: 'Item 8', Component: Item8 },
  { name: 'Item 9', Component: Item9 },
  { name: 'Item 10', Component: Item10 },
  { name: 'Item 11', Component: Item11 },
  { name: 'Item 12', Component: Item12 },
]

function LoaderPreview({ name, Component }: { name: string; Component: React.ComponentType }) {
  return (
    <div className="border rounded-lg p-4 bg-card h-full flex flex-col">
      <h3 className="text-sm font-semibold mb-2 text-foreground">{name}</h3>
      <div className="aspect-square bg-black/20 rounded-lg overflow-hidden flex-1">
        <Canvas camera={{ position: [0, 0, 8] }}>
          <ambientLight intensity={0.1} />
          <Component />
        </Canvas>
      </div>
    </div>
  )
}

export default function LoadersShowcase() {
  const [updateKey, setUpdateKey] = useState(0)

  const handleMaterialChange = useCallback(() => {
    // Force re-render of all canvases when material changes
    setUpdateKey((prev) => prev + 1)
  }, [])

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-foreground">Loader Components Showcase</h1>
          <p className="text-muted-foreground">
            Collection of 12 animated 3D loader components for use throughout the application.
          </p>
        </div>

        <MaterialSelector onMaterialChange={handleMaterialChange} />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loaders.map((loader, index) => (
            <LoaderPreview
              key={`${updateKey}-${index}`}
              name={loader.name}
              Component={loader.Component}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
