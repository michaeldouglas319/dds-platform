import { SectionBatchRenderer } from '@dds/renderer';
import { fetchEntries, fetchFeaturedEntry } from '../../lib/entries';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

export const metadata = {
  title: 'Entries · ageofabundance.wiki',
  description: 'Featured and all entries — live from the knowledge table.',
};

export default async function EntriesIndexPage() {
  const [featured, entries] = await Promise.all([
    fetchFeaturedEntry(),
    fetchEntries({ type: 'entry' }),
  ]);

  const highlight = featured
    ? [
        {
          ...featured,
          display: { ...(featured.display ?? {}), layout: 'entry-highlight' },
        },
      ]
    : [];

  const gridSection = {
    id: 'entries-grid',
    type: 'section',
    name: 'entries-grid',
    subject: {
      title: 'All entries',
      subtitle:
        entries.length > 0
          ? `${entries.length} active entr${entries.length === 1 ? 'y' : 'ies'} in the knowledge table`
          : 'Runner has not populated the knowledge table yet.',
    },
    content: {
      items: entries.map((e) => ({
        id: e.id,
        name: e.name,
        subject: e.subject,
        links: e.slug
          ? { primary: { text: 'Read', href: `/e/${e.slug}` }, url: `/e/${e.slug}` }
          : e.links,
        media: e.media,
      })),
    },
    display: { layout: 'entry-grid' },
  };

  return (
    <main id="main-content">
      <SectionBatchRenderer sections={[...highlight, gridSection]} />
    </main>
  );
}
