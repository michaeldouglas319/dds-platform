import Link from 'next/link';
import { notFound } from 'next/navigation';
import { articles, articlesBySlug } from '../../../data/articles.js';
import { backlinkIndex } from '../../../lib/wiki.js';
import { ArticleBody } from '../../../components/article-body.jsx';

/**
 * Enumerate every article slug at build time so Next.js can statically
 * generate an HTML file per article. A broken link or typo is served as
 * a real 404 via `notFound()` below.
 */
export function generateStaticParams() {
  return articles.map((article) => ({ slug: article.slug }));
}

export function generateMetadata({ params }) {
  const article = articlesBySlug[params.slug];
  if (!article) {
    return { title: 'Article not found' };
  }
  return {
    title: article.subject.title,
    description: article.subject.summary,
  };
}

export default function WikiArticlePage({ params }) {
  const article = articlesBySlug[params.slug];
  if (!article) {
    notFound();
  }

  const backlinks = backlinkIndex[article.slug] ?? [];
  const titleId = `article-${article.slug}-title`;

  return (
    <article
      className="wiki-article"
      aria-labelledby={titleId}
      data-slug={article.slug}
    >
      <nav className="wiki-article__crumbs" aria-label="Breadcrumb">
        <Link href="/">Index</Link> <span aria-hidden="true">›</span>{' '}
        <span>{article.subject.category}</span>
      </nav>

      <header className="wiki-article__header">
        <span className="wiki-article__eyebrow">{article.subject.category}</span>
        <h1 id={titleId} className="wiki-article__title">
          {article.subject.title}
        </h1>
        {article.subject.subtitle && (
          <p className="wiki-article__subtitle">{article.subject.subtitle}</p>
        )}
        <div className="wiki-article__meta">
          <span>
            Updated{' '}
            <time dateTime={article.subject.updated}>
              {formatUpdated(article.subject.updated)}
            </time>
          </span>
        </div>
      </header>

      <div className="wiki-article__grid">
        <ArticleBody article={article} />

        <aside className="wiki-aside" aria-label="Article metadata and backlinks">
          <section className="wiki-infobox" aria-labelledby={`${titleId}-info`}>
            <span
              className="wiki-infobox__label"
              id={`${titleId}-info`}
            >
              At a glance
            </span>
            <dl>
              <dt>Category</dt>
              <dd>{article.subject.category}</dd>
              <dt>Updated</dt>
              <dd>
                <time dateTime={article.subject.updated}>
                  {formatUpdated(article.subject.updated)}
                </time>
              </dd>
              {article.subject.tags && article.subject.tags.length > 0 && (
                <>
                  <dt>Tags</dt>
                  <dd>
                    <div className="wiki-tags">
                      {article.subject.tags.map((tag) => (
                        <span className="wiki-tag" key={tag}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </dd>
                </>
              )}
            </dl>
          </section>

          <section
            className="wiki-backlinks"
            aria-labelledby={`${titleId}-backlinks`}
          >
            <span
              className="wiki-backlinks__label"
              id={`${titleId}-backlinks`}
            >
              Backlinks
            </span>
            {backlinks.length > 0 ? (
              <ul className="wiki-backlinks__list">
                {backlinks.map((entry) => (
                  <li key={entry.slug}>
                    <Link href={`/wiki/${entry.slug}`}>{entry.title}</Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="wiki-backlinks__empty">
                No other articles link here yet.
              </p>
            )}
          </section>
        </aside>
      </div>
    </article>
  );
}

function formatUpdated(iso) {
  const [year, month, day] = iso.split('-').map((part) => Number.parseInt(part, 10));
  if (!year || !month || !day) return iso;
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  return `${months[month - 1]} ${day}, ${year}`;
}
