import { GlassCard, StatusBadge } from '@/components/primitives'
import type { JobSection } from '@/lib/config/content'

interface InfoCardBelowProps {
  job: JobSection
}

export function InfoCardBelow({ job }: InfoCardBelowProps) {
  return (
    <GlassCard variant="medium" padding="spacious" className="max-w-3xl mx-auto">
      <div className="space-y-4">
        <p className="text-base font-semibold text-foreground/90">
          {job.content.heading}
        </p>

        {job.content.paragraphs.map((para, idx) => (
          <p key={idx} className="text-sm text-foreground/70 leading-relaxed">
            {para}
          </p>
        ))}

        {job.content.highlights && job.content.highlights.length > 0 && (
          <div className="space-y-2 pt-4 border-t border-border">
            <p className="text-sm font-semibold text-foreground/80">Key Skills</p>
            <div className="flex flex-wrap gap-2">
              {job.content.highlights.map((highlight, idx) => (
                <StatusBadge
                  key={idx}
                  status="info"
                  className="text-xs"
                >
                  {highlight}
                </StatusBadge>
              ))}
            </div>
          </div>
        )}
      </div>
    </GlassCard>
  )
}
