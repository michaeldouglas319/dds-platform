/**
 * Markdown Parser Utilities
 * Parses markdown formatted content into structured components
 * Supports:
 * - Bold category: **Category:** Description
 * - Bold with colon: **Category:** Description or Category: Description
 * - Inline citations: [text](citation)
 */

export interface ParsedContent {
  category?: string;
  description: string;
  citations?: Citation[];
}

export interface Citation {
  text: string;
  url?: string;
  index: number;
}

/**
 * Parse a string with format: **Category:** Description text
 * Returns { category, description }
 */
export function parseMarkdownContent(text: string): ParsedContent {
  if (!text) return { description: '' };

  // Extract bold content: **text** or **text:**
  const boldMatch = text.match(/\*\*([^*]+)\*\*:\s*/);

  if (boldMatch) {
    const category = boldMatch[1];
    const description = text.substring(boldMatch[0].length).trim();
    const citations = extractCitations(text);

    return {
      category,
      description,
      citations,
    };
  }

  // Fallback: try parsing without bold (Category: Description)
  const colonMatch = text.match(/^([^:]+):\s+(.+)$/);
  if (colonMatch) {
    const citations = extractCitations(text);
    return {
      category: colonMatch[1].trim(),
      description: colonMatch[2].trim(),
      citations,
    };
  }

  // No structured format found, return as description
  const citations = extractCitations(text);
  return {
    description: text,
    citations,
  };
}

/**
 * Extract inline citations from text
 * Format: [text](url) or [text]
 */
export function extractCitations(text: string): Citation[] {
  const citations: Citation[] = [];
  const citationRegex = /\[([^\]]+)\](?:\(([^)]*)\))?/g;
  let match;

  while ((match = citationRegex.exec(text)) !== null) {
    citations.push({
      text: match[1],
      url: match[2] || undefined,
      index: match.index,
    });
  }

  return citations;
}

/**
 * Remove markdown formatting from text
 * - Removes **text** bold
 * - Keeps [text](url) citations
 */
export function stripMarkdown(text: string): string {
  return text.replace(/\*\*([^*]+)\*\*/g, '$1');
}

/**
 * Convert markdown bold to HTML
 * **text** → <strong>text</strong>
 */
export function markdownToHtml(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>');
}

/**
 * Parse highlight with category:description format
 * Examples:
 * - "Regulatory Timeline: Final Part 108 rule expected spring 2026"
 * - "Market Growth: $73B (2024) to $163B (2030), CAGR 14%+"
 */
export function parseHighlight(highlight: string): ParsedContent {
  return parseMarkdownContent(highlight);
}

/**
 * Parse paragraph with bold category
 * Example: "**The Volume Gap:** The global drone market is projected to..."
 */
export function parseParagraph(paragraph: string): ParsedContent {
  return parseMarkdownContent(paragraph);
}

/**
 * Get plain text version without markdown
 */
export function getPlainText(content: ParsedContent): string {
  const parts = [];
  if (content.category) {
    parts.push(content.category + ':');
  }
  parts.push(content.description);
  return parts.join(' ');
}
