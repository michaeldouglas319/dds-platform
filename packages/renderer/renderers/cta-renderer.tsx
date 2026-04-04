'use client';

import type { RendererProps } from '@dds/types';
import { cn } from '../lib/utils';

export function CTARenderer({ section }: RendererProps) {
  const { subject, content, links } = section;
  const primaryLink = links?.primary;

  return (
    <section className="px-6 py-20">
      <div
        className={cn(
          'mx-auto max-w-3xl rounded-2xl border border-neutral-800 bg-gradient-to-br from-neutral-900 to-neutral-950 p-12 text-center',
          'shadow-2xl shadow-indigo-500/5',
        )}
      >
        {subject?.title && (
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-white">
            {subject.title}
          </h2>
        )}

        {(subject?.subtitle || content?.body) && (
          <p className="mx-auto mb-8 max-w-xl text-neutral-400">
            {subject?.subtitle ?? content?.body}
          </p>
        )}

        {primaryLink && (
          <a
            href={primaryLink.href}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:bg-indigo-500 hover:shadow-indigo-500/40"
          >
            {primaryLink.text}
            <span aria-hidden="true">&rarr;</span>
          </a>
        )}
      </div>
    </section>
  );
}
