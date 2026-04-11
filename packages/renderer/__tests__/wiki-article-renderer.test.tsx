import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { WikiArticleRenderer } from '../renderers/wiki-article-renderer';
import { defaultRegistry } from '../registry';
import type { UniversalSection } from '@dds/types';

function makeArticle(overrides: Partial<UniversalSection> = {}): UniversalSection {
  return {
    id: 'abundance-overview',
    type: 'section',
    name: 'Age of Abundance — Overview',
    subject: {
      title: 'Age of Abundance',
      subtitle: 'A post-scarcity civilization operating manual',
      summary:
        'An evolving wiki about the transition from scarcity economics to abundance systems.',
      category: 'Overview',
    },
    content: {
      body: 'This is the opening paragraph — the lede continuation.',
      paragraphs: [
        {
          subtitle: 'Origins',
          description: 'Where it all began — the hypothesis was simple.',
        },
        {
          subtitle: 'Principles & practice',
          description: 'Core tenets of the framework.',
          citations: [
            { text: 'Primary source', url: 'https://example.test/source' },
          ],
        },
      ],
      items: ['Governance model', 'Economic primitives'],
    },
    display: { layout: 'wiki-article' },
    ...overrides,
  };
}

describe('WikiArticleRenderer', () => {
  it('renders a semantic <article> landmark with an h1 headline', () => {
    const section = makeArticle();
    render(<WikiArticleRenderer section={section} />);

    const article = screen.getByRole('article');
    expect(article).toBeInTheDocument();

    const heading = screen.getByRole('heading', { level: 1, name: 'Age of Abundance' });
    expect(heading).toBeInTheDocument();
    expect(article).toHaveAttribute(
      'aria-labelledby',
      heading.getAttribute('id'),
    );
  });

  it('renders subtitle, lede, and opener paragraph', () => {
    render(<WikiArticleRenderer section={makeArticle()} />);
    expect(
      screen.getByText('A post-scarcity civilization operating manual'),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /An evolving wiki about the transition from scarcity economics/,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText('This is the opening paragraph — the lede continuation.'),
    ).toBeInTheDocument();
  });

  it('renders h2 subsections with slugged anchor IDs and permalinks', () => {
    render(<WikiArticleRenderer section={makeArticle()} />);
    const origins = screen.getByRole('heading', { level: 2, name: /Origins/ });
    expect(origins).toHaveAttribute('id', 'wiki-article-abundance-overview-origins');

    const permalink = within(origins).getByRole('link', {
      name: 'Permalink to section: Origins',
    });
    expect(permalink).toHaveAttribute(
      'href',
      '#wiki-article-abundance-overview-origins',
    );

    const principles = screen.getByRole('heading', {
      level: 2,
      name: /Principles & practice/,
    });
    expect(principles).toHaveAttribute(
      'id',
      'wiki-article-abundance-overview-principles-practice',
    );
  });

  it('renders citations as an ordered list of links', () => {
    render(<WikiArticleRenderer section={makeArticle()} />);
    const citations = screen.getByRole('list', { name: 'Citations' });
    expect(citations.tagName).toBe('OL');
    const link = within(citations).getByRole('link', { name: 'Primary source' });
    expect(link).toHaveAttribute('href', 'https://example.test/source');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders a "See also" list from content.items', () => {
    render(<WikiArticleRenderer section={makeArticle()} />);
    const seeAlsoHeading = screen.getByRole('heading', {
      level: 2,
      name: 'See also',
    });
    expect(seeAlsoHeading).toBeInTheDocument();
    expect(screen.getByText('Governance model')).toBeInTheDocument();
    expect(screen.getByText('Economic primitives')).toBeInTheDocument();
  });

  it('allows meta.seeAlsoLabel to override the see-also heading', () => {
    const section = makeArticle({
      meta: { seeAlsoLabel: 'Related pages' },
    });
    render(<WikiArticleRenderer section={section} />);
    expect(
      screen.getByRole('heading', { level: 2, name: 'Related pages' }),
    ).toBeInTheDocument();
  });

  it('renders without crashing when only a title is provided', () => {
    const section: UniversalSection = {
      id: 'minimal',
      type: 'section',
      subject: { title: 'Minimal Article' },
      display: { layout: 'wiki-article' },
    };
    render(<WikiArticleRenderer section={section} />);
    expect(
      screen.getByRole('heading', { level: 1, name: 'Minimal Article' }),
    ).toBeInTheDocument();
  });

  it('is registered in defaultRegistry under wiki-article and article keys', () => {
    expect(defaultRegistry['wiki-article'].component).toBe(WikiArticleRenderer);
    expect(defaultRegistry.article.component).toBe(WikiArticleRenderer);
  });
});
