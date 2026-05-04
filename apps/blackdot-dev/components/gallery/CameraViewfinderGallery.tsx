'use client'

import React, { ReactNode, useState } from 'react'
import { CameraViewfinder, type CameraViewfinderProps } from '@/components/primitives'
import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight } from 'lucide-react'

/**
 * CameraViewfinderGallery - Gallery wrapper for multiple models/views
 *
 * Combines CameraViewfinder with navigation controls for cycling through
 * multiple 3D models or content pieces. Useful for portfolios, product
 * showcases, and resume sections.
 *
 * @category composite
 * @layer 3
 * @example
 * ```tsx
 * <CameraViewfinderGallery items={models} />
 * ```
 */

export interface GalleryItem {
  id: string
  title?: string
  description?: string
  content: ReactNode
  cameraProps?: Partial<CameraViewfinderProps>
}

export interface CameraViewfinderGalleryProps {
  items: GalleryItem[]
  defaultIndex?: number
  showThumbnails?: boolean
  showCounter?: boolean
  autoRotate?: boolean
  autoRotateDelay?: number
  onItemChange?: (index: number) => void
  className?: string
}

export function CameraViewfinderGallery({
  items,
  defaultIndex = 0,
  showThumbnails = true,
  showCounter = true,
  autoRotate = false,
  autoRotateDelay = 3000,
  onItemChange,
  className,
}: CameraViewfinderGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(defaultIndex)

  const currentItem = items[activeIndex]

  const handleNext = () => {
    const nextIndex = (activeIndex + 1) % items.length
    setActiveIndex(nextIndex)
    onItemChange?.(nextIndex)
  }

  const handlePrev = () => {
    const prevIndex = (activeIndex - 1 + items.length) % items.length
    setActiveIndex(prevIndex)
    onItemChange?.(prevIndex)
  }

  const handleThumbnailClick = (index: number) => {
    setActiveIndex(index)
    onItemChange?.(index)
  }

  React.useEffect(() => {
    if (!autoRotate) return

    const timer = setInterval(handleNext, autoRotateDelay)
    return () => clearInterval(timer)
  }, [autoRotate, autoRotateDelay, activeIndex])

  return (
    <div className={cn('space-y-4', className)}>
      {/* Main Viewfinder */}
      <div className="relative">
        <CameraViewfinder
          key={currentItem.id}
          fps={60}
          iso="100"
          aperture="F3.5"
          {...currentItem.cameraProps}
        >
          {currentItem.content}
        </CameraViewfinder>

        {/* Navigation Arrows */}
        {items.length > 1 && (
          <>
            {/* Left Arrow */}
            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 backdrop-blur text-white p-2 rounded-lg transition-all"
              aria-label="Previous"
            >
              <ChevronLeft size={24} />
            </button>

            {/* Right Arrow */}
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 backdrop-blur text-white p-2 rounded-lg transition-all"
              aria-label="Next"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}

        {/* Counter */}
        {showCounter && items.length > 1 && (
          <div className="absolute bottom-4 right-4 z-20 bg-black/40 backdrop-blur text-white px-3 py-1 rounded-lg text-xs font-mono">
            {activeIndex + 1} / {items.length}
          </div>
        )}
      </div>

      {/* Title & Description */}
      {(currentItem.title || currentItem.description) && (
        <div className="space-y-2 px-2">
          {currentItem.title && (
            <h3 className="text-lg font-semibold">{currentItem.title}</h3>
          )}
          {currentItem.description && (
            <p className="text-sm text-gray-400">{currentItem.description}</p>
          )}
        </div>
      )}

      {/* Thumbnails */}
      {showThumbnails && items.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 px-2">
          {items.map((item, index) => (
            <button
              key={item.id}
              onClick={() => handleThumbnailClick(index)}
              className={cn(
                'flex-shrink-0 w-20 h-20 rounded-lg border-2 transition-all',
                activeIndex === index
                  ? 'border-white bg-white/10'
                  : 'border-white/20 hover:border-white/40'
              )}
              aria-label={`View ${item.title || `item ${index + 1}`}`}
            >
              <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-900 rounded flex items-center justify-center text-xs text-gray-400 font-semibold">
                {index + 1}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default CameraViewfinderGallery
