'use client';

import type { RendererProps } from '@dds/types';

export function TimelineRenderer({ section }: RendererProps) {
  const { subject, children } = section;

  const entries = children ?? [];

  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-3xl">
        {subject?.title && (
          <h2 className="mb-12 text-center text-3xl font-bold tracking-tight text-white">
            {subject.title}
          </h2>
        )}

        <div className="relative space-y-12 pl-8 before:absolute before:left-3 before:top-2 before:h-[calc(100%-1rem)] before:w-px before:bg-neutral-800">
          {entries.map((entry, i) => {
            const color = entry.subject?.color ?? '#6366f1';
            return (
              <div key={entry.id ?? i} className="relative">
                {/* Dot */}
                <div
                  className="absolute -left-8 top-1 h-6 w-6 rounded-full border-2 bg-neutral-950"
                  style={{
                    borderColor: color,
                    boxShadow: `0 0 8px ${color}50`,
                  }}
                >
                  <div
                    className="absolute inset-1 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                </div>

                {/* Card */}
                <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-5 backdrop-blur-sm">
                  {entry.subject?.category && (
                    <span className="mb-1 block text-xs font-semibold uppercase tracking-widest text-indigo-400">
                      {entry.subject.category}
                    </span>
                  )}
                  {entry.subject?.title && (
                    <h3 className="mb-1 text-lg font-semibold text-white">
                      {entry.subject.title}
                    </h3>
                  )}
                  {entry.subject?.subtitle && (
                    <p className="mb-2 text-sm text-neutral-400">
                      {entry.subject.subtitle}
                    </p>
                  )}
                  {entry.content?.body && (
                    <p className="text-sm leading-relaxed text-neutral-400">
                      {entry.content.body}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
