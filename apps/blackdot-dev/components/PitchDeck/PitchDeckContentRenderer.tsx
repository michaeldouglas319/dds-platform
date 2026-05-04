'use client';

import { ReactNode } from 'react';

interface ParagraphContent {
  subtitle?: string;
  description?: string;
  citations?: Array<{ text: string; url: string }>;
}

interface HighlightContent {
  subtitle?: string;
  description?: string;
}

interface PitchDeckContentRendererProps {
  paragraphs?: (string | ParagraphContent)[];
  highlights?: (string | HighlightContent)[];
  color?: string;
  children?: ReactNode;
}

/**
 * Renders paragraph and highlight content for pitch deck sections
 * Handles both simple strings and complex content objects
 */
export function PitchDeckContentRenderer({
  paragraphs,
  highlights,
  color = '#ffffff',
  children,
}: PitchDeckContentRendererProps) {
  return (
    <>
      {paragraphs && paragraphs.length > 0 && (
        <div className="space-y-4 mb-6">
          {paragraphs.map((paragraph, index) => {
            if (typeof paragraph === 'string') {
              return (
                <p key={index} className="text-foreground/80 leading-relaxed">
                  {paragraph}
                </p>
              );
            } else {
              return (
                <div key={index} className="space-y-2">
                  {paragraph.subtitle && (
                    <h4 className="font-semibold text-foreground">{paragraph.subtitle}</h4>
                  )}
                  {paragraph.description && (
                    <p className="text-foreground/80 leading-relaxed">{paragraph.description}</p>
                  )}
                  {paragraph.citations && paragraph.citations.length > 0 && (
                    <div className="text-sm text-muted-foreground space-y-1">
                      {paragraph.citations.map((citation, cIdx) => (
                        <div key={cIdx}>
                          <a
                            href={citation.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline hover:text-foreground transition-colors"
                          >
                            {citation.text}
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            }
          })}
        </div>
      )}

      {highlights && highlights.length > 0 && (
        <ul className="space-y-2 mb-6">
          {highlights.map((highlight, index) => {
            if (typeof highlight === 'string') {
              return (
                <li key={index} className="flex items-start gap-2">
                  <span
                    className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-foreground/75">{highlight}</span>
                </li>
              );
            } else {
              return (
                <li key={index} className="flex items-start gap-2">
                  <span
                    className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <div>
                    {highlight.subtitle && (
                      <span className="font-semibold text-foreground">{highlight.subtitle}: </span>
                    )}
                    {highlight.description && (
                      <span className="text-foreground/75">{highlight.description}</span>
                    )}
                  </div>
                </li>
              );
            }
          })}
        </ul>
      )}

      {children}
    </>
  );
}
