/**
 * Tag category page — `/t/[tag]`
 *
 * Statically generated from the full tag set. Lists every article carrying
 * the tag, sorted newest-first. Pure RSC — no client JS.
 */

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
  const tag = decodeURIComponent(params.tag);
  const articles = listArticlesByTag(tag, deriveWikiMeta);
  const count = articles.length;
  const title = `"${tag}" — ageofabundance.wiki`;
  const description = `${count} article${count === 1 ? '' : 's'} tagged "${tag}" in the Age of Abundance wiki.`;
  return {
    title,
    description,
    openGraph: { title, description },
  };
}

export default function TagCategoryPage({ params }) {
  const tag = decodeURIComponent(params.tag);
  const articles = listArticlesByTag(tag, deriveWikiMeta);
  const allTags = listAllTags(deriveWikiMeta);

  return (
    <main id="main-content" className="wiki-category">
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

      <header className="wiki-category__header">
        <p className="wiki-category__kicker">Tag</p>
        <h1 className="wiki-category__title">{tag}</h1>
        <p className="wiki-category__count">
          {articles.length} article{articles.length === 1 ? '' : 's'}
        </p>
      </header>

      {articles.length === 0 ? (
        <p className="wiki-category__empty">
          No articles have been tagged &ldquo;{tag}&rdquo; yet.
        </p>
      ) : (
        <ul className="wiki-category__grid" role="list">
          {articles.map((entry) => (
            <li key={entry.article.id}>
              <ArticleCard article={entry.article} />
            </li>
          ))}
        </ul>
      )}

      {allTags.length > 1 && (
        <nav className="wiki-category__related" aria-label="All tags">
          <h2 className="wiki-category__related-heading">All tags</h2>
          <ul className="wiki-category__tag-list">
            {allTags.map((t) => (
              <li key={t}>
                <a
                  href={`/t/${encodeURIComponent(t)}`}
                  className={`wiki-category__tag-chip${t === tag ? ' wiki-category__tag-chip--current' : ''}`}
                  aria-current={t === tag ? 'page' : undefined}
                >
                  {t}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </main>
  );
}
