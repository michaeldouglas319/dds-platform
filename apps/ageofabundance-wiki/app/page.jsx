import { articles } from '../data/articles.js';
import { ArticleCard } from '../components/article-card.jsx';

export const metadata = {
  title: 'Index',
  description:
    'Every article in the ageofabundance.wiki — grouped by the curves and concepts that define the Age of Abundance.',
};

export default function WikiIndexPage() {
  const sorted = [...articles].sort((a, b) => {
    if (a.subject.category === b.subject.category) {
      return a.subject.title.localeCompare(b.subject.title);
    }
    return a.subject.category.localeCompare(b.subject.category);
  });

  return (
    <section className="wiki-index" aria-labelledby="index-title">
      <header className="wiki-index__hero">
        <span className="wiki-index__eyebrow">Age of Abundance · Wiki</span>
        <h1 id="index-title" className="wiki-index__title">
          A working definition, written in public.
        </h1>
        <p className="wiki-index__lead">
          This wiki catalogs the curves, inversions and primitives that define
          the Age of Abundance. Every entry is a parametric record — subject,
          content, layout, theme — and is rendered through the same Universal
          Section schema that powers the rest of the platform.
        </p>
      </header>
      <ul
        className="wiki-index__list"
        aria-label={`${sorted.length} wiki articles`}
      >
        {sorted.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </ul>
    </section>
  );
}
