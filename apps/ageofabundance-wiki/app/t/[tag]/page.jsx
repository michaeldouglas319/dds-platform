import { notFound } from 'next/navigation';
import {
  listAllTags,
  listArticlesByTag,
} from '../../../content/articles.js';
import { deriveWikiMeta } from '../../../content/wiki-meta.js';
import { ArticleCard } from '../../../components/article-card.jsx';

export const dynamicParams = false;

export function generateStaticParams() {
  return listAllTags(deriveWikiMeta).map((tag) => ({ tag }));
}

export function generateMetadata({ params }) {
  const tag = params.tag;
  const allTags = listAllTags(deriveWikiMeta);
  if (!allTags.includes(tag)) {
    return {
      title: 'Tag not found — ageofabundance.wiki',
      description: 'This tag could not be found.',
    };
  }
  return {
    title: `Articles tagged "${tag}" — ageofabundance.wiki`,
    description: `All articles in the Age of Abundance wiki tagged "${tag}".`,
  };
}

export default function TagPage({ params }) {
  const tag = params.tag;
  const allTags = listAllTags(deriveWikiMeta);

  if (!allTags.includes(tag)) {
    notFound();
  }

  const entries = listArticlesByTag(tag, deriveWikiMeta);

  return (
    <main id="main-content" className="wiki-index wiki-tag-page">
      <nav className="wiki-breadcrumb" aria-label="Breadcrumb">
        <ol className="wiki-breadcrumb__list">
          <li>
            <a href="/">ageofabundance.wiki</a>
          </li>
          <li>
            <a href="/a">All articles</a>
          </li>
          <li aria-current="page">Tag: {tag}</li>
        </ol>
      </nav>

      <header className="wiki-index__header">
        <p className="wiki-tag-page__kicker">Tag</p>
        <h1 className="wiki-index__title">{tag}</h1>
        <p className="wiki-index__lede">
          {entries.length === 1
            ? '1 article'
            : `${entries.length} articles`}{' '}
          tagged &ldquo;{tag}&rdquo;.
        </p>
      </header>

      {allTags.length > 1 && (
        <nav
          className="wiki-tag-page__related-tags"
          aria-label="Browse other tags"
        >
          <span className="wiki-tag-page__related-label" aria-hidden="true">
            All tags:
          </span>
          <ul className="wiki-tag-page__tag-list" role="list">
            {allTags.map((t) => (
              <li key={t}>
                <a
                  href={`/t/${t}`}
                  className={`wiki-tag-page__tag-chip${t === tag ? ' wiki-tag-page__tag-chip--current' : ''}`}
                  aria-current={t === tag ? 'page' : undefined}
                >
                  {t}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {entries.length === 0 ? (
        <p className="wiki-index__empty">
          No articles match this tag yet.
        </p>
      ) : (
        <ul className="wiki-index__grid" role="list">
          {entries.map((entry) => (
            <li key={entry.article.id}>
              <ArticleCard article={entry.article} />
            </li>
          ))}
        </ul>
      )}

      <footer className="wiki-tag-page__footer">
        <a className="wiki-article__back" href="/a">
          <span aria-hidden="true">←</span> All articles
        </a>
      </footer>
    </main>
  );
}
