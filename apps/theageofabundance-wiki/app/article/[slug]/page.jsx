import { notFound } from 'next/navigation';
import { SectionBatchRenderer } from '@dds/renderer';
import { getArticle, listArticleSlugs } from '../../../content/articles/index.js';

/**
 * Static-generate every known article slug at build time. New articles drop
 * into `content/articles/index.js` and are picked up automatically — no
 * per-slug build config, no runtime routing.
 */
export function generateStaticParams() {
  return listArticleSlugs().map((slug) => ({ slug }));
}

/**
 * Per-article <head> metadata. Falls back gracefully when the slug is unknown
 * so the 404 path still has a sensible title.
 */
export function generateMetadata({ params }) {
  const article = getArticle(params.slug);
  if (!article) {
    return {
      title: 'Article not found — theageofabundance.wiki',
      description: 'The page you requested does not exist on this wiki.',
    };
  }
  const title = article.subject?.title ?? params.slug;
  const summary =
    article.subject?.summary ??
    article.subject?.description ??
    'An article on theageofabundance.wiki';
  return {
    title: `${title} — theageofabundance.wiki`,
    description: summary,
  };
}

export default function ArticlePage({ params }) {
  const article = getArticle(params.slug);
  if (!article) {
    notFound();
  }

  return (
    <main>
      <SectionBatchRenderer sections={[article]} />
    </main>
  );
}
