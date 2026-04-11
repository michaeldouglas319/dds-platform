import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import type { UniversalSection } from '@dds/types';
import { SectionBatchRenderer } from '@dds/renderer';
import {
  WikiArticleRenderer,
  slugify,
  wikiArticleEntry,
} from '../lib/wiki-renderer';
import { wikiRegistry } from '../lib/wiki-registry';
import { homeArticle } from '../data/home-article';

function fixture(overrides: Partial<UniversalSection> = {}): UniversalSection {
  return {
    id: 'test',
    type: 'entry',
    display: { layout: 'wiki-article' },
    subject: { title: 'Hello' },
    ...overrides,
  };
}

describe('slugify', () => {
  it('lowercases, normalises and dashes spaces', () => {
    expect(slugify('How this wiki is built')).toBe('how-this-wiki-is-built');
  });

  it('strips diacritics and punctuation', () => {
    expect(slugify('Café — éxposé!')).toBe('cafe-expose');
  });

  it('collapses repeated whitespace', () => {
    expect(slugify('  multiple   spaces ')).toBe('multiple-spaces');
  });
});

describe('WikiArticleRenderer', () => {
  it('renders the title as an <h1> by default with stable id', () => {
    render(
      <WikiArticleRenderer
        section={fixture({ id: 'a', subject: { title: 'My Topic' } })}
      />,
    );
    const h1 = screen.getByRole('heading', { level: 1, name: 'My Topic' });
    expect(h1).toHaveAttribute('id', 'wiki-article-a');
  });

  it('respects display.headingLevel for the title', () => {
    render(
      <WikiArticleRenderer
        section={fixture({
          id: 'b',
          subject: { title: 'Nested' },
          display: { layout: 'wiki-article', headingLevel: 2 },
        })}
      />,
    );
    expect(
      screen.getByRole('heading', { level: 2, name: 'Nested' }),
    ).toBeInTheDocument();
    // Section paragraphs cascade one level below the title
    render(
      <WikiArticleRenderer
        section={fixture({
          id: 'c',
          subject: { title: 'Cascade' },
          display: { layout: 'wiki-article', headingLevel: 2 },
          content: { paragraphs: [{ subtitle: 'Sub', description: 'x' }] },
        })}
      />,
    );
    expect(
      screen.getByRole('heading', { level: 3, name: 'Sub' }),
    ).toBeInTheDocument();
  });

  it('exposes the article landmark linked to its title', () => {
    render(
      <WikiArticleRenderer
        section={fixture({ id: 'd', subject: { title: 'Linked' } })}
      />,
    );
    const article = screen.getByRole('article', { name: 'Linked' });
    expect(article).toHaveAttribute('aria-labelledby', 'wiki-article-d');
  });

  it('renders body, paragraphs, citations, highlights and topics', () => {
    render(
      <WikiArticleRenderer
        section={fixture({
          id: 'e',
          subject: { title: 'Full' },
          content: {
            body: 'opening',
            paragraphs: [
              {
                subtitle: 'Section A',
                description: 'detail A',
                citations: [{ text: 'cite-1', url: 'https://example.com/1' }],
              },
            ],
            highlights: [{ subtitle: 'Schema', description: 'UniversalSection' }],
            items: ['Topic one', 'Topic two'],
          },
        })}
      />,
    );

    expect(screen.getByText('opening')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Section A' })).toBeInTheDocument();
    expect(screen.getByText('detail A')).toBeInTheDocument();

    const citationList = screen.getByRole('list', { name: 'Citations' });
    expect(within(citationList).getByRole('link', { name: 'cite-1' })).toHaveAttribute(
      'href',
      'https://example.com/1',
    );

    const aside = screen.getByRole('complementary', { name: 'Key facts' });
    expect(within(aside).getByText('Schema')).toBeInTheDocument();
    expect(within(aside).getByText('UniversalSection')).toBeInTheDocument();

    const topics = screen.getByRole('navigation', { name: 'Related topics' });
    expect(within(topics).getByText('Topic one')).toBeInTheDocument();
    expect(within(topics).getByText('Topic two')).toBeInTheDocument();
  });

  it('renders empty gracefully when only the id is provided', () => {
    render(
      <WikiArticleRenderer
        section={{ id: 'empty', type: 'entry', display: { layout: 'wiki-article' } }}
      />,
    );
    // Falls back to "Untitled" so the article landmark always has an accessible name
    expect(
      screen.getByRole('heading', { level: 1, name: 'Untitled' }),
    ).toBeInTheDocument();
  });
});

describe('wikiRegistry', () => {
  it('exposes wiki-article and inherits the @dds/renderer defaults', () => {
    expect(wikiRegistry).toHaveProperty('wiki-article');
    // Inherited keys from defaultRegistry — proves additive composition
    expect(wikiRegistry).toHaveProperty('hero');
    expect(wikiRegistry).toHaveProperty('text');
    expect(wikiRegistry).toHaveProperty('cta');
  });

  it('routes a wiki-article section through SectionBatchRenderer', () => {
    render(
      <SectionBatchRenderer
        sections={[homeArticle]}
        registry={wikiRegistry}
      />,
    );
    expect(
      screen.getByRole('heading', { level: 1, name: /A wiki for the abundance era/i }),
    ).toBeInTheDocument();
  });

  it('plugin entry metadata identifies the layout key', () => {
    expect(wikiArticleEntry.metadata.name).toBe('wiki-article');
    expect(wikiArticleEntry.metadata.layouts).toContain('wiki-article');
  });
});
