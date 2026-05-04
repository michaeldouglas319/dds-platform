'use client'

import { ReactNode } from 'react'
import { useMobileDetection } from '@/hooks'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { ArticleMetadata } from '../config/article.config'

interface ArticleLayoutProps {
  metadata: ArticleMetadata
  demoPanel: ReactNode
  children: ReactNode
}

export function ArticleLayout({ metadata, demoPanel, children }: ArticleLayoutProps) {
  const isMobile = useMobileDetection(1024)

  if (isMobile) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Mobile Header */}
        <header className="border-b border-border/50 bg-background/95 backdrop-blur-lg sticky top-0 z-40">
          <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="text-xs">
                  {metadata.category}
                </Badge>
                <span className="text-xs text-foreground/60">{metadata.date}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-foreground leading-tight">
                {metadata.title}
              </h1>
              <p className="text-sm sm:text-base text-foreground/70">
                {metadata.subtitle}
              </p>
              <div className="flex items-center gap-2 text-sm text-foreground/60">
                <span>By</span>
                <span className="font-medium">{metadata.author}</span>
              </div>

              {/* External Links */}
              {metadata.externalLinks && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {metadata.externalLinks.demo && (
                    <a href={metadata.externalLinks.demo}>
                      <Button size="sm" variant="outline">
                        View Demo
                      </Button>
                    </a>
                  )}
                  {metadata.externalLinks.code && (
                    <a href={metadata.externalLinks.code}>
                      <Button size="sm" variant="outline">
                        View Code
                      </Button>
                    </a>
                  )}
                  {metadata.externalLinks.course && (
                    <a href={metadata.externalLinks.course}>
                      <Button size="sm" variant="default">
                        Take Course
                      </Button>
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Mobile Content */}
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Demo Panel */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold">3D Demo</h2>
            {demoPanel}
          </div>

          {/* Article Content */}
          {children}
        </main>
      </div>
    )
  }

  // Desktop Layout
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Desktop Header */}
      <header className="border-b border-border/50 bg-background/95 backdrop-blur-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-xs">
                {metadata.category}
              </Badge>
              <span className="text-xs text-foreground/60">{metadata.date}</span>
            </div>
            <h1 className="text-4xl font-black text-foreground">
              {metadata.title}
            </h1>
            <p className="text-xl text-foreground/70 max-w-3xl">
              {metadata.subtitle}
            </p>
            <div className="flex items-center gap-2 text-sm text-foreground/60">
              <span>By</span>
              <span className="font-medium">{metadata.author}</span>
            </div>

            {/* External Links */}
            {metadata.externalLinks && (
              <div className="flex flex-wrap gap-2 pt-2">
                {metadata.externalLinks.demo && (
                  <a href={metadata.externalLinks.demo}>
                    <Button size="sm" variant="outline">
                      View Demo
                    </Button>
                  </a>
                )}
                {metadata.externalLinks.code && (
                  <a href={metadata.externalLinks.code}>
                    <Button size="sm" variant="outline">
                      View Code
                    </Button>
                  </a>
                )}
                {metadata.externalLinks.course && (
                  <a href={metadata.externalLinks.course}>
                    <Button size="sm" variant="default">
                      Take Course
                    </Button>
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Desktop Split-Screen Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-[1fr_1.5fr] gap-8 py-8">
          {/* Left Panel - Sticky Demo */}
          <div className="space-y-6">
            <div className="sticky top-24 space-y-4 h-fit">
              <h2 className="text-lg font-bold">3D Demo</h2>
              {demoPanel}
            </div>
          </div>

          {/* Right Panel - Article Content */}
          <div className="overflow-hidden">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}
