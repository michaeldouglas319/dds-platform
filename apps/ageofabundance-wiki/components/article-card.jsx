import Link from 'next/link';

/**
 * Card used on the article index. Parametric — pulls straight from the
 * `subject` sub-record, which mirrors `UniversalSection.subject`.
 *
 * @param {{ article: import('../data/articles.js').WikiArticle }} props
 */
export function ArticleCard({ article }) {
  const { slug, subject } = article;
  return (
    <li className="wiki-card">
      <Link
        href={`/wiki/${slug}`}
        className="wiki-card__link"
        aria-labelledby={`card-${slug}-title`}
      >
        <span className="wiki-card__category">{subject.category}</span>
        <h2 id={`card-${slug}-title`} className="wiki-card__title">
          {subject.title}
        </h2>
        {subject.subtitle && (
          <p className="wiki-card__subtitle">{subject.subtitle}</p>
        )}
        <p className="wiki-card__summary">{subject.summary}</p>
        <time className="wiki-card__updated" dateTime={subject.updated}>
          Updated {formatUpdated(subject.updated)}
        </time>
      </Link>
    </li>
  );
}

/**
 * Format an ISO date for display. Uses `en-US` with a fixed long-date
 * format so server-rendered output is deterministic and cannot disagree
 * with the client during hydration.
 *
 * @param {string} iso
 */
function formatUpdated(iso) {
  const [year, month, day] = iso.split('-').map((part) => Number.parseInt(part, 10));
  if (!year || !month || !day) return iso;
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  return `${months[month - 1]} ${day}, ${year}`;
}
