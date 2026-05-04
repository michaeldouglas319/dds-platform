'use client'

import React from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { useBreadcrumb } from '@/lib/contexts'
import { cn } from '@/lib/utils'

export function Breadcrumbs() {
  const { breadcrumbs } = useBreadcrumb()

  if (!breadcrumbs || breadcrumbs.length === 0) {
    return null
  }

  // On mobile, show only the last 2 items
  const displayBreadcrumbs = breadcrumbs

  return (
    <nav aria-label="breadcrumb" className="flex items-center gap-1 text-sm">
      {displayBreadcrumbs.map((crumb, index) => {
        const isLast = index === displayBreadcrumbs.length - 1

        return (
          <React.Fragment key={`${crumb.href}-${index}`}>
            {index > 0 && <ChevronRight className="h-4 w-4 text-muted-foreground mx-0.5 flex-shrink-0" />}

            {isLast ? (
              <span className="text-foreground font-medium">{crumb.label}</span>
            ) : crumb.href === '#' ? (
              <span className="text-muted-foreground">{crumb.label}</span>
            ) : (
              <Link
                href={crumb.href}
                className={cn(
                  'text-muted-foreground hover:text-foreground transition-colors',
                  'underline-offset-4 hover:underline',
                )}
              >
                {crumb.label}
              </Link>
            )}
          </React.Fragment>
        )
      })}
    </nav>
  )
}
