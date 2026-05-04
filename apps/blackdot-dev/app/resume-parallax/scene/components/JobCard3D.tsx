'use client'

import { useState } from 'react'
import { Html } from '@react-three/drei'
import { GlassCard, StatusBadge } from '@/components/primitives'
import { cn } from '@/lib/utils'
import type { JobSection } from '@/lib/config/content'

interface JobCard3DProps {
  job: JobSection
  position: [number, number, number]
  isSelected: boolean
  onClick: () => void
  scale?: number
}

/**
 * 3D Job Card Component
 *
 * Renders a job card in 3D space using Html component from drei.
 * Features glass-morphism design with background plane mesh for depth.
 *
 * @category composite
 * @layer 2
 */
export function JobCard3D({
  job,
  position,
  isSelected,
  onClick,
  scale = 0.15
}: JobCard3DProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <group position={position}>
      {/* HTML Card Content */}
      <Html
        transform
        scale={scale}
        position={[0, 0, 0]}
        occlude="blending"
        onClick={() => onClick()}
      >
        <div
          className={cn(
            'transition-all cursor-pointer duration-300',
            isSelected
              ? 'scale-110 drop-shadow-2xl'
              : isHovered
                ? 'scale-105 drop-shadow-xl'
                : 'scale-100 drop-shadow-lg'
          )}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={(e) => {
            e.stopPropagation()
            onClick()
          }}
        >
          <GlassCard
            variant={isSelected ? 'strong' : isHovered ? 'medium' : 'light'}
            padding="comfortable"
            className="w-64 min-h-80"
          >
            {/* Company Name */}
            <h3
              className="font-bold text-lg mb-2 truncate"
              style={{ color: job.color }}
            >
              {job.company}
            </h3>

            {/* Role */}
            <p className="text-sm text-foreground/80 mb-1 font-semibold">
              {job.role}
            </p>

            {/* Period */}
            <p className="text-xs text-foreground/60 mb-4">
              {job.period}
            </p>

            {/* Skills/Highlights */}
            {job.content.highlights && job.content.highlights.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {job.content.highlights.slice(0, 3).map((skill, i) => (
                  <StatusBadge
                    key={i}
                    status="info"
                    size="sm"
                    className="text-xs"
                  >
                    {skill}
                  </StatusBadge>
                ))}
                {job.content.highlights.length > 3 && (
                  <span className="text-xs text-foreground/50 self-center">
                    +{job.content.highlights.length - 3}
                  </span>
                )}
              </div>
            )}
          </GlassCard>
        </div>
      </Html>

    </group>
  )
}
