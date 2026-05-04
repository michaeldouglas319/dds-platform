'use client';

import { ReactNode, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useMobileDetection } from '@/hooks';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ControlPanelProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  className?: string;
}

/**
 * Configuration control panel wrapper
 * Provides header, scrollable content area, and mobile collapse behavior
 *
 * @category layout
 * @layer 3
 */
export function ControlPanel({
  children,
  title = 'Configuration',
  subtitle,
  actions,
  collapsible = true,
  defaultCollapsed = false,
  className,
}: ControlPanelProps) {
  const isMobile = useMobileDetection(1024);
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed && isMobile);

  const shouldCollapsible = collapsible && isMobile;

  return (
    <div
      className={cn(
        'w-full h-full flex flex-col bg-card border-l border-border overflow-hidden',
        className
      )}
    >
      {/* Header */}
      <div className="shrink-0 border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="px-4 py-4 space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              {title && (
                <h2 className="text-lg font-semibold text-foreground">
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="text-xs text-muted-foreground mt-1">
                  {subtitle}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              {actions && <div className="flex items-center gap-2">{actions}</div>}

              {shouldCollapsible && (
                <button
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  className="p-1.5 hover:bg-accent rounded-md transition-colors"
                  aria-label={isCollapsed ? 'Expand' : 'Collapse'}
                >
                  <ChevronDown
                    className={cn(
                      'w-5 h-5 text-muted-foreground transition-transform',
                      isCollapsed && 'transform -rotate-90'
                    )}
                  />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content - with optional collapse animation on mobile */}
      <AnimatePresence mode="wait">
        {!isCollapsed && (
          <motion.div
            initial={
              shouldCollapsible ? { height: 0, opacity: 0 } : undefined
            }
            animate={
              shouldCollapsible ? { height: 'auto', opacity: 1 } : undefined
            }
            exit={shouldCollapsible ? { height: 0, opacity: 0 } : undefined}
            transition={{ duration: 0.2 }}
            className="flex-1 overflow-hidden"
          >
            <ScrollArea className="w-full h-full">
              <div className="p-4">{children}</div>
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collapsed state indicator */}
      {shouldCollapsible && isCollapsed && (
        <div className="flex-1 flex items-center justify-center text-xs text-muted-foreground px-4 text-center">
          <p>Expand to configure</p>
        </div>
      )}
    </div>
  );
}
