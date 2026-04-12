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
  const entries = listArticlesByTag(tag, deriveWikiMeta);
  if (entries.length === 0) {
    return {
      title: 'Tag not found — ageofabundance.wiki',
      description: 'No articles found for this tag.',
    };
  }
  const count = entries.length;
  return {
    title: `${tag} — ageofabundance.wiki`,
    description: `${count} article${count === 1 ? '' : 's'} tagged "${tag}" in the Age of Abundance wiki.`,
  };
}

export default function TagPage({ params }) {
  const tag = params.tag;
  const entries = listArticlesByTag(tag, deriveWikiMeta);

  if (entries.length === 0) {
    notFound();
  }

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
          <li aria-current="page">{tag}</li>
        </ol>
      </nav>

      <header className="wiki-category__header">
        <p className="wiki-category__kicker">Tag</p>
        <h1 className="wiki-category__title">{tag}</h1>
        <p className="wiki-category__count">
          {entries.length} article{entries.length === 1 ? '' : 's'}
        </p>
      </header>

      <ul className="wiki-category__grid" role="list">
        {entries.map((entry) => (
          <li key={entry.article.id}>
            <ArticleCard article={entry.article} />
          </li>
        ))}
      </ul>

      <nav className="wiki-category__nav" aria-label="Category navigation">
        <a className="wiki-category__back" href="/a">
          <span aria-hidden="true">&larr;</span> All articles
        </a>
      </nav>
    </main>
  );
}
