'use client';

import type { RendererProps } from '@dds/types';

export function TwoColumnRenderer({ section }: RendererProps) {
  const { subject, content } = section;
  const highlights = content?.highlights ?? [];

  // Split highlights into two columns
  const mid = Math.ceil(highlights.length / 2);
  const left = highlights.slice(0, mid);
  const right = highlights.slice(mid);

  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-5xl">
        {subject?.title && (
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-white">
            {subject.title}
          </h2>
        )}
        {subject?.subtitle && (
          <p className="mb-12 text-lg text-neutral-400">{subject.subtitle}</p>
        )}

        <div className="grid gap-8 sm:grid-cols-2">
          {[left, right].map((col, colIdx) => (
            <div key={colIdx} className="space-y-6">
              {col.map((h, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-5 backdrop-blur-sm"
                >
                  {h.subtitle && (
                    <h3 className="mb-2 text-base font-semibold text-neutral-200">
                      {h.subtitle}
                    </h3>
                  )}
                  {h.description && (
                    <p className="text-sm leading-relaxed text-neutral-400">
                      {h.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
