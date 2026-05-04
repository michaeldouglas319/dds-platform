/**
 * Content Structure Types
 * Defines the shape of content data for Ideas and Resume pages
 */

export interface ContentCitation {
  text: string;
  url: string;
}

export interface ContentParagraph {
  subtitle?: string;
  description?: string;
  citations?: ContentCitation[];
}

export interface ContentHighlight {
  subtitle?: string;
  description?: string;
}

export interface ContentSection {
  id: string;
  title: string;
  subtitle?: string;
  color: string;
  content: {
    heading?: string;
    paragraphs?: (string | ContentParagraph)[];
    highlights?: (string | ContentHighlight)[];
  };
  drilldown?: {
    enabled: boolean;
  };
}

export interface JobContent {
  id: string;
  role: string;
  company: string;
  period: string;
  color: string;
  content: {
    paragraphs: string[];
    highlights?: string[];
  };
}
