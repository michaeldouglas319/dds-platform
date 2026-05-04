'use client';

import { PitchDeckSection } from '@/components/PitchDeckSection';
import { useConfigQuery } from '@/lib/hooks/useConfigQuery';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useScrollNavigation } from '@/hooks/useScrollNavigation';
import { ParsedParagraph, ParsedHighlight } from '@/lib/components/ParsedContent';
import { Loader2 } from 'lucide-react';

/**
 * Business Content Component
 * Scroll-based pitch deck style presentation
 * Each section is a full-screen section with responsive positioning
 */
export function BusinessContent() {
  const router = useRouter();
  const { data, isLoading } = useConfigQuery('content.business');
  const businessSections = data?.value || [];
  const { scrollToNext } = useScrollNavigation(businessSections);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!businessSections || businessSections.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">No business data available</p>
      </div>
    );
  }

  return (
    <>
      {/* Hero Section */}
      <PitchDeckSection id="business-hero" className="lg:pl-8">
        <div className="bg-background/90 backdrop-blur-lg border border-border rounded-lg p-8 shadow-xl max-w-2xl mx-auto lg:mx-0">
          <div className="mb-6">
            <h1 className="text-4xl font-black tracking-tight mb-2">Business Overview</h1>
            <p className="text-xl font-semibold text-foreground/90 mb-4">Productionizing Gold Standards</p>
            <p className="text-base text-foreground/80 leading-relaxed">
              Transforming innovative technology into scalable, production-ready solutions.
            </p>
          </div>
        </div>
      </PitchDeckSection>

      {/* Business Sections */}
      {businessSections.map((section: any, index: number) => (
        <PitchDeckSection key={section.id} id={section.id} className="lg:pl-8">
          <div className="bg-background/90 backdrop-blur-lg border border-border rounded-lg p-8 shadow-xl max-w-2xl mx-auto lg:mx-0">
            <div className="mb-6">
              <h2 className="text-4xl font-black mb-2" style={{ color: section.color }}>
                {section.content.heading || section.title}
              </h2>
              {section.subtitle && (
                <p className="text-xl text-foreground/80 mb-4">{section.subtitle}</p>
              )}
            </div>

            <div className="space-y-4 mb-6">
              {section.content.paragraphs && Array.isArray(section.content.paragraphs) && section.content.paragraphs.map((paragraph: any, pIndex: number) => {
                if (typeof paragraph === 'string') {
                  return (
                    <ParsedParagraph
                      key={pIndex}
                      text={paragraph}
                      categoryColor={section.color || '#4CAF50'}
                      descriptionColor="rgba(255, 255, 255, 0.8)"
                    />
                  );
                } else {
                  return (
                    <ParsedParagraph
                      key={pIndex}
                      subtitle={paragraph.subtitle}
                      description={paragraph.description}
                      citations={paragraph.citations}
                      categoryColor={section.color || '#4CAF50'}
                      descriptionColor="rgba(255, 255, 255, 0.8)"
                    />
                  );
                }
              })}
            </div>

            {section.content.highlights && Array.isArray(section.content.highlights) && section.content.highlights.length > 0 && (
              <ul className="space-y-2 mb-6 pl-6 list-disc">
                {section.content.highlights.map((highlight: any, hIndex: number) => {
                  if (typeof highlight === 'string') {
                    return (
                      <ParsedHighlight
                        key={hIndex}
                        text={highlight}
                        categoryColor={section.color || 'rgba(255, 255, 255, 0.9)'}
                        fontSize="0.95rem"
                        lineHeight={1.6}
                      />
                    );
                  } else {
                    return (
                      <ParsedHighlight
                        key={hIndex}
                        subtitle={highlight.subtitle}
                        description={highlight.description}
                        categoryColor={section.color || 'rgba(255, 255, 255, 0.9)'}
                        fontSize="0.95rem"
                        lineHeight={1.6}
                      />
                    );
                  }
                })}
              </ul>
            )}

            <div className="flex flex-col gap-2">
              {index < businessSections.length - 1 && (
                <Button
                  onClick={() => scrollToNext(index)}
                  className="w-full md:w-auto"
                  style={{ backgroundColor: section.color }}
                >
                  Continue →
                </Button>
              )}

              {section.drilldown?.enabled && (
                <Button
                  onClick={() => router.push(`/business/${section.id}`)}
                  variant="outline"
                  className="w-full md:w-auto"
                >
                  View Details →
                </Button>
              )}
            </div>
          </div>
        </PitchDeckSection>
      ))}
    </>
  );
}



