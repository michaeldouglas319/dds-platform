'use client';

import { ReactNode } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface Stat {
  icon: ReactNode;
  label: string;
}

interface PitchDeckHeroProps {
  title: string;
  subtitle: string;
  description?: string;
  avatarSrc?: string;
  avatarFallback?: ReactNode;
  avatarSize?: 'sm' | 'md' | 'lg' | 'xl';
  stats: Stat[];
  additionalContent?: ReactNode;
  className?: string;
}

/**
 * Hero section component for pitch deck presentations
 * Displays avatar, title, subtitle, stats, and optional custom content
 */
export function PitchDeckHero({
  title,
  subtitle,
  description,
  avatarSrc,
  avatarFallback,
  avatarSize = 'md',
  stats,
  additionalContent,
  className = '',
}: PitchDeckHeroProps) {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48',
    xl: 'w-48 h-48 md:w-56 md:h-56 lg:w-64 lg:h-64',
  };

  return (
    <div className={`bg-background/90 backdrop-blur-lg border border-border rounded-lg p-8 shadow-xl max-w-2xl mx-auto lg:mx-0 ${className}`}>
      <div className="flex items-center gap-6 mb-6">
        <Avatar className={`${sizeClasses[avatarSize]} border-4 border-primary/20 shadow-2xl`}>
          {avatarSrc && <AvatarImage src={avatarSrc} alt={title} className="object-cover" />}
          {avatarFallback && <AvatarFallback className="text-3xl font-bold bg-primary/10 text-primary">{avatarFallback}</AvatarFallback>}
        </Avatar>
        <div className="flex-1">
          <h1 className="text-4xl font-black tracking-tight mb-2">{title}</h1>
          <p className="text-xl font-semibold text-foreground/90 mb-4">{subtitle}</p>
          {stats && stats.length > 0 && (
            <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-foreground/80">
              {stats.map((stat, index) => (
                <div key={index} className="flex items-center gap-2">
                  {stat.icon}
                  <span>{stat.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {description && (
        <p className="text-base text-foreground/80 leading-relaxed mb-6">{description}</p>
      )}

      {additionalContent}
    </div>
  );
}
