"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { UnifiedSection } from "@/lib/config/content/sections"
import type { UnifiedSection as ConfigUnifiedSection } from "@/lib/config/content/sections.config"

interface JobCardProps {
  job: UnifiedSection | ConfigUnifiedSection
  onClick?: () => void
}

export function JobCard({ job, onClick }: JobCardProps) {
  return (
    <Card
      className="cursor-pointer transition-all hover:shadow-lg overflow-hidden group"
      onClick={onClick}
      style={{ borderColor: job.color || "currentColor" }}
    >
      {job.imageUrl && (
        <div className="h-48 overflow-hidden bg-muted">
          <img
            src={job.imageUrl || "/placeholder.svg"}
            alt={job.title || "Job"}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform"
          />
        </div>
      )}

      <CardHeader>
        <div className="space-y-2">
          <CardTitle className="text-lg">{job.title || "Untitled"}</CardTitle>
          {job.subtitle && <CardDescription className="text-base">{job.subtitle}</CardDescription>}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {job.content?.heading && <p className="text-sm text-muted-foreground">{job.content.heading}</p>}

        {job.content?.paragraphs && Array.isArray(job.content.paragraphs) && job.content.paragraphs.length > 0 && (
          <div className="space-y-2">
            {job.content.paragraphs.map((para, idx) => (
              <p key={idx} className="text-sm text-foreground/80 line-clamp-2">
                {typeof para === 'string' ? para : para.description}
              </p>
            ))}
          </div>
        )}

        {job.content?.highlights && Array.isArray(job.content.highlights) && job.content.highlights.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {job.content.highlights.slice(0, 3).map((highlight, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs">
                {typeof highlight === 'string' ? highlight : highlight.description}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
