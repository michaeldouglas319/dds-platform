import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import type { UniversalSection } from '@dds/types';
import { WikiTocRenderer, resolveTocItems } from '../renderers/wiki-toc-renderer';

// jsdom does not ship an IntersectionObserver implementation, so we provide
// a noop one that lets the renderer's effect run without crashing.
class NoopIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
  constructor(_cb: IntersectionObserverCallback, _opts?: IntersectionObserverInit) {}
}

beforeEach(() => {
  // @ts-expect-error — test environment shim
  globalThis.IntersectionObserver = NoopIntersectionObserver;
});

afterEach(() => {
  cleanup();
  const style = document.getElementById('dds-wiki-toc-styles');
  style?.remove();
});

function makeSection(overrides: Partial<UniversalSection> = {}): UniversalSection {
  return {
    id: 'toc-1',
    type: 'section',
    display: { layout: 'wiki-toc' },
    ...overrides,
  };
}

describe('resolveTocItems', () => {
  it('prefers meta.tocItems when provided', () => {
    const section = makeSection({
      meta: {
        tocItems: [
          { text: 'Alpha', href: '#alpha', level: 2 },
          { text: 'Beta', href: '#beta' },
          { text: 'invalid', href: 123 }, // invalid, should be filtered
        ],
      },
      children: [
        { id: 'ignored', type: 'section', subject: { title: 'Ignored' } },
      ],
    });

    const items = resolveTocItems(section);
    expect(items).toHaveLength(2);
    expect(items[0]).toEqual({ text: 'Alpha', href: '#alpha', level: 2 });
    expect(items[1]).toEqual({ text: 'Beta', href: '#beta', level: 2 });
  });

  it('derives items from children when meta.tocItems is absent', () => {
    const section = makeSection({
      children: [
        { id: 'intro', type: 'section', subject: { title: 'Introduction' } },
        {
          id: 'background',
          type: 'section',
          subject: { title: 'Background' },
          display: { headingLevel: 3 },
        },
        // Children without a title are skipped.
        { id: 'no-title', type: 'section' },
      ],
    });

    const items = resolveTocItems(section);
    expect(items).toEqual([
      { text: 'Introduction', href: '#intro', level: 2 },
      { text: 'Background', href: '#background', level: 3 },
    ]);
  });

  it('falls back to content.items with slugged hrefs', () => {
    const section = makeSection({
      content: { items: ['First Heading', 'Second Heading!'] },
    });

    const items = resolveTocItems(section);
    expect(items).toEqual([
      { text: 'First Heading', href: '#first-heading', level: 2 },
      { text: 'Second Heading!', href: '#second-heading', level: 2 },
    ]);
  });

  it('returns an empty array when nothing resolves', () => {
    expect(resolveTocItems(makeSection())).toEqual([]);
  });
});

describe('WikiTocRenderer', () => {
  it('renders a labelled landmark with the golden-path list', () => {
    const section = makeSection({
      subject: { title: 'On this page' },
      children: [
        { id: 'overview', type: 'section', subject: { title: 'Overview' } },
        { id: 'history', type: 'section', subject: { title: 'History' } },
      ],
    });

    render(<WikiTocRenderer section={section} />);

    const nav = screen.getByTestId('wiki-toc');
    expect(nav.tagName).toBe('NAV');
    expect(nav).toHaveAttribute('aria-label', 'On this page');

    const overviewLink = screen.getByRole('link', { name: 'Overview' });
    expect(overviewLink).toHaveAttribute('href', '#overview');

    const historyLink = screen.getByRole('link', { name: 'History' });
    expect(historyLink).toHaveAttribute('href', '#history');
  });

  it('shows the empty-state fallback when no headings resolve', () => {
    const section = makeSection({ subject: { title: 'Sections' } });
    render(<WikiTocRenderer section={section} />);

    const nav = screen.getByTestId('wiki-toc');
    expect(nav).toHaveAttribute('data-empty', 'true');
    expect(nav).toHaveTextContent(/No headings available/i);
  });

  it('honors an explicit meta.tocItems list over children', () => {
    const section = makeSection({
      meta: {
        tocItems: [
          { text: 'Custom A', href: '#custom-a' },
          { text: 'Custom B', href: '#custom-b' },
        ],
      },
      children: [
        { id: 'unused', type: 'section', subject: { title: 'Unused' } },
      ],
    });

    render(<WikiTocRenderer section={section} />);
    expect(screen.getByRole('link', { name: 'Custom A' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Custom B' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Unused' })).not.toBeInTheDocument();
  });

  it('injects the scoped stylesheet exactly once', () => {
    const section = makeSection({
      children: [{ id: 'a', type: 'section', subject: { title: 'A' } }],
    });

    const { rerender } = render(<WikiTocRenderer section={section} />);
    rerender(<WikiTocRenderer section={section} />);
    rerender(<WikiTocRenderer section={section} />);

    const styles = document.querySelectorAll('#dds-wiki-toc-styles');
    expect(styles).toHaveLength(1);
  });

  it('uses a default label when subject.title is missing', () => {
    const section = makeSection({
      children: [{ id: 'x', type: 'section', subject: { title: 'X' } }],
    });
    render(<WikiTocRenderer section={section} />);
    const nav = screen.getByTestId('wiki-toc');
    expect(nav).toHaveAttribute('aria-label', 'On this page');
  });

  it('tolerates environments without IntersectionObserver', () => {
    // @ts-expect-error — simulate older runtime
    delete globalThis.IntersectionObserver;

    const section = makeSection({
      children: [{ id: 'only', type: 'section', subject: { title: 'Only' } }],
    });

    expect(() =>
      render(<WikiTocRenderer section={section} />)
    ).not.toThrow();

    expect(screen.getByRole('link', { name: 'Only' })).toBeInTheDocument();
  });
});
