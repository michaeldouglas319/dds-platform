import { GlassCard } from '@/components/primitives'
import type { JobSection } from '@/lib/config/content'

interface InfoCardAboveProps {
  job: JobSection
}

export function InfoCardAbove({ job }: InfoCardAboveProps) {
  return (
    <GlassCard variant="medium" padding="comfortable" className="max-w-2xl mx-auto">
      <div className="space-y-2">
        <h1 className="text-3xl font-black" style={{ color: job.color }}>
          {job.company}
        </h1>
        <h2 className="text-xl font-semibold text-foreground/80">
          {job.role}
        </h2>
        <p className="text-sm text-foreground/60">{job.period}</p>
      </div>
    </GlassCard>
  )
}
