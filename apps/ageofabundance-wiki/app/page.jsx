import { listFeaturedArticles } from '@dds/wiki-data/articles';
import { ArticleCard } from '../components/article-card.jsx';

export const metadata = {
  title: 'ageofabundance.wiki — a living encyclopedia of post-scarcity civilization',
  description:
    'The Age of Abundance wiki: concepts, pillars, and open questions of the socio-technical transition to near-zero-marginal-cost essentials.',
};

export default function HomePage() {
  const featured = listFeaturedArticles();

  return (
    <main id="main-content" className="wiki-home">
      <header className="wiki-home__hero" aria-labelledby="wiki-home-title">
        <span className="wiki-home__dot" aria-hidden="true" />
        <p className="wiki-home__kicker">ageofabundance.wiki</p>
        <h1 id="wiki-home-title" className="wiki-home__title">
          A living encyclopedia of post-scarcity civilization.
        </h1>
        <p className="wiki-home__lede">
          Concepts, pillars, and open questions of the transition to
          near-zero-marginal-cost energy, compute, atoms, and coordination.
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
            {featured.map((article) => (
              <li key={article.id}>
                <ArticleCard article={article} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
