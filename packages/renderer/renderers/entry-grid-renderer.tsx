'use client';

import { getCuneiformForDomain, AppChip } from '@dds/icons';
import type { RendererProps, UniversalSection } from '@dds/types';

type EntryCardItem = Pick<UniversalSection, 'id' | 'name' | 'subject' | 'links' | 'media'>;

export function EntryGridRenderer({ section }: RendererProps) {
  const { subject, content } = section;
  const items = (content?.items ?? []) as unknown as EntryCardItem[];

  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-6xl">
        {subject?.title && (
          <h2 className="mb-3 text-3xl font-bold tracking-tight text-white">
            {subject.title}
          </h2>
        )}
        {subject?.subtitle && (
          <p className="mb-10 text-neutral-400">{subject.subtitle}</p>
        )}

        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-neutral-800 p-12 text-center text-sm text-neutral-500">
            No entries yet.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => {
              const title = item.subject?.title ?? item.name ?? 'Untitled';
              const summary = item.subject?.summary ?? item.subject?.subtitle;
              const category = item.subject?.category;
              const href = item.links?.primary?.href ?? item.links?.url;
              const image = typeof item.media?.image === 'string' ? item.media?.image : item.media?.image?.src;

              // AppChip integration: extract domain for icon
              const domainForIcon = (item.name ?? href) as string | undefined;
              const cuneiformEntry = domainForIcon && typeof domainForIcon === 'string' ? getCuneiformForDomain(domainForIcon) : undefined;

              const card = (
                <div className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/50 p-5 transition-all hover:border-neutral-700 hover:bg-neutral-900">
                  {image && (
                    <div
                      className="mb-4 h-32 w-full rounded-lg bg-neutral-800"
                      style={{ backgroundImage: `url(${image})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                      aria-hidden
                    />
                  )}
                  <div className="mb-2 flex items-center gap-2">
                    {/* AppChip: Small cuneiform icon in grid */}
                    {cuneiformEntry && (
                      <div className="text-neutral-400" title={`${cuneiformEntry.name} — ${cuneiformEntry.meaning}`}>
                        <AppChip
                          entry={cuneiformEntry}
                          size={32}
                          flipDelay={1200 + Math.random() * 400}
                          flipDuration={500}
                          disableAutoFlip={false}
                        />
                      </div>
                    )}
                    {category && (
                      <span className="inline-block rounded-full bg-white/5 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-neutral-400">
                        {category}
                      </span>
                    )}
                  </div>
                  <h3 className="mb-2 text-base font-semibold text-white group-hover:text-white">
                    {title}
                  </h3>
                  {summary && (
                    <p className="text-sm leading-relaxed text-neutral-400">
                      {summary}
                    </p>
                  )}
                </div>
              );

              return href ? (
                <a key={item.id} href={href} className="block">
                  {card}
                </a>
              ) : (
                <div key={item.id}>{card}</div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
