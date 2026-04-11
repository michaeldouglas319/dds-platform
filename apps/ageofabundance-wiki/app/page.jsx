import Link from 'next/link';
import { listArticles } from '../lib/articles.js';

export const metadata = {
  title: 'ageofabundance.wiki',
  description:
    'A living, parametric encyclopedia of the post-scarcity transition.',
};

export default function Home() {
  const articles = listArticles();

  return (
    <div className="wiki-shell">
      <a href="#wiki-home-content" className="wiki-skip-link">
        Skip to content
      </a>

      <header className="wiki-shell__header" role="banner">
        <Link href="/" className="wiki-shell__brand">
          <span className="wiki-shell__brand-dot" aria-hidden="true" />
          <span>ageofabundance.wiki</span>
        </Link>
      </header>

      <main
        id="wiki-home-content"
        className="wiki-shell__main wiki-shell__main--narrow"
      >
        <article className="wiki-article">
          <header className="wiki-article__header">
            <p className="wiki-article__category">Encyclopedia</p>
            <h1 className="wiki-article__title">ageofabundance.wiki</h1>
            <p className="wiki-article__summary">
              A living, parametric encyclopedia of the post-scarcity
              transition. Every article is a sequence of universal sections,
              rendered through the same plugin pipeline as the rest of the
              platform.
            </p>
          </header>

          <div className="wiki-article__body">
            <section
              className="wiki-article__section"
              aria-labelledby="wiki-index-heading"
            >
              <h2 id="wiki-index-heading">Articles</h2>
              {articles.length === 0 ? (
                <p role="status">No articles published yet.</p>
              ) : (
                <ul className="wiki-index">
                  {articles.map((article) => (
                    <li key={article.slug} className="wiki-index__item">
                      <Link
                        href={`/wiki/${article.slug}`}
                        className="wiki-index__link wiki-link"
                      >
                        <span className="wiki-index__title">
                          {article.title}
                        </span>
                        {article.category && (
                          <span className="wiki-index__category">
                            {article.category}
                          </span>
                        )}
                      </Link>
                      <p className="wiki-index__summary">{article.summary}</p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </article>
      </main>
    </div>
  );
}
