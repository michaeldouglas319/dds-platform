'use client';

import React from 'react';
import {
  parseMarkdownContent,
  stripMarkdown,
  type ParsedContent,
} from '@/lib/utils/markdownParser';

interface ParsedParagraphProps {
  text?: string;
  subtitle?: string;
  description?: string;
  citations?: Array<{ text: string; url: string }>;
  categoryColor?: string;
  descriptionColor?: string;
  descriptionOpacity?: number;
}

/**
 * Renders structured content as subtitle + description
 * Supports both structured format (subtitle + description) and markdown format (for backward compatibility)
 */
export function ParsedParagraph({
  text,
  subtitle,
  description,
  citations,
  categoryColor = '#4CAF50',
  descriptionColor = 'rgba(255, 255, 255, 0.8)',
  descriptionOpacity = 0.8,
}: ParsedParagraphProps) {
  // If structured format provided, use it directly
  if (subtitle !== undefined || description !== undefined) {
    return (
      <p style={{ lineHeight: 1.6, margin: '0 0 1rem 0' }}>
        {subtitle && (
          <>
            <strong style={{ color: categoryColor, fontWeight: 700 }}>
              {subtitle}:
            </strong>
            {' '}
          </>
        )}
        <span style={{ color: descriptionColor, opacity: descriptionOpacity }}>
          {description || ''}
          {citations && citations.length > 0 && (
            <CitationIndicators citations={citations.map((c, idx) => ({ text: c.text, url: c.url, index: idx }))} />
          )}
        </span>
      </p>
    );
  }

  // Fallback to markdown parsing for backward compatibility
  if (text) {
    const parsed = parseMarkdownContent(text);
    return (
      <p style={{ lineHeight: 1.6, margin: '0 0 1rem 0' }}>
        {parsed.category && (
          <>
            <strong style={{ color: categoryColor, fontWeight: 700 }}>
              {parsed.category}:
            </strong>
            {' '}
          </>
        )}
        <span style={{ color: descriptionColor, opacity: descriptionOpacity }}>
          {parsed.description}
          {parsed.citations && parsed.citations.length > 0 && (
            <CitationIndicators citations={parsed.citations} />
          )}
        </span>
      </p>
    );
  }

  return null;
}

interface ParsedHighlightProps {
  text?: string;
  subtitle?: string;
  description?: string;
  categoryColor?: string;
  fontSize?: string;
  lineHeight?: number;
}

/**
 * Renders a highlight (from highlights array)
 * Supports both structured format (subtitle + description) and markdown format (for backward compatibility)
 */
export function ParsedHighlight({
  text,
  subtitle,
  description,
  categoryColor = 'rgba(255, 255, 255, 0.9)',
  fontSize = '0.9rem',
  lineHeight = 1.5,
}: ParsedHighlightProps) {
  // If structured format provided, use it directly
  if (subtitle !== undefined || description !== undefined) {
    return (
      <li
        style={{
          marginBottom: '0.5rem',
          lineHeight,
          fontSize,
          color: 'rgba(255, 255, 255, 0.7)',
        }}
      >
        {subtitle && (
          <>
            <span style={{ color: categoryColor, fontWeight: 700 }}>
              {subtitle}:
            </span>
            {' '}
          </>
        )}
        <span>{description || ''}</span>
      </li>
    );
  }

  // Fallback to markdown parsing for backward compatibility
  if (text) {
    const parsed = parseMarkdownContent(text);
    return (
      <li
        style={{
          marginBottom: '0.5rem',
          lineHeight,
          fontSize,
          color: 'rgba(255, 255, 255, 0.7)',
        }}
      >
        {parsed.category && (
          <>
            <span style={{ color: categoryColor, fontWeight: 700 }}>
              {parsed.category}:
            </span>
            {' '}
          </>
        )}
        <span>{parsed.description}</span>
        {parsed.citations && parsed.citations.length > 0 && (
          <CitationIndicators citations={parsed.citations} />
        )}
      </li>
    );
  }

  return null;
}

interface CitationIndicatorsProps {
  citations: Array<{ text: string; url?: string }>;
}

/**
 * Renders inline citation indicators
 * Format: [1] [2] etc.
 */
function CitationIndicators({ citations }: CitationIndicatorsProps) {
  return (
    <span style={{ fontSize: '0.75em', marginLeft: '0.25em' }}>
      {citations.map((citation, idx) => (
        <a
          key={idx}
          href={citation.url}
          target="_blank"
          rel="noopener noreferrer"
          title={citation.text}
          style={{
            marginLeft: '0.25em',
            color: 'rgba(74, 202, 80, 0.8)',
            textDecoration: 'none',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          [{idx + 1}]
        </a>
      ))}
    </span>
  );
}

interface ParsedContentDisplayProps {
  content: ParsedContent;
  type?: 'paragraph' | 'highlight';
  categoryColor?: string;
}

/**
 * Generic component to render parsed content
 */
export function ParsedContentDisplay({
  content,
  type = 'paragraph',
  categoryColor = '#4CAF50',
}: ParsedContentDisplayProps) {
  if (type === 'highlight') {
    return (
      <li style={{ marginBottom: '0.5rem', lineHeight: 1.5 }}>
        {content.category && (
          <>
            <span style={{ color: categoryColor, fontWeight: 700 }}>
              {content.category}:
            </span>
            {' '}
          </>
        )}
        <span>{content.description}</span>
      </li>
    );
  }

  return (
    <p style={{ lineHeight: 1.6, margin: '0 0 1rem 0' }}>
      {content.category && (
        <>
          <strong style={{ color: categoryColor, fontWeight: 700 }}>
            {content.category}:
          </strong>
          {' '}
        </>
      )}
      <span>{content.description}</span>
    </p>
  );
}
