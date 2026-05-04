'use client'

import { CodeBlock } from './CodeBlock'
import { Separator } from '@/components/ui/separator'
import type { ArticleSection as ArticleSectionType } from '../config/article.config'

interface ArticleSectionProps {
  section: ArticleSectionType
}

export function ArticleSection({ section }: ArticleSectionProps) {
  const { heading, content } = section

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-4 text-foreground">
          {heading}
        </h2>

        {/* Paragraphs */}
        <div className="space-y-4">
          {content.paragraphs.map((paragraph, idx) => (
            <p
              key={idx}
              className="text-base text-foreground/80 leading-relaxed"
            >
              {paragraph}
            </p>
          ))}
        </div>

        {/* Highlights */}
        {content.highlights && content.highlights.length > 0 && (
          <div className="mt-6">
            <ul className="space-y-2">
              {content.highlights.map((highlight, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-3 text-foreground/80"
                >
                  <span className="text-blue-500 font-bold mt-1">•</span>
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Code Snippet */}
        {content.codeSnippet && (
          <CodeBlock
            code={content.codeSnippet.code}
            language={content.codeSnippet.language}
            filename={content.codeSnippet.filename}
          />
        )}

        {/* Image */}
        {content.image && (
          <figure className="my-6">
            <div className="rounded-lg overflow-hidden border border-border/50 bg-background/50">
              <img
                src={content.image.src}
                alt={content.image.alt}
                className="w-full h-auto"
              />
            </div>
            {content.image.caption && (
              <figcaption className="mt-2 text-sm text-foreground/60 text-center">
                {content.image.caption}
              </figcaption>
            )}
          </figure>
        )}
      </div>

      <Separator className="mt-8" />
    </div>
  )
}
