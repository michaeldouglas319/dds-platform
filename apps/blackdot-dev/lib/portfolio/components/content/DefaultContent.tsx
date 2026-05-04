'use client'

/**
 * DefaultContent Component
 * Fallback content component
 */

import { Section } from '../../config/sections.types';

interface DefaultContentProps {
  section?: Section;
}

export default function DefaultContent({ section }: DefaultContentProps) {
  if (!section) {
    return (
      <div className="p-8">
        <p className="text-muted-foreground">No content available</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-4xl font-bold">{section.title}</h1>
      {section.subtitle && (
        <p className="text-xl text-muted-foreground">{section.subtitle}</p>
      )}
      {section.content.paragraphs && (
        <div className="space-y-2">
          {section.content.paragraphs.map((para, idx) => (
            <p key={idx} className="text-foreground/80">{para}</p>
          ))}
        </div>
      )}
    </div>
  );
}
