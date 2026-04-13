import type { DomainConfig } from '../config/domains';
import { listFeaturedArticles, type WikiArticle } from '@dds/wiki-data/articles';

export function WikiRenderer({ domain, icon, header }: DomainConfig & { domain: string }) {
  const featured = listFeaturedArticles();
  const displayIcon = icon === false ? null : (icon ?? '𒌓');

  const styles = `
    .wiki-home {
      margin: 0;
      padding: 0;
      background: #fff;
      min-height: 100vh;
      font-family: system-ui, -apple-system, sans-serif;
      color: #000;
    }

    .wiki-home__hero {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 60vh;
      padding: 40px 20px;
      border-bottom: 1px solid #e5e5e5;
    }

    .wiki-home__dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: #000;
      margin-bottom: 24px;
    }

    .wiki-home__kicker {
      font-size: 0.875rem;
      letter-spacing: 0.08em;
      color: #666;
      margin: 0 0 12px;
      font-weight: 500;
    }

    .wiki-home__title {
      font-size: clamp(1.75rem, 5vw, 3rem);
      font-weight: 700;
      letter-spacing: -0.02em;
      margin: 0 0 16px;
      line-height: 1.2;
      max-width: 640px;
    }

    .wiki-home__lede {
      font-size: clamp(0.875rem, 2vw, 1rem);
      color: #555;
      margin: 0 0 24px;
      max-width: 560px;
      line-height: 1.6;
    }

    .wiki-home__cta {
      margin: 0;
    }

    .wiki-home__cta-link {
      display: inline-block;
      padding: 12px 24px;
      background: #000;
      color: #fff;
      text-decoration: none;
      border-radius: 4px;
      font-size: 0.875rem;
      font-weight: 600;
      transition: background 0.2s;
    }

    .wiki-home__cta-link:hover {
      background: #333;
    }

    .wiki-home__featured {
      padding: 60px 20px;
    }

    .wiki-home__section-title {
      font-size: clamp(1.25rem, 3vw, 1.75rem);
      font-weight: 600;
      letter-spacing: -0.01em;
      margin: 0 0 40px;
      text-align: center;
    }

    .wiki-home__grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 24px;
      max-width: 1200px;
      margin: 0 auto;
      padding: 0;
      list-style: none;
    }

    .article-card {
      border: 1px solid #e5e5e5;
      border-radius: 4px;
      transition: border-color 0.2s, box-shadow 0.2s;
    }

    .article-card:hover {
      border-color: #999;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    }

    .article-card__link {
      display: flex;
      flex-direction: column;
      padding: 20px;
      text-decoration: none;
      color: inherit;
      height: 100%;
      min-height: 44px;
    }

    .article-card__kicker {
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.1em;
      color: #999;
      text-transform: uppercase;
      margin: 0 0 8px;
    }

    .article-card__title {
      font-size: 1.25rem;
      font-weight: 700;
      line-height: 1.3;
      margin: 0 0 8px;
      color: #000;
    }

    .article-card__subtitle {
      font-size: 0.875rem;
      color: #666;
      margin: 0 0 12px;
      line-height: 1.5;
    }

    .article-card__summary {
      font-size: 0.875rem;
      color: #555;
      line-height: 1.6;
      margin: 0 0 auto;
      flex-grow: 1;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .article-card__cta {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 12px;
      font-size: 0.75rem;
      font-weight: 600;
      color: #000;
    }

    .article-card__reading {
      display: inline-block;
      padding: 2px 8px;
      background: #f5f5f5;
      border-radius: 2px;
      font-size: 0.65rem;
      color: #666;
    }

    .wiki-home__empty {
      text-align: center;
      color: #999;
      padding: 40px 20px;
      font-size: 1rem;
    }

    @media (min-width: 768px) {
      .wiki-home__hero {
        min-height: 70vh;
        padding: 60px 40px;
      }

      .wiki-home__featured {
        padding: 80px 40px;
      }
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <main className="wiki-home">
        <header className="wiki-home__hero" aria-labelledby="wiki-home-title">
          <span className="wiki-home__dot" aria-hidden="true" />
          <p className="wiki-home__kicker">{domain}</p>
          <h1 id="wiki-home-title" className="wiki-home__title">
            {header?.title ?? 'A living encyclopedia'}
          </h1>
          <p className="wiki-home__lede">
            {header?.subtitle ?? 'Explore ideas about the transition to abundance.'}
          </p>
          <p className="wiki-home__cta">
            <a className="wiki-home__cta-link" href="#featured">
              Browse featured articles
            </a>
          </p>
        </header>

        <section
          id="featured"
          className="wiki-home__featured"
          aria-labelledby="wiki-home-featured-title"
        >
          <h2 id="wiki-home-featured-title" className="wiki-home__section-title">
            Featured articles
          </h2>
          {featured.length === 0 ? (
            <p className="wiki-home__empty">No articles yet. Check back soon.</p>
          ) : (
            <ul className="wiki-home__grid" role="list">
              {featured.map((article: any) => (
                <li key={article.id}>
                  <article className="article-card">
                    <a href={`/a/${article.id}`} className="article-card__link">
                      {article.subject?.category && (
                        <p className="article-card__kicker">{article.subject.category}</p>
                      )}
                      <h3 className="article-card__title">{article.subject?.title}</h3>
                      {article.subject?.subtitle && (
                        <p className="article-card__subtitle">{article.subject.subtitle}</p>
                      )}
                      {article.meta?.wiki?.summary && (
                        <p className="article-card__summary">{article.meta.wiki.summary}</p>
                      )}
                      <p className="article-card__cta">
                        <span className="article-card__cta-text">Continue reading</span>
                        {article.meta?.wiki?.readingTimeMinutes ? (
                          <span
                            className="article-card__reading"
                            aria-label={`${article.meta.wiki.readingTimeMinutes} minute read`}
                          >
                            {article.meta.wiki.readingTimeMinutes} min
                          </span>
                        ) : null}
                      </p>
                    </a>
                  </article>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </>
  );
}
