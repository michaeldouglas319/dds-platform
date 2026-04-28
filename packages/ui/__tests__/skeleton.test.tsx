import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Skeleton } from '../components/skeleton';

describe('Skeleton', () => {
  it('renders without crashing', () => {
    const { container } = render(<Skeleton />);
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('applies default classes', () => {
    const { container } = render(<Skeleton />);
    const element = container.firstChild as HTMLElement;
    expect(element).toHaveClass('animate-pulse', 'rounded-md', 'bg-muted');
  });

  it('forwards className prop and merges with defaults', () => {
    const { container } = render(<Skeleton className="h-12 w-12 rounded-full" />);
    const element = container.firstChild as HTMLElement;
    expect(element).toHaveClass('h-12', 'w-12', 'rounded-full');
    // Should also have defaults
    expect(element).toHaveClass('animate-pulse', 'bg-muted');
  });

  it('forwards ref', () => {
    let ref: HTMLDivElement | null = null;
    const { container } = render(<Skeleton ref={(el) => (ref = el)} />);
    expect(ref).toBe(container.firstChild);
  });

  it('forwards HTML attributes', () => {
    const { container } = render(
      <Skeleton data-testid="test-skeleton" aria-label="Loading" />
    );
    const element = container.firstChild as HTMLElement;
    expect(element).toHaveAttribute('data-testid', 'test-skeleton');
    expect(element).toHaveAttribute('aria-label', 'Loading');
  });

  it('works as a placeholder for multiple items', () => {
    const { container } = render(
      <div className="space-y-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
    );

    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons).toHaveLength(3);
  });
});
