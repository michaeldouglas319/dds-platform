import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SectionBatchRenderer } from '../batch-renderer';
import { createRegistry } from '../registry';
import type { UniversalSection, RendererEntry, FeatureFlags } from '@dds/types';

function makeSection(overrides: Partial<UniversalSection> = {}): UniversalSection {
  return {
    id: 'test-1',
    type: 'section',
    name: 'Test Section',
    display: { layout: 'mock' },
    ...overrides,
  };
}

const mockEntry: RendererEntry = {
  component: ({ section }) => <div data-testid={`rendered-${section.id}`}>{section.name}</div>,
  metadata: { name: 'mock', displayName: 'Mock' },
};

const mockRegistry = createRegistry({ mock: mockEntry });

describe('SectionBatchRenderer', () => {
  it('renders sections using the registry', () => {
    const sections = [makeSection({ id: 's1', name: 'First' }), makeSection({ id: 's2', name: 'Second' })];
    render(<SectionBatchRenderer sections={sections} registry={mockRegistry} />);
    expect(screen.getByTestId('rendered-s1')).toHaveTextContent('First');
    expect(screen.getByTestId('rendered-s2')).toHaveTextContent('Second');
  });

  it('skips sections with display.visible === false', () => {
    const sections = [
      makeSection({ id: 's1', name: 'Visible' }),
      makeSection({ id: 's2', name: 'Hidden', display: { layout: 'mock', visible: false } }),
    ];
    render(<SectionBatchRenderer sections={sections} registry={mockRegistry} />);
    expect(screen.getByTestId('rendered-s1')).toBeInTheDocument();
    expect(screen.queryByTestId('rendered-s2')).not.toBeInTheDocument();
  });

  it('skips sections with a featureFlag when the flag is disabled', () => {
    const sections = [
      makeSection({ id: 's1', name: 'No flag' }),
      makeSection({ id: 's2', name: 'Flagged', display: { layout: 'mock', featureFlag: 'premium' } }),
    ];
    const features: FeatureFlags = { premium: false };
    render(<SectionBatchRenderer sections={sections} registry={mockRegistry} features={features} />);
    expect(screen.getByTestId('rendered-s1')).toBeInTheDocument();
    expect(screen.queryByTestId('rendered-s2')).not.toBeInTheDocument();
  });

  it('renders sections with a featureFlag when the flag is enabled', () => {
    const sections = [
      makeSection({ id: 's1', name: 'Flagged', display: { layout: 'mock', featureFlag: 'premium' } }),
    ];
    const features: FeatureFlags = { premium: true };
    render(<SectionBatchRenderer sections={sections} registry={mockRegistry} features={features} />);
    expect(screen.getByTestId('rendered-s1')).toBeInTheDocument();
  });

  it('renders fallback for unknown layout types', () => {
    const sections = [makeSection({ id: 's1', name: 'Unknown', display: { layout: 'nonexistent' } })];
    render(<SectionBatchRenderer sections={sections} registry={mockRegistry} />);
    expect(screen.queryByTestId('rendered-s1')).not.toBeInTheDocument();
    expect(screen.getByText(/No renderer for/)).toBeInTheDocument();
  });

  it('works with empty sections array', () => {
    const { container } = render(<SectionBatchRenderer sections={[]} registry={mockRegistry} />);
    expect(container.innerHTML).toBe('');
  });
});
