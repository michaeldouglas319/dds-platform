import { notFound } from 'next/navigation';
import { SectionBatchRenderer } from '@dds/renderer';
import { fetchEntryBySlug, fetchEventsByTag } from '../../../lib/entries';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

export async function generateMetadata({ params }) {
  const entry = await fetchEntryBySlug(params.slug);
  if (!entry) return { title: 'Entry not found · ageofabundance.wiki' };
  const title = entry.subject?.title ?? entry.name ?? params.slug;
  return {
    title: `${title} · ageofabundance.wiki`,
    description: entry.subject?.summary ?? entry.subject?.subtitle ?? undefined,
  };
}

export default async function EntryPage({ params }) {
  const entry = await fetchEntryBySlug(params.slug);
  if (!entry) notFound();

  const events = entry.tag ? await fetchEventsByTag(entry.tag, 12) : [];

  const hero = {
    id: `${entry.id}-hero`,
    type: 'hero',
    name: 'hero',
    subject: {
      title: entry.subject?.title ?? entry.name ?? params.slug,
      subtitle: entry.subject?.subtitle,
      summary: entry.subject?.summary,
      category: entry.subject?.category,
    },
    content: { body: entry.content?.body },
    display: { layout: 'hero' },
  };

  const body = {
    ...entry,
    display: { ...(entry.display ?? {}), layout: entry.display?.layout ?? 'section' },
  };

  const eventsSection =
    events.length > 0
      ? {
          id: `${entry.id}-events`,
          type: 'section',
          name: 'linked-events',
          subject: {
            title: 'Linked signals',
            subtitle: `Events tagged ${entry.tag} from the globe feed`,
          },
          content: {
            items: events.map((ev) => ({
              id: `event-${ev.id}`,
              name: ev.name,
              subject: {
                title: ev.name,
                subtitle: ev.date ? new Date(ev.date).toLocaleDateString() : undefined,
                category: ev.tag ?? undefined,
                summary: `${ev.lat.toFixed(2)}°, ${ev.lon.toFixed(2)}° · weight ${ev.weight.toLocaleString()}`,
              },
              links: ev.url ? { primary: { text: 'Source', href: ev.url }, url: ev.url } : undefined,
            })),
          },
          display: { layout: 'entry-grid' },
        }
      : null;

  const sections = [hero, body, ...(eventsSection ? [eventsSection] : [])];
  return (
    <main id="main-content">
      <SectionBatchRenderer sections={sections} />
    </main>
  );
}
