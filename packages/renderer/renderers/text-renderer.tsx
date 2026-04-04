'use client';

import type { RendererProps } from '@dds/types';
import { cn } from '../lib/utils';

export function TextRenderer({ section }: RendererProps) {
  const { subject, content, display } = section;
  const title = subject?.title;
  const subtitle = subject?.subtitle;
  const body = content?.body;
  const paragraphs = content?.paragraphs;
  const align = display?.textAlign ?? 'start';

  return (
    <section className="px-6 py-20">
      <div
        className={cn(
          'mx-auto max-w-3xl',
          align === 'center' && 'text-center',
          align === 'end' && 'text-right',
        )}
      >
        {subject?.category && (
          <span className="mb-3 inline-block text-xs font-semibold uppercase tracking-widest text-indigo-400">
            {subject.category}
          </span>
        )}

        {title && (
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {title}
          </h2>
        )}

        {subtitle && (
          <p className="mb-4 text-lg font-medium text-neutral-300">{subtitle}</p>
        )}

        {body && (
          <p className="mb-6 leading-relaxed text-neutral-400">{body}</p>
        )}

        {paragraphs && paragraphs.length > 0 && (
          <div className="space-y-6">
            {paragraphs.map((p, i) => (
              <div key={i}>
                {p.subtitle && (
                  <h3 className="mb-2 text-lg font-semibold text-neutral-200">
                    {p.subtitle}
                  </h3>
                )}
                {p.description && (
                  <p className="leading-relaxed text-neutral-400">{p.description}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
