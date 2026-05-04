import type { JobSection } from '@/lib/config/content';
import { buildResumeHTML, buildResumePreviewHTML } from './resumePdfTemplate';

// Dynamic import for html2pdf.js to avoid SSR issues
// This function is only called client-side, so the import won't execute during SSR
type Html2PdfType = {
  (): {
    set: (options: Record<string, unknown>) => {
      from: (element: HTMLElement) => {
        save: () => Promise<void>;
        outputPdf: (type: 'blob') => Promise<Blob>;
      };
    };
  };
};
let html2pdfCache: Html2PdfType | null = null;

async function getHtml2Pdf() {
  // Double check we're in browser environment
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    throw new Error('html2pdf.js can only be used in the browser');
  }

  // Cache the module to avoid re-importing on subsequent calls
  if (html2pdfCache) {
    return html2pdfCache;
  }
  
  try {
    // Use dynamic import - Next.js will bundle this for client-side only
    // The module will be included in the client bundle but not executed during SSR
    const html2pdfModule = await import('html2pdf.js');
    // Handle both default export and named export patterns
    html2pdfCache = html2pdfModule.default || html2pdfModule;
    return html2pdfCache;
  } catch (error) {
    console.error('Failed to load html2pdf.js:', error);
    throw new Error('PDF generation library failed to load. Please refresh the page and try again.');
  }
}

export interface PDFOptions {
  filename?: string;
  format?: 'letter' | 'a4';
  margin?: number | [number, number, number, number];
  quality?: number;
  scale?: number;
  orientation?: 'portrait' | 'landscape';
}

const DEFAULT_OPTIONS: Partial<PDFOptions> = {
  filename: 'Michael_Douglas_Resume.pdf',
  format: 'letter',
  margin: 0.75,
  quality: 0.98,
  scale: 2,
  orientation: 'portrait',
};

/**
 * Generates a PDF from resume data and triggers download
 * @param resumeJobs Array of job sections from resume data config
 * @param options PDF generation options
 * @returns Promise that resolves when PDF is generated and downloaded
 */
export async function downloadResumePDF(
  resumeJobs: JobSection[],
  options?: PDFOptions
): Promise<void> {
  try {
    // Ensure we're in the browser
    if (typeof window === 'undefined') {
      throw new Error('PDF generation is only available in the browser');
    }

    const html2pdf = await getHtml2Pdf();
    const html = buildResumeHTML(resumeJobs);
    
    // Create a temporary container element
    const container = document.createElement('div');
    container.innerHTML = html;
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '-9999px';
    document.body.appendChild(container);

    // Configure html2pdf options with dynamic scaling
    const pdfOptions = {
      margin: options?.margin ?? DEFAULT_OPTIONS.margin,
      filename: options?.filename ?? DEFAULT_OPTIONS.filename,
      image: { type: 'jpeg', quality: options?.quality ?? DEFAULT_OPTIONS.quality },
      html2canvas: { 
        scale: options?.scale ?? 2,
        useCORS: true,
        letterRendering: true,
        logging: false,
        windowWidth: 816, // 8.5 inches at 96 DPI
      },
      jsPDF: { 
        unit: 'in', 
        format: options?.format ?? DEFAULT_OPTIONS.format,
        orientation: options?.orientation ?? 'portrait',
      },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
    };

    // Generate and download PDF
    await html2pdf().set(pdfOptions).from(container).save();

    // Clean up temporary element
    document.body.removeChild(container);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF. Please try again.');
  }
}

/**
 * Generates HTML preview of resume (for modal display)
 * @param resumeJobs Array of job sections from resume data config
 * @returns HTML string for preview
 */
export function previewResumeHTML(resumeJobs: JobSection[]): string {
  return buildResumePreviewHTML(resumeJobs);
}

/**
 * Generates a PDF blob for programmatic use (without auto-download)
 * @param resumeJobs Array of job sections from resume data config
 * @param options PDF generation options
 * @returns Promise that resolves with PDF blob
 */
export async function generateResumePDFBlob(
  resumeJobs: JobSection[],
  options?: PDFOptions
): Promise<Blob> {
  try {
    // Ensure we're in the browser
    if (typeof window === 'undefined') {
      throw new Error('PDF generation is only available in the browser');
    }

    const html2pdf = await getHtml2Pdf();
    const html = buildResumeHTML(resumeJobs);
    
    // Create a temporary container element
    const container = document.createElement('div');
    container.innerHTML = html;
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '-9999px';
    document.body.appendChild(container);

    // Configure html2pdf options with dynamic scaling
    const pdfOptions = {
      margin: options?.margin ?? DEFAULT_OPTIONS.margin,
      image: { type: 'jpeg', quality: options?.quality ?? DEFAULT_OPTIONS.quality },
      html2canvas: { 
        scale: options?.scale ?? 2,
        useCORS: true,
        letterRendering: true,
        logging: false,
        windowWidth: 816, // 8.5 inches at 96 DPI
      },
      jsPDF: { 
        unit: 'in', 
        format: options?.format ?? DEFAULT_OPTIONS.format,
        orientation: options?.orientation ?? 'portrait',
      },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
    };

    // Generate PDF blob
    const pdfBlob = await html2pdf().set(pdfOptions).from(container).outputPdf('blob');

    // Clean up temporary element
    document.body.removeChild(container);

    return pdfBlob;
  } catch (error) {
    console.error('Error generating PDF blob:', error);
    throw new Error('Failed to generate PDF. Please try again.');
  }
}

