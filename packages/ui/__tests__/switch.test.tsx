import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Switch } from '../index';

describe('Switch', () => {
  it('renders switch without throwing', () => {
    render(<Switch />);
    const switchElement = screen.getByRole('switch');
    expect(switchElement).toBeInTheDocument();
  });

  it('renders with default unchecked state', () => {
    render(<Switch />);
    const switchElement = screen.getByRole('switch');
    expect(switchElement).toHaveAttribute('data-state', 'unchecked');
  });

  it('supports defaultChecked prop', () => {
    render(<Switch defaultChecked />);
    const switchElement = screen.getByRole('switch');
    expect(switchElement).toHaveAttribute('data-state', 'checked');
  });

  it('accepts onCheckedChange prop', () => {
    const onCheckedChange = vi.fn();
    render(<Switch onCheckedChange={onCheckedChange} />);
    const switchElement = screen.getByRole('switch');
    expect(switchElement).toBeInTheDocument();
  });

  it('respects disabled state', () => {
    render(<Switch disabled />);
    const switchElement = screen.getByRole('switch');
    expect(switchElement).toHaveAttribute('disabled');
  });

  it('forwards className prop', () => {
    const { container } = render(<Switch className="custom-switch" />);
    const switchElement = container.querySelector('[role="switch"]');
    expect(switchElement?.className).toContain('custom-switch');
  });

  it('supports controlled checked state', () => {
    const { rerender } = render(<Switch checked={false} />);
    let switchElement = screen.getByRole('switch');
    expect(switchElement).toHaveAttribute('data-state', 'unchecked');

    rerender(<Switch checked={true} />);
    switchElement = screen.getByRole('switch');
    expect(switchElement).toHaveAttribute('data-state', 'checked');
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<Switch ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLElement);
  });
});
