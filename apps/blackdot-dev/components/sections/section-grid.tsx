"use client"

import { SectionCard } from "./section-card"
import { JobCard } from "./job-card"
import { useRouter } from "next/navigation"
import type { UnifiedSection } from "@/lib/config/content/sections"
import type { UnifiedSection as ConfigUnifiedSection } from "@/lib/config/content/sections.config"

interface SectionGridProps {
  sections: (UnifiedSection | ConfigUnifiedSection)[]
  columns?: 1 | 2 | 3 | 4
  isJobsList?: boolean
  parentPage?: string
}

export function SectionGrid({ sections, columns = 2, isJobsList = false, parentPage = "resume" }: SectionGridProps) {
  const router = useRouter()
  const gridColsClass = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  }

  if (!Array.isArray(sections) || sections.length === 0) {
    return <div className="text-center text-muted-foreground py-8">No items to display</div>
  }

  const handleJobClick = (jobId: string) => {
    router.push(`/${parentPage}/${jobId}`)
  }

  return (
    <div className={`grid ${gridColsClass[columns]} gap-6`}>
      {sections.map((section) =>
        isJobsList ? (
          <JobCard key={section.id} job={section} onClick={() => handleJobClick(section.id)} />
        ) : (
          <SectionCard key={section.id} section={section} />
        ),
      )}
    </div>
  )
}
