import { notFound } from 'next/navigation';
import {
  listAllTags,
  listArticlesForTag,
} from '../../../content/articles.js';
import { deriveWikiMeta } from '../../../content/wiki-meta.js';
import { ArticleCard } from '../../../components/article-card.jsx';

export const dynamicParams = false;

export function generateStaticParams() {
  return listAllTags(deriveWikiMeta).map((tag) => ({ tag }));
}

export function generateMetadata({ params }) {
  const tag = params.tag;
  const display = tag.charAt(0).toUpperCase() + tag.slice(1);
  return {
    title: `${display} — ageofabundance.wiki`,
    description: `Articles tagged "${tag}" in the Age of Abundance wiki.`,
  };
}

export default function TagPage({ params }) {
  const { tag } = params;
  const allTags = listAllTags(deriveWikiMeta);

  if (!allTags.includes(tag)) {
    notFound();
  }

  const articles = listArticlesForTag(tag, deriveWikiMeta);
  const display = tag.charAt(0).toUpperCase() + tag.slice(1);

  return (
    <main id="main-content" className="wiki-tag-page">
      <nav className="wiki-breadcrumb" aria-label="Breadcrumb">
        <ol className="wiki-breadcrumb__list">
          <li>
            <a href="/">ageofabundance.wiki</a>
          </li>
          <li>
            <a href="/t">All tags</a>
          </li>
          <li aria-current="page">{display}</li>
        </ol>
      </nav>

      <header className="wiki-tag-page__header">
        <h1 className="wiki-tag-page__title">{display}</h1>
        <p className="wiki-tag-page__lede">
          {articles.length} article{articles.length === 1 ? '' : 's'} tagged
          &ldquo;{tag}&rdquo;.
        </p>
      </header>

      {articles.length === 0 ? (
        <p className="wiki-tag-page__empty">
          No articles with this tag yet.
        </p>
      ) : (
        <ul className="wiki-tag-page__grid" role="list">
          {articles.map((entry) => (
            <li key={entry.article.id}>
              <ArticleCard article={entry.article} />
            </li>
          ))}
        </ul>
      )}

      <footer className="wiki-tag-page__footer">
        <a className="wiki-tag-page__back" href="/t">
          <span aria-hidden="true">&larr;</span> All tags
        </a>
      </footer>
    </main>
  );
}
