import { notFound } from 'next/navigation';
import {
  findArticleBySlug,
  listArticleSlugs,
} from '../../../content/articles.js';
import { WikiArticle } from '../../../components/wiki-article.jsx';

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
  const description =
    article.meta?.wiki?.summary ??
    article.subject?.subtitle ??
    article.subject?.summary ??
    'An article in the Age of Abundance wiki.';
  return {
    title,
    description,
    openGraph: {
      title,
      description,
    },
  };
}

export default function ArticlePage({ params }) {
  const article = findArticleBySlug(params.slug);
  if (!article) {
    notFound();
  }

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
    </main>
  );
}
