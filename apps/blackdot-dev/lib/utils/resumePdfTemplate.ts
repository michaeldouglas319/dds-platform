import type { JobSection } from '@/lib/config/content';

/**
 * Builds a traditional, ATS-friendly HTML resume from job sections
 * @param resumeJobs Array of job sections from resume data config
 * @returns Complete HTML string ready for PDF conversion
 */
export function buildResumeHTML(resumeJobs: JobSection[]): string {
  // Extract unique companies and roles (handling Tesla duplicates)
  const uniqueJobs = resumeJobs.filter((job, index, self) => 
    index === self.findIndex(j => j.company === job.company && j.role === job.role)
  );

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Michael Douglas - Resume</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 11pt;
      line-height: 1.4;
      color: #000000;
      background: #ffffff;
      padding: 0.75in;
      max-width: 8.5in;
      margin: 0 auto;
    }
    
    .header {
      text-align: center;
      margin-bottom: 0.5in;
      padding-bottom: 0.3in;
      border-bottom: 2px solid #000000;
    }
    
    .header h1 {
      font-size: 20pt;
      font-weight: bold;
      margin-bottom: 0.1in;
      letter-spacing: 0.5pt;
    }
    
    .header .subtitle {
      font-size: 10pt;
      color: #333333;
      margin-top: 0.05in;
    }
    
    .section {
      margin-bottom: 0.4in;
    }
    
    .section-title {
      font-size: 14pt;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 1pt;
      margin-bottom: 0.15in;
      padding-bottom: 0.05in;
      border-bottom: 1px solid #000000;
    }
    
    .job {
      margin-bottom: 0.35in;
      page-break-inside: avoid;
    }
    
    .job-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 0.1in;
    }
    
    .job-title {
      font-size: 12pt;
      font-weight: bold;
    }
    
    .job-company {
      font-size: 11pt;
      font-weight: bold;
      color: #000000;
    }
    
    .job-period {
      font-size: 10pt;
      color: #333333;
      font-style: italic;
    }
    
    .job-description {
      margin-top: 0.1in;
      margin-bottom: 0.1in;
    }
    
    .job-description p {
      margin-bottom: 0.08in;
      text-align: justify;
    }
    
    .job-highlights {
      margin-top: 0.1in;
      padding-left: 0.2in;
    }
    
    .job-highlights ul {
      list-style-type: disc;
      margin-left: 0.2in;
    }
    
    .job-highlights li {
      margin-bottom: 0.05in;
      font-size: 10pt;
    }
    
    @media print {
      body {
        padding: 0.75in;
      }
      
      .job {
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>MICHAEL DOUGLAS</h1>
    <div class="subtitle">Software Engineer</div>
  </div>
  
  <div class="section">
    <div class="section-title">Professional Experience</div>
    ${uniqueJobs.map(job => buildJobHTML(job)).join('')}
  </div>
</body>
</html>
  `.trim();

  return html;
}

/**
 * Builds HTML for a single job section
 */
function buildJobHTML(job: JobSection): string {
  const descriptionHTML = job.content.paragraphs
    .map(para => `<p>${escapeHTML(para)}</p>`)
    .join('');

  const highlightsHTML = job.content.highlights && job.content.highlights.length > 0
    ? `
    <div class="job-highlights">
      <ul>
        ${job.content.highlights.map(highlight => `<li>${escapeHTML(highlight)}</li>`).join('')}
      </ul>
    </div>
    `
    : '';

  return `
    <div class="job">
      <div class="job-header">
        <div>
          <div class="job-title">${escapeHTML(job.content.heading)}</div>
          <div class="job-company">${escapeHTML(job.company)}</div>
        </div>
        <div class="job-period">${escapeHTML(job.period)}</div>
      </div>
      <div class="job-description">
        ${descriptionHTML}
      </div>
      ${highlightsHTML}
    </div>
  `;
}

/**
 * Builds HTML content for preview (body content with styles, no full document structure)
 * @param resumeJobs Array of job sections from resume data config
 * @returns HTML string for preview display
 */
export function buildResumePreviewHTML(resumeJobs: JobSection[]): string {
  // Extract unique companies and roles (handling Tesla duplicates)
  const uniqueJobs = resumeJobs.filter((job, index, self) => 
    index === self.findIndex(j => j.company === job.company && j.role === job.role)
  );

  return `
<style>
  .resume-preview * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  .resume-preview {
    font-family: Arial, Helvetica, sans-serif;
    font-size: clamp(9pt, 1.375vw, 11pt);
    line-height: 1.4;
    color: #000000;
    background: #ffffff;
    padding: clamp(0.5in, 8vw, 0.75in);
    width: 100%;
    max-width: 8.5in;
    margin: 0 auto;
    min-height: 11in;
  }
  
  .resume-preview .header {
    text-align: center;
    margin-bottom: 0.5in;
    padding-bottom: 0.3in;
    border-bottom: 2px solid #000000;
  }
  
  .resume-preview .header h1 {
    font-size: clamp(16pt, 2.5vw, 20pt);
    font-weight: bold;
    margin-bottom: clamp(0.05in, 1.5vw, 0.1in);
    letter-spacing: 0.5pt;
  }
  
  .resume-preview .header .subtitle {
    font-size: clamp(8pt, 1.25vw, 10pt);
    color: #333333;
    margin-top: clamp(0.03in, 0.8vw, 0.05in);
  }
  
  .resume-preview .section {
    margin-bottom: clamp(0.25in, 5vw, 0.4in);
  }
  
  .resume-preview .section-title {
    font-size: clamp(12pt, 1.75vw, 14pt);
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 1pt;
    margin-bottom: clamp(0.1in, 2vw, 0.15in);
    padding-bottom: clamp(0.03in, 0.8vw, 0.05in);
    border-bottom: 1px solid #000000;
  }
  
  .resume-preview .job {
    margin-bottom: clamp(0.25in, 4.5vw, 0.35in);
  }
  
  .resume-preview .job-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: clamp(0.05in, 1.5vw, 0.1in);
  }
  
  .resume-preview .job-title {
    font-size: clamp(10pt, 1.5vw, 12pt);
    font-weight: bold;
  }
  
  .resume-preview .job-company {
    font-size: clamp(9pt, 1.375vw, 11pt);
    font-weight: bold;
    color: #000000;
  }
  
  .resume-preview .job-period {
    font-size: clamp(8pt, 1.25vw, 10pt);
    color: #333333;
    font-style: italic;
    white-space: nowrap;
  }
  
  .resume-preview .job-description {
    margin-top: clamp(0.05in, 1.5vw, 0.1in);
    margin-bottom: clamp(0.05in, 1.5vw, 0.1in);
  }
  
  .resume-preview .job-description p {
    margin-bottom: clamp(0.05in, 1.2vw, 0.08in);
    text-align: justify;
  }
  
  .resume-preview .job-highlights {
    margin-top: clamp(0.05in, 1.5vw, 0.1in);
    padding-left: clamp(0.15in, 2.5vw, 0.2in);
  }
  
  .resume-preview .job-highlights ul {
    list-style-type: disc;
    margin-left: clamp(0.15in, 2.5vw, 0.2in);
  }
  
  .resume-preview .job-highlights li {
    margin-bottom: clamp(0.03in, 0.8vw, 0.05in);
    font-size: clamp(8pt, 1.25vw, 10pt);
  }
  
  @media (max-width: 768px) {
    .resume-preview .job-header {
      flex-direction: column;
      align-items: flex-start;
    }
  }
</style>
<div class="resume-preview">
  <div class="header">
    <h1>MICHAEL DOUGLAS</h1>
    <div class="subtitle">Software Engineer</div>
  </div>
  
  <div class="section">
    <div class="section-title">Professional Experience</div>
    ${uniqueJobs.map(job => buildJobHTML(job)).join('')}
  </div>
</div>
  `.trim();
}

/**
 * Escapes HTML special characters to prevent XSS and formatting issues
 */
function escapeHTML(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

