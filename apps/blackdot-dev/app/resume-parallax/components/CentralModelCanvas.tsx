'use client'

import { StandardCanvas } from '@/components/three'
import { Suspense } from 'react'
import { PerspectiveCamera, Environment } from '@react-three/drei'
import { BrandButton } from '@/components/primitives'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { ModelRenderer } from './ModelRenderer'
import type { JobSection } from '@/lib/config/content/resume-data.config'
import type { ModelType } from '@/lib/config/models'

interface CentralModelCanvasProps {
  job: JobSection
  onNavigateNext: () => void
  onNavigatePrev: () => void
  currentIndex: number
  totalCount: number
}

export function CentralModelCanvas({
  job,
  onNavigateNext,
  onNavigatePrev,
  currentIndex,
  totalCount
}: CentralModelCanvasProps) {
  return (
    <div className="relative w-full aspect-video bg-gradient-to-br from-background to-background/50 rounded-xl overflow-hidden border border-border">
      <StandardCanvas>
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[0, 0, 12]} fov={50} />

          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 5, 5]} intensity={1.2} />
          <directionalLight position={[-5, -5, 5]} intensity={0.3} />

          <Environment preset="city" />

          {job.modelType && (
            <ModelRenderer
              modelType={job.modelType as ModelType}
              color={job.color}
              position={job.position}
              rotation={job.rotation}
            />
          )}
        </Suspense>
      </StandardCanvas>

      {/* Left Arrow */}
      <BrandButton
        variant="glass"
        size="icon"
        onClick={onNavigatePrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20"
        aria-label="Previous job"
      >
        <ChevronLeft size={24} />
      </BrandButton>

      {/* Right Arrow */}
      <BrandButton
        variant="glass"
        size="icon"
        onClick={onNavigateNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20"
        aria-label="Next job"
      >
        <ChevronRight size={24} />
      </BrandButton>

      {/* Counter */}
      <div className="absolute bottom-4 right-4 z-20 text-xs font-medium text-foreground/60 bg-black/20 px-3 py-1.5 rounded-full backdrop-blur-sm">
        {currentIndex + 1} / {totalCount}
      </div>
    </div>
  )
}
