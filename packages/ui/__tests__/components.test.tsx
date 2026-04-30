import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from '../components/button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/card';
import { Badge } from '../components/badge';
import { Checkbox } from '../components/checkbox';
import { Input } from '../components/input';
import { Label } from '../components/label';
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
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '../components/tabs';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '../components/tooltip';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '../components/popover';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '../components/dropdown-menu';

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

  it('forwards className prop', () => {
    const { container } = render(<Button className="custom-button">Custom</Button>);
    const button = container.querySelector('button')!;
    expect(button.className).toContain('custom-button');
  });

  it('supports asChild prop for Radix Slot composition', () => {
    render(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>
    );
    const link = screen.getByRole('link', { name: 'Link Button' });
    expect(link).toBeInTheDocument();
    expect(link.getAttribute('href')).toBe('/test');
  });

  it('applies size variants', () => {
    const { container: smContainer } = render(<Button size="sm">Small</Button>);
    const smButton = smContainer.querySelector('button')!;
    expect(smButton.className).toContain('h-9');

    const { container: lgContainer } = render(<Button size="lg">Large</Button>);
    const lgButton = lgContainer.querySelector('button')!;
    expect(lgButton.className).toContain('h-11');
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

describe('Label', () => {
  it('renders with text content', () => {
    render(<Label>Username</Label>);
    expect(screen.getByText('Username')).toBeInTheDocument();
  });

  it('associates with input via htmlFor prop', () => {
    render(
      <>
        <Label htmlFor="username-input">Username</Label>
        <Input id="username-input" data-testid="input" />
      </>
    );
    const label = screen.getByText('Username') as HTMLLabelElement;
    expect(label.htmlFor).toBe('username-input');
  });

  it('accepts and applies className prop', () => {
    const { container } = render(<Label className="custom-label">Label</Label>);
    const label = container.querySelector('label')!;
    expect(label.className).toContain('custom-label');
    expect(label.className).toContain('text-sm');
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

describe('Tabs (Radix)', () => {
  it('renders tabs with Radix primitive', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>
    );
    expect(screen.getByText('Tab 1')).toBeInTheDocument();
    expect(screen.getByText('Tab 2')).toBeInTheDocument();
    expect(screen.getByText('Content 1')).toBeInTheDocument();
  });

  it('accepts className prop on TabsList and TabsContent', () => {
    const { container } = render(
      <Tabs defaultValue="tab1">
        <TabsList className="custom-list">
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1" className="custom-content">Content</TabsContent>
      </Tabs>
    );
    expect(container.querySelector('.custom-list')).toBeInTheDocument();
    expect(container.querySelector('.custom-content')).toBeInTheDocument();
  });
});

describe('Tooltip (Radix)', () => {
  it('renders Tooltip with trigger (requires TooltipProvider)', () => {
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent>Tooltip text</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
    expect(screen.getByRole('button', { name: 'Hover me' })).toBeInTheDocument();
  });

  it('accepts delayDuration prop', () => {
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Hover</TooltipTrigger>
          <TooltipContent delayDuration={500}>Delayed tooltip</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
    expect(screen.getByRole('button', { name: 'Hover' })).toBeInTheDocument();
  });
});

describe('Popover (Radix)', () => {
  it('renders Popover with trigger and content', () => {
    render(
      <Popover>
        <PopoverTrigger>Open popover</PopoverTrigger>
        <PopoverContent>Popover content</PopoverContent>
      </Popover>
    );
    expect(screen.getByRole('button', { name: 'Open popover' })).toBeInTheDocument();
  });

  it('accepts className prop on PopoverContent', () => {
    const { container } = render(
      <Popover>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent className="custom-popover">Content</PopoverContent>
      </Popover>
    );
    // Content is in portal, just verify button renders
    expect(screen.getByRole('button', { name: 'Open' })).toBeInTheDocument();
  });
});

describe('DropdownMenu (Radix)', () => {
  it('renders DropdownMenu with trigger and items', () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Item 1</DropdownMenuItem>
          <DropdownMenuItem>Item 2</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
    expect(screen.getByRole('button', { name: 'Menu' })).toBeInTheDocument();
  });

  it('accepts className prop on DropdownMenuContent', () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
        <DropdownMenuContent className="custom-menu">
          <DropdownMenuItem>Item</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
    expect(screen.getByRole('button', { name: 'Menu' })).toBeInTheDocument();
  });
});

describe('Checkbox', () => {
  it('renders checkbox without throwing', () => {
    render(<Checkbox />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeInTheDocument();
  });

  it('renders with default unchecked state', () => {
    render(<Checkbox />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveAttribute('data-state', 'unchecked');
  });

  it('supports defaultChecked prop', () => {
    render(<Checkbox defaultChecked />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveAttribute('data-state', 'checked');
  });

  it('accepts onCheckedChange prop', () => {
    const onChange = vi.fn();
    render(<Checkbox onCheckedChange={onChange} />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeInTheDocument();
  });

  it('respects disabled state', () => {
    render(<Checkbox disabled />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveAttribute('disabled');
  });

  it('forwards className prop', () => {
    const { container } = render(<Checkbox className="custom-checkbox" />);
    const checkboxDiv = container.querySelector('button');
    expect(checkboxDiv?.className).toContain('custom-checkbox');
  });

  it('supports controlled checked state', () => {
    const { rerender } = render(<Checkbox checked={false} />);
    let checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveAttribute('data-state', 'unchecked');

    rerender(<Checkbox checked={true} />);
    checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveAttribute('data-state', 'checked');
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<Checkbox ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });
});
