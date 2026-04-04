'use client';

import type { RendererProps } from '@dds/types';
import { cn } from '../lib/utils';

export function StatsRenderer({ section }: RendererProps) {
  const { subject, content } = section;
  const stats = content?.stats ?? [];

  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-5xl">
        {subject?.title && (
          <h2 className="mb-12 text-center text-3xl font-bold tracking-tight text-white">
            {subject.title}
          </h2>
        )}

        <div
          className={cn(
            'grid gap-6',
            stats.length <= 2 && 'grid-cols-1 sm:grid-cols-2',
            stats.length === 3 && 'grid-cols-1 sm:grid-cols-3',
            stats.length >= 4 && 'grid-cols-2 sm:grid-cols-4',
          )}
        >
          {stats.map((stat, i) => (
            <div
              key={i}
              className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-6 text-center backdrop-blur-sm transition-colors hover:border-neutral-700"
            >
              <div className="mb-2 text-3xl font-bold text-white sm:text-4xl">
                {stat.value}
              </div>
              <div className="text-sm font-medium text-neutral-400">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
