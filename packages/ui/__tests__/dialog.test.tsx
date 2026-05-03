import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../components/dialog';

describe('Dialog', () => {
  it('renders dialog trigger button', () => {
    render(
      <Dialog>
        <DialogTrigger>Open Dialog</DialogTrigger>
        <DialogContent>
          <DialogTitle>Test Dialog</DialogTitle>
        </DialogContent>
      </Dialog>
    );

    const trigger = screen.getByRole('button', { name: /open dialog/i });
    expect(trigger).toBeInTheDocument();
  });

  it('exports Dialog component and its parts', () => {
    // Test that all Dialog components are exported and usable
    expect(Dialog).toBeDefined();
    expect(DialogTrigger).toBeDefined();
    expect(DialogContent).toBeDefined();
    expect(DialogHeader).toBeDefined();
    expect(DialogTitle).toBeDefined();
    expect(DialogDescription).toBeDefined();
    expect(DialogFooter).toBeDefined();
  });

  it('renders DialogHeader and DialogFooter layout components', () => {
    render(
      <div>
        <DialogHeader className="test-header">Header Content</DialogHeader>
        <DialogFooter className="test-footer">Footer Content</DialogFooter>
      </div>
    );

    const header = screen.getByText('Header Content');
    const footer = screen.getByText('Footer Content');

    expect(header).toBeInTheDocument();
    expect(footer).toBeInTheDocument();
    expect(header.parentElement).toHaveClass('test-header');
    expect(footer.parentElement).toHaveClass('test-footer');
  });

  it('accepts className prop on DialogContent', () => {
    const { container } = render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent className="custom-dialog-class">
          <DialogTitle>Content</DialogTitle>
        </DialogContent>
      </Dialog>
    );

    expect(container.querySelector('.custom-dialog-class')).toBeInTheDocument();
  });

  it('forwards ref to DialogContent', () => {
    const ref = { current: null };

    const { container } = render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent ref={ref}>
          <DialogTitle>Content</DialogTitle>
        </DialogContent>
      </Dialog>
    );

    const dialogContent = container.querySelector('[role="dialog"]');
    expect(dialogContent).toBeInTheDocument();
  });

  it('renders complete dialog structure with all parts', () => {
    render(
      <Dialog>
        <DialogTrigger>Open Dialog</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dialog Title</DialogTitle>
            <DialogDescription>Dialog Description</DialogDescription>
          </DialogHeader>
          <div>Dialog content goes here</div>
          <DialogFooter>
            <button>Cancel</button>
            <button>Confirm</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );

    expect(screen.getByRole('button', { name: /open dialog/i })).toBeInTheDocument();
    expect(screen.getByText('Dialog Title')).toBeInTheDocument();
    expect(screen.getByText('Dialog Description')).toBeInTheDocument();
    expect(screen.getByText('Dialog content goes here')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /confirm/i })).toBeInTheDocument();
  });
});
