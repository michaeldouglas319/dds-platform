'use client';

import { getCuneiformForDomain, AppChip } from '@dds/icons';
import type { RendererProps } from '@dds/types';
import { cn } from '../lib/utils';

export function HeroRenderer({ section }: RendererProps) {
  const { subject, content, links, display, meta, name } = section;
  const title = subject?.title;
  const subtitle = subject?.subtitle;
  const body = content?.body;
  const highlights = content?.highlights;
  const primaryLink = links?.primary;

  // AppChip integration: extract domain for icon display
  const domainForIcon = (meta?.domain ?? name ?? primaryLink?.href) as string | undefined;
  const cuneiformEntry = domainForIcon && typeof domainForIcon === 'string' ? getCuneiformForDomain(domainForIcon) : undefined;

  return (
    <section
      className={cn(
        'relative flex min-h-[80vh] flex-col items-center justify-center px-6 py-24 text-center',
        'bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950',
      )}
    >
      {/* Decorative glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/3 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl">
        <div className="mb-4 flex items-center justify-center gap-3">
          {/* AppChip: Large cuneiform icon in hero */}
          {cuneiformEntry && (
            <div className="text-indigo-400" title={`${cuneiformEntry.name} — ${cuneiformEntry.meaning}`}>
              <AppChip
                entry={cuneiformEntry}
                size={64}
                flipDelay={1600}
                flipDuration={700}
              />
            </div>
          )}
          {subject?.category && (
            <span className="inline-block rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-indigo-400">
              {subject.category}
            </span>
          )}
        </div>

        {title && (
          <h1 className="mb-6 bg-gradient-to-r from-white via-neutral-200 to-neutral-400 bg-clip-text text-5xl font-bold leading-tight tracking-tight text-transparent sm:text-6xl lg:text-7xl">
            {title}
          </h1>
        )}

        {subtitle && (
          <p className="mb-4 text-xl font-medium text-neutral-300 sm:text-2xl">
            {subtitle}
          </p>
        )}

        {body && (
          <p className="mx-auto mb-8 max-w-2xl text-base leading-relaxed text-neutral-400 sm:text-lg">
            {body}
          </p>
        )}

        {/* Highlight badges */}
        {highlights && highlights.length > 0 && (
          <div className="mb-10 flex flex-wrap justify-center gap-3">
            {highlights.map((h, i) => {
              // Handle both string highlights and Highlight objects
              const isString = typeof h === 'string';
              return (
                <span
                  key={i}
                  className="rounded-lg border border-neutral-700 bg-neutral-800/60 px-4 py-2 text-sm text-neutral-300"
                >
                  {isString ? (
                    <span className="font-semibold text-white">{h}</span>
                  ) : (
                    <>
                      {h.subtitle && <span className="font-semibold text-white">{h.subtitle}</span>}
                      {h.subtitle && h.description && ' — '}
                      {h.description}
                    </>
                  )}
                </span>
              );
            })}
          </div>
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
