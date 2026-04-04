'use client';

import type { RendererProps } from '@dds/types';
import { cn } from '../lib/utils';

export function SectorsGridRenderer({ section }: RendererProps) {
  const { subject, content } = section;
  const items = content?.items ?? [];

  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-5xl">
        {subject?.title && (
          <h2 className="mb-4 text-center text-3xl font-bold tracking-tight text-white">
            {subject.title}
          </h2>
        )}
        {subject?.subtitle && (
          <p className="mb-12 text-center text-neutral-400">{subject.subtitle}</p>
        )}

        <div
          className={cn(
            'grid gap-4',
            items.length <= 3 && 'grid-cols-1 sm:grid-cols-3',
            items.length === 4 && 'grid-cols-2 sm:grid-cols-4',
            items.length > 4 && 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
          )}
        >
          {items.map((item, i) => (
            <div
              key={i}
              className="group relative overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/50 p-6 text-center backdrop-blur-sm transition-all hover:border-indigo-500/40 hover:bg-neutral-800/60"
            >
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-indigo-500/0 to-indigo-500/5 opacity-0 transition-opacity group-hover:opacity-100" />
              <span className="relative text-sm font-medium text-neutral-300 group-hover:text-white">
                {item}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
