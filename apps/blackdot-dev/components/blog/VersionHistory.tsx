'use client'

import { PostVersion } from '@/lib/types/blog.types'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { formatPostDateTime, getDiffSummary, formatAuthorName } from '@/lib/blog/utils'
import { RotateCcw } from 'lucide-react'

interface VersionHistoryProps {
  versions: PostVersion[]
  onSelectVersion?: (version: PostVersion) => void
  onRevert?: (version: PostVersion) => void
  isLoading?: boolean
  selectedVersionId?: string
}

/**
 * Post version history with revert capability
 */
export function VersionHistory({
  versions,
  onSelectVersion,
  onRevert,
  isLoading,
  selectedVersionId,
}: VersionHistoryProps) {
  if (versions.length === 0) {
    return (
      <div className="p-4 text-sm text-muted-foreground text-center">
        No version history available
      </div>
    )
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-2 p-4">
        {versions.map((version, index) => (
          <div
            key={version.id}
            className={`p-3 rounded-lg border transition-colors cursor-pointer ${
              selectedVersionId === version.id
                ? 'border-primary bg-primary/5'
                : 'border-white/10 bg-background/40 hover:bg-background/60'
            }`}
            onClick={() => onSelectVersion?.(version)}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground">
                  Version {versions.length - index}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatPostDateTime(version.createdAt)}
                </p>
                <p className="text-xs text-muted-foreground">
                  by {formatAuthorName(version.author)}
                </p>
                {version.changeDescription && (
                  <p className="text-xs text-foreground mt-1">
                    {version.changeDescription}
                  </p>
                )}
              </div>

              {onRevert && index > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 flex-shrink-0"
                  onClick={(e) => {
                    e.stopPropagation()
                    onRevert(version)
                  }}
                  disabled={isLoading}
                  title="Revert to this version"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}
