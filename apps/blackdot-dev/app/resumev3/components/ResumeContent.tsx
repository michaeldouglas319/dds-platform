'use client';

import { PitchDeckSection } from '@/components/PitchDeckSection';
import { useConfigQuery } from '@/lib/hooks/useConfigQuery';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Calendar, Zap, Code, Sparkles, Loader2 } from 'lucide-react';
import { useMobileDetection, useScrollNavigation } from '@/hooks';
import { InlineModelGrid } from './InlineModelGrid';
import { InlineJobModel } from './InlineJobModel';
import type { JobContent } from '@/lib/types/content.types';

/**
 * Resume Content Component
 * Scroll-based pitch deck style presentation
 * Each job is a full-screen section with responsive positioning
 * On mobile: Shows inline 3D models within cards
 * On desktop: Models shown in fixed background (handled by layout)
 */
export function ResumeContent() {
  const isMobile = useMobileDetection();
  const { data, isLoading } = useConfigQuery('content.resume');
  const resumeJobs = data?.value || [];
  const { scrollToNext } = useScrollNavigation(resumeJobs);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!resumeJobs || resumeJobs.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">No resume data available</p>
      </div>
    );
  }

  const handleModelClick = (jobIndex: number, jobId: string) => {
    const element = document.getElementById(jobId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <>
      {/* Hero Section - Personal Info */}
      <PitchDeckSection id="resume-hero" className="lg:pl-8">
        <div className="bg-background/90 backdrop-blur-lg border border-border rounded-lg p-8 shadow-xl max-w-2xl mx-auto lg:mx-0">
          <div className="flex items-center gap-6 mb-6">
            <Avatar className="w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 border-4 border-primary/20 shadow-2xl">
              <AvatarImage 
                src="/assets/michael_douglas_profile.png" 
                alt="Michael Douglas"
                className="object-cover"
                style={{
                  filter: 'brightness(1.1) contrast(1.15) saturate(1.1)',
                }}
              />
              <AvatarFallback className="text-3xl font-bold bg-primary/10 text-primary">
                MD
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-4xl font-black tracking-tight mb-2">Michael Douglas</h1>
              <p className="text-xl font-semibold text-foreground/90 mb-4">Software Engineer & Vision Systems Specialist</p>
              <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-foreground/80">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  <span>{resumeJobs.length} Professional Roles</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  <span>Expert in ML & Computer Vision</span>
                </div>
                <div className="flex items-center gap-2">
                  <Code className="w-4 h-4" />
                  <span>Python • C# • TypeScript</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Mobile: Inline model grid */}
          {isMobile && (
            <div className="mt-8 lg:hidden">
              <InlineModelGrid onModelClick={handleModelClick} />
            </div>
          )}
        </div>
      </PitchDeckSection>

      {/* Job Sections */}
      {resumeJobs.map((job: JobContent, index: number) => (
        <PitchDeckSection key={job.id} id={job.id} className="lg:pl-8">
          <div className="bg-background/90 backdrop-blur-lg border border-border rounded-lg p-8 shadow-xl max-w-2xl mx-auto lg:mx-0">
            <div className="mb-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-4xl font-black mb-2" style={{ color: job.color }}>
                    {job.role}
                  </h2>
                  {job.id === 'renewed-vision' ? (
                    <a
                      href="https://www.renewedvisioncddc.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-2xl font-semibold text-foreground/80 mb-2 hover:text-foreground transition-colors underline decoration-2 underline-offset-2"
                    >
                      {job.company}
                    </a>
                  ) : (
                  <p className="text-2xl font-semibold text-foreground/80 mb-2">{job.company}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm font-medium text-foreground/60">
                  <Calendar className="w-4 h-4" />
                  <span>{job.period}</span>
                </div>
              </div>
            </div>

            {/* Mobile: Inline model for this job */}
            {isMobile && (
              <div className="mb-6 lg:hidden">
                <InlineJobModel jobIndex={index} jobsCount={resumeJobs.length} height={250} />
              </div>
            )}

            <div className="space-y-4 mb-6">
              {job.content.paragraphs?.map((paragraph, pIndex) => (
                <p key={pIndex} className="text-foreground/80 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>

            {job.content.highlights && job.content.highlights.length > 0 && (
              <ul className="space-y-2 mb-6">
                {job.content.highlights.map((highlight, hIndex) => (
                  <li key={hIndex} className="flex items-start gap-2">
                    <span
                      className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                      style={{ backgroundColor: job.color }}
                    />
                    <span className="text-foreground/75">{highlight}</span>
                  </li>
                ))}
              </ul>
            )}

            {index < resumeJobs.length - 1 && (
              <Button
                onClick={() => scrollToNext(index)}
                className="w-full md:w-auto"
                style={{ backgroundColor: job.color }}
              >
                Next Role →
              </Button>
            )}
          </div>
        </PitchDeckSection>
      ))}
    </>
  );
}

