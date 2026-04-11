import { notFound } from 'next/navigation';
import Link from 'next/link';
import { SectionBatchRenderer } from '@dds/renderer';
import {
  buildTableOfContents,
  getArticle,
  listArticles,
  listSlugs,
} from '../../../lib/articles.js';
import { ArticleToc } from './article-toc.jsx';

// Pre-render every known slug at build time. Unknown slugs fall through to
// `notFound()` below, which renders the route segment's `not-found.jsx`.
export function generateStaticParams() {
  return listSlugs().map((slug) => ({ slug }));
}

/**
 * @param {{ params: { slug: string } }} args
 */
export function generateMetadata({ params }) {
  const article = getArticle(params.slug);
  if (!article) {
    return { title: 'Article not found — ageofabundance.wiki' };
  }
  return {
    title: `${article.title} — ageofabundance.wiki`,
    description: article.summary,
  };
}

/**
 * @param {{ params: { slug: string } }} args
 */
export default function ArticlePage({ params }) {
  const article = getArticle(params.slug);
  if (!article) {
    notFound();
  }

  const toc = buildTableOfContents(article);
  const related = listArticles().filter((a) => a.slug !== article.slug);

  return (
    <div className="wiki-shell">
      <a href="#wiki-article-content" className="wiki-skip-link">
        Skip to article content
      </a>

      <header className="wiki-shell__header" role="banner">
        <Link href="/" className="wiki-shell__brand">
          <span className="wiki-shell__brand-dot" aria-hidden="true" />
          <span>ageofabundance.wiki</span>
        </Link>
      </header>

      <div className="wiki-shell__main">
        <aside
          className="wiki-shell__sidebar"
          aria-label="Article navigation"
        >
          <ArticleToc entries={toc} />
        </aside>

        <article
          id="wiki-article-content"
          className="wiki-article"
          aria-labelledby="wiki-article-title"
        >
          <header className="wiki-article__header">
            {article.category && (
              <p className="wiki-article__category">{article.category}</p>
            )}
            <h1 id="wiki-article-title" className="wiki-article__title">
              {article.title}
            </h1>
            <p className="wiki-article__summary">{article.summary}</p>
            <p className="wiki-article__meta">
              <span>Last updated </span>
              <time dateTime={article.updatedAt}>{article.updatedAt}</time>
            </p>
          </header>

          <div className="wiki-article__body">
            {article.sections.map((section) => (
              <section
                key={section.id}
                id={section.id}
                className="wiki-article__section"
                data-section-id={section.id}
              >
                <SectionBatchRenderer sections={[section]} />
              </section>
            ))}
          </div>

          {related.length > 0 && (
            <footer
              className="wiki-article__footer"
              aria-labelledby="wiki-related-heading"
            >
              <h2
                id="wiki-related-heading"
                className="wiki-article__footer-heading"
              >
                Related articles
              </h2>
              <ul className="wiki-article__related">
                {related.map((r) => (
                  <li key={r.slug}>
                    <Link href={`/wiki/${r.slug}`} className="wiki-link">
                      {r.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </footer>
          )}
        </article>
      </div>
    </div>
  );
}
