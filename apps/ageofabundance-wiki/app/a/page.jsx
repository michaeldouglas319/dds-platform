import { articles } from '../../content/articles.js';
import { ArticleCard } from '../../components/article-card.jsx';

export const metadata = {
  title: 'All articles — ageofabundance.wiki',
  description: 'Every article in the Age of Abundance wiki.',
};

export default function ArticleIndexPage() {
  return (
    <main id="main-content" className="wiki-index">
      <nav className="wiki-breadcrumb" aria-label="Breadcrumb">
        <ol className="wiki-breadcrumb__list">
          <li>
            <a href="/">ageofabundance.wiki</a>
          </li>
          <li aria-current="page">All articles</li>
        </ol>
      </nav>

      <header className="wiki-index__header">
        <h1 className="wiki-index__title">All articles</h1>
        <p className="wiki-index__lede">
          Every article in the wiki, newest first.
        </p>
      </header>

      {articles.length === 0 ? (
        <p className="wiki-index__empty">No articles yet. Check back soon.</p>
      ) : (
        <ul className="wiki-index__grid" role="list">
          {articles.map((article) => (
            <li key={article.id}>
              <ArticleCard article={article} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
