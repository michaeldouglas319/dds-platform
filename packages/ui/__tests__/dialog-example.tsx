/**
 * Dialog Component Example with Token Integration
 *
 * Demonstrates how the Dialog component uses CSS tokens for styling,
 * enabling theme-aware rendering across light/dark modes.
 *
 * CSS tokens referenced:
 * - --color-background: Dialog background
 * - --color-foreground: Text color
 * - --color-muted-foreground: Hint text
 * - --color-neutral-950/50: Overlay color
 */

import React, { useState } from 'react';
import { Button } from '../components/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/dialog';

export function DialogExample() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default">Open Dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dialog with Token Integration</DialogTitle>
          <DialogDescription>
            This dialog uses CSS custom properties for styling, maintaining
            visual consistency with the unified token system.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            The overlay color (var(--color-background)) and text colors
            (var(--color-foreground), var(--color-muted-foreground)) are
            applied via Tailwind classes that reference CSS tokens.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant="default" onClick={() => setOpen(false)}>
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
