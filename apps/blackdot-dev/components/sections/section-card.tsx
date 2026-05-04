"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronRight } from "lucide-react"
import { useNavigation } from "@/lib/hooks/use-navigation"
import type { UnifiedSection } from "@/lib/config/content/sections"
import type { UnifiedSection as ConfigUnifiedSection } from "@/lib/config/content/sections.config"

interface SectionCardProps {
  section: UnifiedSection | ConfigUnifiedSection
  onClick?: () => void
}

export function SectionCard({ section, onClick }: SectionCardProps) {
  const { navigateToSection } = useNavigation()

  const handleClick = () => {
    if (onClick) {
      onClick()
    } else {
      navigateToSection(section)
    }
  }

  const bgColor = section.color || "hsl(var(--color-primary))"
  const hasDrilldown = section.drilldown?.enabled

  return (
    <Card
      className="cursor-pointer transition-all hover:shadow-lg hover:scale-105 overflow-hidden group"
      onClick={handleClick}
      style={{ borderColor: bgColor }}
    >
      {section.imageUrl && (
        <div className="h-40 overflow-hidden bg-muted">
          <img
            src={section.imageUrl || "/placeholder.svg"}
            alt={section.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        </div>
      )}

      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle>{section.title}</CardTitle>
            {section.subtitle && <CardDescription>{section.subtitle}</CardDescription>}
          </div>
          {hasDrilldown && <ChevronRight className="w-5 h-5 text-muted-foreground mt-1" />}
        </div>
      </CardHeader>

      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {typeof section.content?.heading === 'string' 
            ? section.content.heading 
            : typeof section.content?.paragraphs?.[0] === 'string'
            ? section.content.paragraphs[0]
            : ''}
        </p>
      </CardContent>
    </Card>
  )
}
