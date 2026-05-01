'use client';

import * as React from 'react';
import { cn } from '../lib/utils';

/**
 * A styled textarea element for multiline text input.
 *
 * @example
 * <Textarea placeholder="Enter your message..." />
 * <Textarea defaultValue="Some text..." disabled />
 * <Textarea className="min-h-[200px]" rows={10} />
 */
export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      className={cn(
        'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      ref={ref}
      {...props}
    />
  )
);
Textarea.displayName = 'Textarea';

export { Textarea };
