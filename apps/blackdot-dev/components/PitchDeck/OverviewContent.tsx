'use client';

import { ReactNode } from 'react';
import { PitchDeckSection } from '@/components/PitchDeckSection';
import { Button } from '@/components/ui/button';
import { PitchDeckHero } from './PitchDeckHero';
import { PitchDeckContentRenderer } from './PitchDeckContentRenderer';
import { useScrollNavigation } from '@/hooks/useScrollNavigation';

interface SectionContent {
  heading?: string;
  title?: string;
  subtitle?: string;
  color: string;
  paragraphs?: (string | object)[];
  highlights?: (string | object)[];
  id: string;
}

interface OverviewContentProps {
  sections: SectionContent[];
  hero: {
    id: string;
    title: string;
    subtitle: string;
    description?: string;
    icon?: ReactNode;
    avatarSrc?: string;
    avatarFallback?: ReactNode;
    stats: Array<{ icon: ReactNode; label: string }>;
  };
  heroAdditionalContent?: ReactNode;
  nextButtonText?: string;
}

/**
 * Generic Overview Content Component
 * Consolidated replacement for BusinessOverviewContent and IdeasOverviewContent
 * Renders a hero section followed by section cards with navigation
 */
export function OverviewContent({
  sections,
  hero,
  heroAdditionalContent,
  nextButtonText = 'Next Phase →',
}: OverviewContentProps) {
  const { scrollToNext } = useScrollNavigation(sections);

  // Safety check: ensure sections is an array
  if (!sections || !Array.isArray(sections) || sections.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">No sections available</p>
      </div>
    );
  }

  return (
    <>
      {/* Hero Section */}
      <PitchDeckSection id={hero.id} className="lg:pl-8">
        <PitchDeckHero
          title={hero.title}
          subtitle={hero.subtitle}
          description={hero.description}
          avatarSrc={hero.avatarSrc}
          avatarFallback={hero.avatarFallback}
          stats={hero.stats}
          additionalContent={heroAdditionalContent}
        />
      </PitchDeckSection>

      {/* Section Cards */}
      {sections.map((section, index) => (
        <PitchDeckSection key={section.id} id={section.id} className="lg:pl-8">
          <div className="bg-background/90 backdrop-blur-lg border border-border rounded-lg p-8 shadow-xl max-w-2xl mx-auto lg:mx-0">
            <div className="mb-6">
              <h2 className="text-4xl font-black mb-2" style={{ color: section.color }}>
                {section.heading || section.title}
              </h2>
              {section.subtitle && (
                <p className="text-2xl font-semibold text-foreground/80 mb-2">{section.subtitle}</p>
              )}
            </div>

            <PitchDeckContentRenderer
              paragraphs={section.paragraphs}
              highlights={section.highlights}
              color={section.color}
            />

            {index < sections.length - 1 && (
              <Button
                onClick={() => scrollToNext(index)}
                className="w-full md:w-auto"
                style={{ backgroundColor: section.color }}
              >
                {nextButtonText}
              </Button>
            )}
          </div>
        </PitchDeckSection>
      ))}
    </>
  );
}
