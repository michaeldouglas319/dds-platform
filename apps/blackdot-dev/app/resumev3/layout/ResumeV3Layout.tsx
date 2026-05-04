'use client'

import { lazy } from 'react';
import dynamic from 'next/dynamic';
import { UnifiedScrollLayout } from '@/components/shared/layouts/UnifiedScrollLayout';
import { resumeJobs } from '@/lib/config/content';
import { ResumePdfPreview } from '@/components/resume/ResumePdfPreview';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import { usePathnameBreadcrumbs } from '@/lib/contexts';

// Lazy load heavy components for better initial load performance
const ResumeContent = dynamic(
  () => import('../components/ResumeContent').then(mod => ({ default: mod.ResumeContent })),
  {
    loading: () => (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-muted-foreground">Loading content...</div>
      </div>
    ),
    ssr: false,
  }
);

const ResumeV3SceneWithBase = lazy(() =>
  import('../scene/ResumeV3SceneWithBase').then(mod => ({
    default: mod.ResumeV3SceneWithBase,
  }))
);

/**
 * Resume V3 Layout
 * Uses UnifiedScrollLayout for scalable, maintainable architecture
 */
export default function ResumeV3Layout() {
  // Set breadcrumbs for resume page
  usePathnameBreadcrumbs();

  return (
    <UnifiedScrollLayout
      sections={resumeJobs.map(job => ({ ...job, title: job.role }))}
      pageLabel="Resume"
      versionLabel="V3.0"
      navigationLabel="Project Hierarchy"
      SceneComponent={ResumeV3SceneWithBase}
      modelOffset={12.0}
      ContentComponent={ResumeContent}
      footerActions={
        <ResumePdfPreview
          resumeJobs={resumeJobs}
          trigger={
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2 text-[10px] font-medium uppercase tracking-wider"
            >
              <FileText className="h-3 w-3" />
              Download PDF
            </Button>
          }
        />
      }
    />
  );
}

export { ResumeV3Layout };
