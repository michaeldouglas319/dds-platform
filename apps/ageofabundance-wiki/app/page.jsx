import { listFeaturedArticles } from '../content/articles.js';
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
        <p className="wiki-home__lede">
          The <strong>Age of Abundance</strong> names the civilizational
          threshold where essentials — energy, intelligence, material goods,
          and coordination — become effectively free at the margin. This wiki
          maps that transition: the technologies driving it, the social
          contracts it breaks, and the new ones it invites.
        </p>
        <p className="wiki-home__lede">
          It exists because the vocabulary is still being written. We need
          shared definitions before we can have shared conversations about
          what comes next.
        </p>
        <p className="wiki-home__cta">
          <a className="wiki-home__cta-link" href="#featured">
            Browse featured articles
          </a>
        </p>
      </header>

      <section
        className="wiki-home__featured"
        aria-labelledby="wiki-home-howto-title"
      >
        <h2 id="wiki-home-howto-title" className="wiki-home__section-title">
          How to use this wiki
        </h2>
        <ul className="wiki-home__grid" role="list">
          <li>
            <p className="wiki-home__lede">
              <strong>Browse concepts.</strong> Start with the featured
              articles below, or wander through pillars like post-scarcity
              economics, open intelligence, and autonomous coordination.
            </p>
          </li>
          <li>
            <p className="wiki-home__lede">
              <strong>Follow the [[wikilinks]].</strong> Every concept links
              to adjacent ones. Follow the threads — that's where the shape
              of the transition reveals itself.
            </p>
          </li>
          <li>
            <p className="wiki-home__lede">
              <strong>Contribute a definition.</strong> This is a
              community-driven encyclopedia. We welcome new entries defining
              future concepts, profiling the players shaping them, and paying
              tribute to the innovators building the groundwork.
            </p>
          </li>
        </ul>
      </section>

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
