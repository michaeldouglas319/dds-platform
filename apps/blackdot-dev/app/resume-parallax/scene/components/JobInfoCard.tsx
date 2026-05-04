'use client'

import { Html } from '@react-three/drei'
import { HighlightsList, DurationBar, MetricsCard } from '@/components/composites/DataDisplay'
import type { JobSection } from '@/lib/config/content'

/**
 * JobInfoCard - Enhanced 3D job information display
 *
 * Tier 1 Improvements:
 * 1. ✅ Shows ALL highlights (not limited to 3)
 * 2. ✅ Employment duration visualization bar
 * 3. ✅ Automatic achievement metrics extraction
 *
 * Template-based and reusable for different data structures
 *
 * @category composite
 * @layer 2
 */

export interface JobInfoCardProps {
  job: JobSection
  position: [number, number, number]
  compact?: boolean
  showMetrics?: boolean
  showDuration?: boolean
}

export function JobInfoCard({
  job,
  position,
  compact = false,
  showMetrics = true,
  showDuration = true
}: JobInfoCardProps) {
  const startDate = new Date(job.period.split('-')[0].trim() + ' 1')
  const endDateStr = job.period.split('-')[1].trim()
  const endDate = endDateStr === 'Present' ? new Date() : new Date(endDateStr + ' 1')

  return (
    <Html
      position={position}
      transform
      scale={compact ? 0.4 : 0.8}
      occlude="blending"
    >
      <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/50 rounded-lg p-4 w-96 space-y-3">
        {/* Header */}
        <div className="border-b border-slate-700/50 pb-3">
          <h2 className="text-lg font-bold" style={{ color: job.color }}>
            {job.company}
          </h2>
          <p className="text-sm text-slate-300">{job.role}</p>
        </div>

        {/* Duration Bar - Tier 1 Improvement */}
        {showDuration && (
          <div>
            <DurationBar
              startDate={startDate}
              endDate={endDate}
              color={job.color}
              showLabel={true}
              format="both"
              animate={true}
              metadata={{
                label: 'Employment Duration'
              }}
            />
          </div>
        )}

        {/* Metrics Card - Tier 1 Improvement */}
        {showMetrics && job.content.paragraphs.length > 0 && (
          <div>
            <MetricsCard
              content={job.content.paragraphs.join(' ')}
              layout="grid"
              columns={2}
              size="sm"
              maxMetrics={3}
              backgroundColor="bg-slate-800/50"
              showBorder={true}
            />
          </div>
        )}

        {/* Highlights List - Tier 1 Improvement */}
        {job.content.highlights && job.content.highlights.length > 0 && (
          <div className="border-t border-slate-700/50 pt-3">
            <p className="text-xs text-slate-400 mb-2 font-semibold uppercase">Key Skills & Achievements</p>
            <HighlightsList
              items={job.content.highlights}
              color={job.color}
              layout="wrapped"
              maxItems={compact ? 3 : undefined}
              textSize="xs"
              bullet={true}
              separator="•"
            />
          </div>
        )}

        {/* Footer Info */}
        <div className="text-xs text-slate-500 border-t border-slate-700/50 pt-3">
          {job.content.paragraphs.length > 0 && (
            <p className="line-clamp-2 text-slate-400">
              {job.content.paragraphs[0]}
            </p>
          )}
        </div>
      </div>
    </Html>
  )
}
