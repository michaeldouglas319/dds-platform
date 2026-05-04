'use client'

import { Html } from '@react-three/drei'
import { MetricsCard as DataMetricsCard } from '@/components/composites/DataDisplay'

export interface MetricsCardProps {
  data: {
    metrics?: string[]
    content?: string
    color: string
  }
  scale?: number
}

export function MetricsCard({ data, scale = 0.6 }: MetricsCardProps) {
  return (
    <Html transform scale={scale} occlude="blending">
      <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/50 rounded-lg p-4 w-80 space-y-3">
        {/* Color accent bar */}
        <div
          className="h-1 rounded-full w-full"
          style={{ backgroundColor: data.color }}
        />

        {/* Label */}
        <p className="text-xs font-semibold text-slate-400 uppercase">
          Key Metrics
        </p>

        {/* Metrics using DataDisplay component */}
        <div className="scale-90 origin-top-left">
          <DataMetricsCard
            content={data.content}
            layout="grid"
            columns={2}
            maxMetrics={4}
            size="sm"
            backgroundColor="transparent"
            showBorder={false}
            animate={true}
          />
        </div>
      </div>
    </Html>
  )
}
