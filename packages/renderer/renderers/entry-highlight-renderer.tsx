'use client';

import { getCuneiformForDomain } from '@dds/icons';
import { AppChip } from '@dds/icons';
import type { RendererProps } from '@dds/types';

export function EntryHighlightRenderer({ section }: RendererProps) {
  const { subject, content, links, media, meta } = section;
  const title = subject?.title ?? section.name ?? 'Untitled';
  const summary = subject?.summary ?? content?.body ?? subject?.subtitle;
  const category = subject?.category;
  const href = links?.primary?.href ?? links?.url;
  const image = typeof media?.image === 'string' ? media?.image : media?.image?.src;

  // AppChip integration: extract domain from URL or use vertical name
  const domainForIcon = meta?.domain ?? links?.primary?.domain ?? section.name;
  const cuneiformEntry = domainForIcon ? getCuneiformForDomain(domainForIcon) : undefined;

  return (
    <section className="px-6 py-12">
      <div className="mx-auto max-w-4xl">
        <article className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-gradient-to-br from-neutral-900 to-neutral-950 shadow-2xl">
          {image && (
            <div
              className="absolute inset-0 opacity-20"
              style={{ backgroundImage: `url(${image})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
              aria-hidden
            />
          )}
          <div className="relative p-8 sm:p-12">
            <div className="mb-4 flex items-center gap-3">
              {/* AppChip: Cuneiform icon with flip-to-badge animation */}
              {cuneiformEntry && (
                <div className="text-red-400" title={`${cuneiformEntry.name} — ${cuneiformEntry.meaning}`}>
                  <AppChip
                    entry={cuneiformEntry}
                    size={48}
                    flipDelay={2000}
                    flipDuration={600}
                  />
                </div>
              )}
              <span className="inline-block rounded-full bg-red-500/15 px-3 py-1 text-xs font-medium uppercase tracking-wider text-red-300">
                Featured
              </span>
              {category && (
                <span className="inline-block rounded-full bg-white/5 px-3 py-1 text-xs font-medium uppercase tracking-wider text-neutral-400">
                  {category}
                </span>
              )}
            </div>

            <h2 className="mb-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {title}
            </h2>

            {subject?.subtitle && (
              <p className="mb-6 text-lg text-neutral-300">{subject.subtitle}</p>
            )}

            {summary && summary !== subject?.subtitle && (
              <p className="mb-8 text-neutral-400 leading-relaxed">{summary}</p>
            )}

            {href && (
              <a
                href={href}
                className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-white/20"
              >
                {links?.primary?.text ?? 'Read more'}
                <span aria-hidden>→</span>
              </a>
            )}
          </div>
        </article>
      </div>
    </section>
  );
}
