'use client'

import { ScrollArea } from '@/components/ui/scroll-area'
import { ArticleSection } from './ArticleSection'
import type { ArticleConfig } from '../config/article.config'

interface ArticleContentProps {
  config: ArticleConfig
}

export function ArticleContent({ config }: ArticleContentProps) {
  return (
    <ScrollArea className="h-full w-full">
      <div className="space-y-8 p-6">
        {config.sections.map((section) => (
          <ArticleSection key={section.id} section={section} />
        ))}

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-border/50">
          <p className="text-sm text-foreground/60">
            Last updated: {config.metadata.date}
          </p>
        </div>
      </div>
    </ScrollArea>
  )
}
