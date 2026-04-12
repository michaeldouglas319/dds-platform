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
  const count = listArticlesByTag(tag, deriveWikiMeta).length;
  return {
    title: `"${tag}" — ageofabundance.wiki`,
    description: `${count} article${count === 1 ? '' : 's'} tagged "${tag}" in the Age of Abundance wiki.`,
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
    <main id="main-content" className="wiki-index">
      <nav className="wiki-breadcrumb" aria-label="Breadcrumb">
        <ol className="wiki-breadcrumb__list">
          <li>
            <a href="/">ageofabundance.wiki</a>
          </li>
          <li>
            <a href="/a">All articles</a>
          </li>
          <li aria-current="page">{tag}</li>
        </ol>
      </nav>

      <header className="wiki-index__header">
        <p className="wiki-tag-page__kicker">Tag</p>
        <h1 className="wiki-index__title">{tag}</h1>
        <p className="wiki-index__lede">
          {entries.length} article{entries.length === 1 ? '' : 's'} tagged
          &ldquo;{tag}&rdquo;.
        </p>
      </header>

      <nav className="wiki-tag-page__siblings" aria-label="Related tags">
        <span className="wiki-tag-page__siblings-label">All tags:</span>
        <ul className="wiki-tag-page__tag-list">
          {allTags.map((t) => (
            <li key={t}>
              <a
                href={`/t/${t}`}
                className={`wiki-tag-page__tag-link${t === tag ? ' wiki-tag-page__tag-link--current' : ''}`}
                aria-current={t === tag ? 'page' : undefined}
              >
                {t}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {entries.length === 0 ? (
        <p className="wiki-index__empty">
          No articles with this tag yet.
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
    </main>
  );
}
