import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { RadioGroup, RadioGroupItem } from '../index';

describe('RadioGroup', () => {
  it('renders radio group without throwing', () => {
    render(
      <RadioGroup>
        <RadioGroupItem value="option1" id="option1" />
        <label htmlFor="option1">Option 1</label>
      </RadioGroup>
    );

    const radioGroup = screen.getByRole('radiogroup');
    expect(radioGroup).toBeInTheDocument();
  });

  it('renders multiple radio items', () => {
    render(
      <RadioGroup>
        <RadioGroupItem value="option1" id="option1" />
        <label htmlFor="option1">Option 1</label>
        <RadioGroupItem value="option2" id="option2" />
        <label htmlFor="option2">Option 2</label>
        <RadioGroupItem value="option3" id="option3" />
        <label htmlFor="option3">Option 3</label>
      </RadioGroup>
    );

    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(3);
  });

  it('supports defaultValue prop', () => {
    const { container } = render(
      <RadioGroup defaultValue="option2">
        <RadioGroupItem value="option1" id="option1" />
        <label htmlFor="option1">Option 1</label>
        <RadioGroupItem value="option2" id="option2" />
        <label htmlFor="option2">Option 2</label>
      </RadioGroup>
    );

    const radios = container.querySelectorAll('[role="radio"]');
    expect(radios[1]).toHaveAttribute('data-state', 'checked');
  });

  it('supports controlled value prop', () => {
    const { rerender, container } = render(
      <RadioGroup value="option1">
        <RadioGroupItem value="option1" id="option1" />
        <label htmlFor="option1">Option 1</label>
        <RadioGroupItem value="option2" id="option2" />
        <label htmlFor="option2">Option 2</label>
      </RadioGroup>
    );

    let radios = container.querySelectorAll('[role="radio"]');
    expect(radios[0]).toHaveAttribute('data-state', 'checked');

    rerender(
      <RadioGroup value="option2">
        <RadioGroupItem value="option1" id="option1" />
        <label htmlFor="option1">Option 1</label>
        <RadioGroupItem value="option2" id="option2" />
        <label htmlFor="option2">Option 2</label>
      </RadioGroup>
    );

    radios = container.querySelectorAll('[role="radio"]');
    expect(radios[1]).toHaveAttribute('data-state', 'checked');
  });

  it('accepts onValueChange prop', () => {
    const onValueChange = vi.fn();

    render(
      <RadioGroup onValueChange={onValueChange}>
        <RadioGroupItem value="option1" id="option1" />
        <label htmlFor="option1">Option 1</label>
        <RadioGroupItem value="option2" id="option2" />
        <label htmlFor="option2">Option 2</label>
      </RadioGroup>
    );

    const radioGroup = screen.getByRole('radiogroup');
    expect(radioGroup).toBeInTheDocument();
  });

  it('respects disabled state on items', () => {
    const { container } = render(
      <RadioGroup>
        <RadioGroupItem value="option1" id="option1" />
        <label htmlFor="option1">Option 1</label>
        <RadioGroupItem value="option2" id="option2" disabled />
        <label htmlFor="option2">Option 2 (Disabled)</label>
      </RadioGroup>
    );

    const radios = container.querySelectorAll('[role="radio"]');
    expect(radios[1]).toHaveAttribute('disabled');
  });

  it('applies className to RadioGroup', () => {
    const { container } = render(
      <RadioGroup className="custom-radio-group">
        <RadioGroupItem value="option1" id="option1" />
        <label htmlFor="option1">Option 1</label>
      </RadioGroup>
    );

    const radioGroup = container.querySelector('[role="radiogroup"]');
    expect(radioGroup).toHaveClass('custom-radio-group');
  });

  it('applies className to RadioGroupItem', () => {
    const { container } = render(
      <RadioGroup>
        <RadioGroupItem value="option1" id="option1" className="custom-item" />
        <label htmlFor="option1">Option 1</label>
      </RadioGroup>
    );

    const radio = container.querySelector('[role="radio"]');
    expect(radio).toHaveClass('custom-item');
  });
});
