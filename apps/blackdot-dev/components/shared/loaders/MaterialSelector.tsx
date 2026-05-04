'use client'

import { useState, useEffect } from 'react'
import { LOADER_MATERIALS, MATERIAL_KEYS, MaterialKey } from './materials.config'
import { setActiveMatcap, useStore } from '../store/useStore'

interface MaterialSelectorProps {
  onMaterialChange?: () => void
}

/**
 * Material selector component for toggling between loader materials
 * Allows users to switch between primary, secondary, and tertiary matcap textures
 */
export function MaterialSelector({ onMaterialChange }: MaterialSelectorProps) {
  const [activeMatcap, setActive] = useState<MaterialKey>('primary')
  const [mounted, setMounted] = useState(false)

  // Handle hydration
  useEffect(() => {
    setMounted(true)
    const current = useStore((x) => x.activeMatcap)
    setActive(current)
  }, [])

  const handleSelect = (key: MaterialKey) => {
    setActive(key)
    setActiveMatcap(key)
    // Notify parent component to trigger re-render
    onMaterialChange?.()
  }

  if (!mounted) return null

  return (
    <div className="flex flex-col gap-4 p-6 bg-card border rounded-lg mb-8">
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Material Settings</h2>
        <div className="flex flex-wrap gap-3">
          {MATERIAL_KEYS.map((key) => {
            const material = LOADER_MATERIALS[key]
            const isActive = activeMatcap === key

            return (
              <button
                key={key}
                onClick={() => handleSelect(key)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600'
                }`}
                title={material.description}
              >
                {material.name}
              </button>
            )
          })}
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        <p>
          <strong>Current:</strong> {LOADER_MATERIALS[activeMatcap].description}
        </p>
      </div>
    </div>
  )
}
