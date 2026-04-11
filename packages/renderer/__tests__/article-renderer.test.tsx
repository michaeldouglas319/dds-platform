import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { ArticleRenderer } from '../renderers/article-renderer';
import { defaultRegistry } from '../registry';
import { SectionBatchRenderer } from '../batch-renderer';
import type { UniversalSection } from '@dds/types';

function makeArticle(overrides: Partial<UniversalSection> = {}): UniversalSection {
  return {
    id: 'welcome',
    type: 'section',
    display: { layout: 'article' },
    subject: {
      title: 'Welcome to the wiki',
      category: 'Guide',
      summary: 'A friendly orientation to what this wiki is, who it is for, and how to use it.',
      tags: { kind: 'meta', audience: 'newcomers' },
    },
    content: {
      paragraphs: [
        {
          subtitle: 'What this is',
          description: 'A living reference for the ideas, maps, and practices of the age of abundance.',
          citations: [{ text: 'Source One', url: 'https://example.com/one' }],
        },
        {
          subtitle: 'How to read it',
          description: 'Start anywhere. Follow the links. Come back tomorrow.',
        },
      ],
    },
    links: { primary: { text: 'Browse all articles', href: '/articles' } },
    meta: {
      author: 'The Editors',
      lastUpdated: '2026-04-11',
      readingTime: '3 min read',
    },
    ...overrides,
  };
}

describe('ArticleRenderer', () => {
  it('renders the title as the single h1 and labels the article landmark', () => {
    render(<ArticleRenderer section={makeArticle()} />);
    const article = screen.getByRole('article');
    expect(article).toHaveAttribute('aria-labelledby');

    const h1s = screen.getAllByRole('heading', { level: 1 });
    expect(h1s).toHaveLength(1);
    expect(h1s[0]).toHaveTextContent('Welcome to the wiki');
  });

  it('renders category, lede, byline, and last-updated metadata', () => {
    render(<ArticleRenderer section={makeArticle()} />);
    expect(screen.getByText('Guide')).toBeInTheDocument();
    expect(
      screen.getByText(/A friendly orientation to what this wiki is/),
    ).toBeInTheDocument();
    expect(screen.getByText(/By The Editors/)).toBeInTheDocument();
    expect(screen.getByText(/Last updated/)).toBeInTheDocument();
  });

  it('renders each paragraph as a section with heading, body, and accessible citations', () => {
    render(<ArticleRenderer section={makeArticle()} />);

    const firstHeading = screen.getByRole('heading', { level: 2, name: 'What this is' });
    expect(firstHeading).toBeInTheDocument();

    const secondHeading = screen.getByRole('heading', { level: 2, name: 'How to read it' });
    expect(secondHeading).toBeInTheDocument();

    const citations = screen.getByRole('list', { name: /citations for what this is/i });
    const citationLink = within(citations).getByRole('link', { name: /Source One/ });
    expect(citationLink).toHaveAttribute('href', 'https://example.com/one');
    expect(citationLink).toHaveAttribute('rel', 'noopener noreferrer');
    expect(citationLink).toHaveAttribute('target', '_blank');
  });

  it('renders a skip link that targets the article body landmark', () => {
    render(<ArticleRenderer section={makeArticle()} />);
    const skip = screen.getByRole('link', { name: 'Skip to article body' });
    const href = skip.getAttribute('href') ?? '';
    expect(href.startsWith('#')).toBe(true);
    const body = document.getElementById(href.slice(1));
    expect(body).not.toBeNull();
    expect(body?.tagName.toLowerCase()).toBe('main');
  });

  it('exposes the primary link as a footer CTA', () => {
    render(<ArticleRenderer section={makeArticle()} />);
    const cta = screen.getByRole('link', { name: /Browse all articles/ });
    expect(cta).toHaveAttribute('href', '/articles');
  });

  it('renders the tag list with an accessible label', () => {
    render(<ArticleRenderer section={makeArticle()} />);
    const tags = screen.getByRole('list', { name: 'Tags' });
    const items = within(tags).getAllByRole('listitem');
    expect(items).toHaveLength(2);
    expect(items.map((li) => li.textContent)).toEqual(['meta', 'newcomers']);
  });

  it('surfaces an empty-state status when no paragraphs are provided', () => {
    render(<ArticleRenderer section={makeArticle({ content: {} })} />);
    expect(screen.getByRole('status')).toHaveTextContent(/no body yet/i);
  });

  it('is reachable via the default registry under layout key "article"', () => {
    render(<SectionBatchRenderer sections={[makeArticle()]} registry={defaultRegistry} />);
    expect(screen.getByRole('article')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Welcome to the wiki');
  });
});
