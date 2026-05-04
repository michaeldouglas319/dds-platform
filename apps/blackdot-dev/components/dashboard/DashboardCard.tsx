/**
 * Dashboard Card Component
 *
 * Card container for dashboard content with optional icon and status indicators.
 * Supports different variants for various data display purposes.
 *
 * @category dashboard
 * @layer 2
 * @example
 * ```tsx
 * <DashboardCard
 *   title="Model Stats"
 *   value="1,234 vertices"
 *   icon={<CubeIcon />}
 *   trend="up"
 * />
 * ```
 */

'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface DashboardCardProps {
  title: string;
  value?: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  children?: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'destructive';
  className?: string;
}

const VariantStyles = {
  default: 'border-border',
  success: 'border-green-500/50 bg-green-50/50 dark:bg-green-950/20',
  warning: 'border-yellow-500/50 bg-yellow-50/50 dark:bg-yellow-950/20',
  destructive: 'border-red-500/50 bg-red-50/50 dark:bg-red-950/20'
};

export function DashboardCard({
  title,
  value,
  description,
  icon,
  trend,
  trendValue,
  children,
  variant = 'default',
  className
}: DashboardCardProps) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : null;

  return (
    <Card className={cn(VariantStyles[variant], className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            {description && (
              <CardDescription className="text-xs">{description}</CardDescription>
            )}
          </div>
          {icon && (
            <div className="text-2xl opacity-50">
              {icon}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-2">
        {value !== undefined && (
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold">{value}</span>
            {trend && TrendIcon && (
              <div className={cn(
                'flex items-center gap-1 text-xs font-medium',
                trend === 'up' ? 'text-green-600 dark:text-green-400' :
                trend === 'down' ? 'text-red-600 dark:text-red-400' :
                'text-muted-foreground'
              )}>
                <TrendIcon className="h-3 w-3" />
                {trendValue && <span>{trendValue}</span>}
              </div>
            )}
          </div>
        )}
        {children && (
          <div className="pt-2">
            {children}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
