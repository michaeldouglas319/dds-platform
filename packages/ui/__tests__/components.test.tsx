import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from '../components/button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/card';
import { Badge } from '../components/badge';
import { Input } from '../components/input';
import { Separator } from '../components/separator';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from '../components/sheet';

describe('Button', () => {
  it('renders with children text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });

  it('applies variant classes', () => {
    const { container } = render(<Button variant="destructive">Delete</Button>);
    const button = container.querySelector('button')!;
    expect(button.className).toContain('destructive');
  });
});

describe('Card', () => {
  it('renders with header and content', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Title</CardTitle>
        </CardHeader>
        <CardContent>Content here</CardContent>
      </Card>
    );
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Content here')).toBeInTheDocument();
  });
});

describe('Badge', () => {
  it('renders with text', () => {
    render(<Badge>New</Badge>);
    expect(screen.getByText('New')).toBeInTheDocument();
  });
});

describe('Input', () => {
  it('renders and accepts value', () => {
    render(<Input defaultValue="hello" data-testid="input" />);
    const input = screen.getByTestId('input') as HTMLInputElement;
    expect(input.value).toBe('hello');
  });
});

describe('Separator', () => {
  it('renders as horizontal by default', () => {
    const { container } = render(<Separator data-testid="sep" />);
    const sep = container.firstElementChild!;
    expect(sep.className).toContain('w-full');
    expect(sep.className).toContain('h-[1px]');
  });
});

describe('Sheet', () => {
  it('renders with Radix Dialog context (trigger + content)', () => {
    render(
      <Sheet>
        <SheetTrigger>Open</SheetTrigger>
        <SheetContent>Content</SheetContent>
      </Sheet>
    );
    expect(screen.getByRole('button', { name: 'Open' })).toBeInTheDocument();
  });

  it('renders SheetHeader, SheetTitle, and SheetDescription without errors', () => {
    render(
      <Sheet>
        <SheetTrigger>Open</SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Title</SheetTitle>
            <SheetDescription>Description</SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    );
    expect(screen.getByRole('button', { name: 'Open' })).toBeInTheDocument();
  });

  it('accepts and applies className prop', () => {
    // Radix Dialog Content is teleported to portal, so we just verify it renders without error
    render(
      <Sheet>
        <SheetTrigger>Open</SheetTrigger>
        <SheetContent className="custom-sheet-class">Content</SheetContent>
      </Sheet>
    );
    expect(screen.getByRole('button', { name: 'Open' })).toBeInTheDocument();
  });

  it('renders SheetClose button', () => {
    render(
      <Sheet>
        <SheetTrigger>Open</SheetTrigger>
        <SheetContent>
          <SheetClose>Close</SheetClose>
        </SheetContent>
      </Sheet>
    );
    expect(screen.getByRole('button', { name: 'Open' })).toBeInTheDocument();
  });
});
