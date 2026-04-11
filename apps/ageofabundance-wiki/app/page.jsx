import Link from 'next/link';
import { listArticleSummaries } from './lib/articles';

export const metadata = {
  title: 'ageofabundance.wiki',
  description:
    'A living, plugin-driven wiki built on the DDS UniversalSection schema.',
};

export default function Home() {
  const articles = listArticleSummaries();

  return (
    <main className="wiki-shell wiki-shell--home" data-testid="wiki-home">
      <header className="wiki-home__header">
        <p className="wiki-category">ageofabundance.wiki</p>
        <h1 className="wiki-title">A living handbook of abundance</h1>
        <p className="wiki-summary">
          Every page on this wiki is a plug-in on top of the DDS UniversalSection
          schema. Articles, sidebars, infoboxes and tables of contents all compile
          to the same shape — so new content primitives ship additively, without
          forking the core.
        </p>
      </header>

      <section aria-labelledby="wiki-home-articles-heading" className="wiki-home__articles">
        <h2 id="wiki-home-articles-heading" className="wiki-home__articles-heading">
          Articles
        </h2>
        <ul className="wiki-home__list" data-testid="wiki-home-article-list">
          {articles.map((article) => (
            <li key={article.slug} className="wiki-home__item">
              <p className="wiki-home__item-category">{article.category}</p>
              <h3 className="wiki-home__item-title">
                <Link href={`/wiki/${article.slug}`}>{article.title}</Link>
              </h3>
              <p className="wiki-home__item-summary">{article.summary}</p>
              <p className="wiki-home__item-meta">
                Updated <time dateTime={article.updated}>{article.updated}</time>
              </p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
