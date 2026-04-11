import { notFound } from 'next/navigation';
import {
  findArticleBySlug,
  listArticleSlugs,
} from '../../../content/articles.js';
import { WikiArticle } from '../../../components/wiki-article.jsx';
import { deriveWikiMeta } from '../../../content/wiki-meta.js';

export const dynamicParams = false;

export function generateStaticParams() {
  return listArticleSlugs().map((slug) => ({ slug }));
}

export function generateMetadata({ params }) {
  const article = findArticleBySlug(params.slug);
  if (!article) {
    return {
      title: 'Not found — ageofabundance.wiki',
      description: 'This article could not be found.',
    };
  }
  const title = article.subject?.title
    ? `${article.subject.title} — ageofabundance.wiki`
    : 'ageofabundance.wiki';
  const meta = deriveWikiMeta(article);
  const description =
    meta.summary ?? 'An article in the Age of Abundance wiki.';
  return {
    title,
    description,
    openGraph: {
      title,
      description,
    },
  };
}

/**
 * Emit Schema.org Article JSON-LD derived from meta.wiki. Feeds search
 * engines and AI crawlers from the same single source of truth that
 * powers the on-page header. No client JS; pure server render.
 */
function buildArticleJsonLd(article, meta) {
  /** @type {Record<string, unknown>} */
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.subject?.title,
    description: meta.summary ?? undefined,
    inLanguage: 'en',
    isPartOf: {
      '@type': 'WebSite',
      name: 'ageofabundance.wiki',
    },
  };
  if (meta.lastUpdatedISO) {
    data.dateModified = meta.lastUpdatedISO;
    data.datePublished = meta.lastUpdatedISO;
  }
  if (meta.authors.length > 0) {
    data.author = meta.authors.map((name) => ({ '@type': 'Person', name }));
  }
  if (meta.wordCount > 0) {
    data.wordCount = meta.wordCount;
  }
  if (meta.tags.length > 0) {
    data.keywords = meta.tags.join(', ');
  }
  return data;
}

export default function ArticlePage({ params }) {
  const article = findArticleBySlug(params.slug);
  if (!article) {
    notFound();
  }

  const meta = deriveWikiMeta(article);
  const jsonLd = buildArticleJsonLd(article, meta);

  return (
    <main id="main-content" className="wiki-article-page">
      <nav className="wiki-breadcrumb" aria-label="Breadcrumb">
        <ol className="wiki-breadcrumb__list">
          <li>
            <a href="/">ageofabundance.wiki</a>
          </li>
          <li aria-current="page">{article.subject?.title}</li>
        </ol>
      </nav>
      <WikiArticle article={article} />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger -- trusted, server-rendered JSON-LD
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </main>
  );
}
