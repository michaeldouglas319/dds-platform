"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import { useNavigation } from "@/lib/hooks/use-navigation"
import type { UnifiedSection as UnifiedSectionConfig } from "@/lib/config/content/sections.config"
import type { UnifiedSection as UnifiedSectionLegacy } from "@/lib/config/content/sections"

type UnifiedSection = UnifiedSectionConfig | UnifiedSectionLegacy;

interface PageHeaderProps {
  section: UnifiedSection | null | undefined
  showBackButton?: boolean
}

export function PageHeader({ section, showBackButton = true }: PageHeaderProps) {
  const { goBack } = useNavigation()

  if (!section) {
    return null
  }

  return (
    <div className="space-y-4 mb-12">
      {showBackButton && (
        <Button variant="ghost" onClick={goBack} className="gap-2">
          <ChevronLeft className="w-4 h-4" />
          Back
        </Button>
      )}

      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight text-balance" style={{ color: section.color || "inherit" }}>
          {section.title || "Untitled"}
        </h1>
        {section.subtitle && <p className="text-xl text-muted-foreground text-balance">{section.subtitle}</p>}
      </div>

      {section.content?.paragraphs &&
        Array.isArray(section.content.paragraphs) &&
        section.content.paragraphs.length > 0 && (
          <div className="space-y-2 max-w-3xl">
            {section.content.paragraphs.map((para, idx) => {
              if (typeof para === 'string') {
                return (
                  <p key={idx} className="text-foreground/80 leading-relaxed">
                    {para}
                  </p>
                );
              } else {
                return (
                  <div key={idx} className="space-y-2">
                    <h4 className="font-semibold text-foreground">{para.subtitle}</h4>
                    <p className="text-foreground/80 leading-relaxed">{para.description}</p>
                    {para.citations && para.citations.length > 0 && (
                      <div className="text-sm text-muted-foreground">
                        {para.citations.map((citation, cIdx) => (
                          <a key={cIdx} href={citation.url} target="_blank" rel="noopener noreferrer" className="underline">
                            {citation.text}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }
            })}
          </div>
        )}
    </div>
  )
}
