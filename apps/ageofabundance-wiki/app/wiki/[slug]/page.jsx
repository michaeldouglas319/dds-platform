import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  buildTableOfContents,
  getArticle,
  listArticleSlugs,
} from '../../lib/articles';
import { WikiArticleRenderer } from '../../components/WikiArticleRenderer';
import { WikiTableOfContents } from '../../components/WikiTableOfContents';

export function generateStaticParams() {
  return listArticleSlugs().map((slug) => ({ slug }));
}

export function generateMetadata({ params }) {
  const article = getArticle(params.slug);
  if (!article) {
    return {
      title: 'Article not found — ageofabundance.wiki',
      description: 'The requested wiki article could not be found.',
    };
  }
  return {
    title: `${article.title} — ageofabundance.wiki`,
    description: article.summary,
  };
}

export default function WikiArticlePage({ params }) {
  const article = getArticle(params.slug);
  if (!article) {
    notFound();
  }

  const toc = buildTableOfContents(article);
  const infoboxSections = article.infobox ? [article.infobox] : [];

  return (
    <main className="wiki-shell" data-testid="wiki-article">
      <a className="wiki-skip-link" href="#wiki-article-body">
        Skip to article body
      </a>
      <header className="wiki-header">
        <nav className="wiki-breadcrumbs" aria-label="Breadcrumb">
          <ol>
            <li>
              <Link href="/">ageofabundance.wiki</Link>
            </li>
            <li aria-current="page">{article.title}</li>
          </ol>
        </nav>
        <p className="wiki-category" data-testid="wiki-article-category">
          {article.category}
        </p>
        <h1 className="wiki-title" data-testid="wiki-article-title">
          {article.title}
        </h1>
        <p className="wiki-summary" data-testid="wiki-article-summary">
          {article.summary}
        </p>
        <p className="wiki-updated">
          Last updated <time dateTime={article.updated}>{article.updated}</time>
        </p>
      </header>

      <div className="wiki-grid">
        <div className="wiki-aside">
          {infoboxSections.length > 0 && (
            <WikiArticleRenderer sections={infoboxSections} />
          )}
          <WikiTableOfContents entries={toc} />
        </div>

        <article
          id="wiki-article-body"
          className="wiki-article"
          aria-labelledby="wiki-article-title-heading"
          data-testid="wiki-article-body"
        >
          <h2 id="wiki-article-title-heading" className="wiki-visually-hidden">
            {article.title} — article body
          </h2>
          <WikiArticleRenderer sections={article.sections} />
        </article>
      </div>

      <footer className="wiki-footer">
        <Link className="wiki-footer__link" href="/">
          ← Back to wiki home
        </Link>
      </footer>
    </main>
  );
}
