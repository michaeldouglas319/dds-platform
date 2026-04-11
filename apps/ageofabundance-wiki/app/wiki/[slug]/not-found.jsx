import Link from 'next/link';
import { listArticles } from '../../../lib/articles.js';

export const metadata = {
  title: 'Article not found — ageofabundance.wiki',
};

export default function ArticleNotFound() {
  const articles = listArticles();

  return (
    <div className="wiki-shell">
      <header className="wiki-shell__header" role="banner">
        <Link href="/" className="wiki-shell__brand">
          <span className="wiki-shell__brand-dot" aria-hidden="true" />
          <span>ageofabundance.wiki</span>
        </Link>
      </header>

      <main
        className="wiki-shell__main wiki-shell__main--narrow"
        id="wiki-article-content"
      >
        <article className="wiki-article">
          <header className="wiki-article__header">
            <p className="wiki-article__category">404</p>
            <h1 className="wiki-article__title">Article not found</h1>
            <p className="wiki-article__summary">
              We couldn&rsquo;t find that page in the wiki. It may have been
              renamed, or it may not exist yet.
            </p>
          </header>

          <div className="wiki-article__body">
            <section className="wiki-article__section">
              <h2>Try one of these instead</h2>
              <ul className="wiki-article__related">
                {articles.map((a) => (
                  <li key={a.slug}>
                    <Link href={`/wiki/${a.slug}`} className="wiki-link">
                      {a.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </article>
      </main>
    </div>
  );
}
