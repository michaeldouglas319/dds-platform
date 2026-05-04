"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Download, FileText, Loader2, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { downloadResumePDF, previewResumeHTML } from '@/lib/utils/resumePdfGenerator';
import type { JobSection } from '@/lib/config/content';
import { cn } from '@/lib/utils';

interface ResumePdfPreviewProps {
  resumeJobs: JobSection[];
  trigger?: React.ReactNode;
  className?: string;
}

const MIN_SCALE = 0.5;
const MAX_SCALE = 2.0;
const SCALE_STEP = 0.1;
const DEFAULT_SCALE = 1.0;

export function ResumePdfPreview({ 
  resumeJobs, 
  trigger,
  className 
}: ResumePdfPreviewProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewHTML, setPreviewHTML] = useState<string>('');
  const [scale, setScale] = useState(DEFAULT_SCALE);
  const previewRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Generate preview HTML when dialog opens or resumeJobs changes
  useEffect(() => {
    if (isOpen) {
      const html = previewResumeHTML(resumeJobs);
      setPreviewHTML(html);
    }
  }, [isOpen, resumeJobs]);

  // Reset scale when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setScale(DEFAULT_SCALE);
    }
  }, [isOpen]);

  // Auto-fit scale based on container size
  useEffect(() => {
    if (isOpen && containerRef.current && previewRef.current) {
      const updateScale = () => {
        const container = containerRef.current;
        const preview = previewRef.current;
        if (!container || !preview) return;

        const containerWidth = container.clientWidth - 32; // Account for padding
        const previewWidth = 8.5 * 96; // 8.5 inches in pixels at 96 DPI
        
        // Calculate optimal scale to fit container
        const optimalScale = Math.min(
          containerWidth / previewWidth,
          MAX_SCALE
        );
        
        // Only auto-scale if it's reasonable (not too small)
        if (optimalScale >= MIN_SCALE && scale === DEFAULT_SCALE) {
          setScale(Math.max(optimalScale, MIN_SCALE));
        }
      };

      // Initial calculation
      updateScale();

      // Update on resize
      const resizeObserver = new ResizeObserver(updateScale);
      resizeObserver.observe(containerRef.current);

      return () => resizeObserver.disconnect();
    }
  }, [isOpen, scale]);

  const handleZoomIn = useCallback(() => {
    setScale(prev => Math.min(prev + SCALE_STEP, MAX_SCALE));
  }, []);

  const handleZoomOut = useCallback(() => {
    setScale(prev => Math.max(prev - SCALE_STEP, MIN_SCALE));
  }, []);

  const handleResetZoom = useCallback(() => {
    setScale(DEFAULT_SCALE);
  }, []);

  // Keyboard shortcuts for zoom
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === '=' || e.key === '+') {
          e.preventDefault();
          handleZoomIn();
        } else if (e.key === '-') {
          e.preventDefault();
          handleZoomOut();
        } else if (e.key === '0') {
          e.preventDefault();
          handleResetZoom();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleZoomIn, handleZoomOut, handleResetZoom]);

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      await downloadResumePDF(resumeJobs);
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to download PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const defaultTrigger = (
    <Button variant="outline" size="sm" className={cn("gap-2", className)}>
      <FileText className="h-4 w-4" />
      Download PDF
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] w-full max-h-[95vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>Resume Preview</DialogTitle>
              <DialogDescription>
                Review your resume before downloading as PDF
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handleZoomOut}
                disabled={scale <= MIN_SCALE}
                className="h-8 w-8"
                title="Zoom Out"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <div className="min-w-[60px] text-center text-sm font-medium">
                {Math.round(scale * 100)}%
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={handleZoomIn}
                disabled={scale >= MAX_SCALE}
                className="h-8 w-8"
                title="Zoom In"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleResetZoom}
                className="h-8 w-8"
                title="Reset Zoom"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        <div 
          ref={containerRef}
          className="flex-1 overflow-auto border-t border-b bg-gray-100 p-4"
          style={{
            minHeight: 0,
          }}
        >
          <div 
            className="bg-white shadow-lg mx-auto transition-transform duration-200"
            style={{
              transform: `scale(${scale})`,
              transformOrigin: 'top center',
              width: `${8.5 * 96}px`, // 8.5 inches at 96 DPI
              minHeight: `${11 * 96}px`, // 11 inches at 96 DPI
            }}
          >
            <div 
              ref={previewRef}
              dangerouslySetInnerHTML={{ __html: previewHTML }}
            />
          </div>
        </div>

        <DialogFooter className="px-6 py-4 gap-2">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isGenerating}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDownload}
            disabled={isGenerating}
            className="gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Download PDF
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

