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
  const allTags = listAllTags(deriveWikiMeta);
  if (!allTags.includes(tag)) {
    return {
      title: 'Tag not found — ageofabundance.wiki',
      description: 'This tag does not exist in the wiki.',
    };
  }
  const title = `Articles tagged "${tag}" — ageofabundance.wiki`;
  const description = `All articles in the Age of Abundance wiki tagged with "${tag}".`;
  return {
    title,
    description,
    openGraph: { title, description },
  };
}

export default function TagPage({ params }) {
  const tag = params.tag;
  const allTags = listAllTags(deriveWikiMeta);

  if (!allTags.includes(tag)) {
    notFound();
  }

  const entries = listArticlesForTag(tag, deriveWikiMeta);

  return (
    <main id="main-content" className="wiki-index wiki-tag-page">
      <nav className="wiki-breadcrumb" aria-label="Breadcrumb">
        <ol className="wiki-breadcrumb__list">
          <li>
            <a href="/">ageofabundance.wiki</a>
          </li>
          <li>
            <a href="/t">Tags</a>
          </li>
          <li aria-current="page">{tag}</li>
        </ol>
      </nav>

      <header className="wiki-index__header">
        <p className="wiki-article__kicker">Tag</p>
        <h1 className="wiki-index__title">{tag}</h1>
        <p className="wiki-index__lede">
          {entries.length} article{entries.length === 1 ? '' : 's'} tagged
          &ldquo;{tag}&rdquo;.
        </p>
      </header>

      {entries.length === 0 ? (
        <p className="wiki-index__empty">
          No articles carry this tag yet.
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
        <a className="wiki-article__back" href="/t">
          <span aria-hidden="true">←</span> All tags
        </a>
      </footer>
    </main>
  );
}
