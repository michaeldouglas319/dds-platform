'use client';

/**
 * Tag filter bar + article list for the `/a` index page.
 *
 * Receives pre-sorted articles (with derived meta) from the server-rendered
 * page and applies client-side tag filtering. This keeps the page statically
 * generated while providing interactive filtering.
 *
 * Accessibility:
 * - Tag buttons use `aria-pressed` to communicate toggle state
 * - Filter group is labelled with `role="group"` + `aria-label`
 * - A live region announces the filtered count to screen readers
 * - All buttons meet the 44px touch target minimum
 */

import { useState, useId } from 'react';
import { ArticleCard } from './article-card.jsx';

/**
 * @param {{ items: { article: object, meta: object }[], allTags: string[] }} props
 */
export function TagFilter({ items, allTags }) {
  const [activeTag, setActiveTag] = useState(null);
  const liveId = useId();

  const filtered = activeTag
    ? items.filter((entry) => entry.meta.tags.includes(activeTag))
    : items;

  const handleTagClick = (tag) => {
    setActiveTag((current) => (current === tag ? null : tag));
  };

  return (
    <>
      {allTags.length > 0 && (
        <div className="wiki-index__filter" role="group" aria-label="Filter articles by tag">
          <span className="wiki-index__filter-label" aria-hidden="true">
            Filter by tag:
          </span>
          {allTags.map((tag) => (
            <button
              key={tag}
              type="button"
              className={`wiki-index__tag-btn${activeTag === tag ? ' wiki-index__tag-btn--active' : ''}`}
              aria-pressed={activeTag === tag}
              onClick={() => handleTagClick(tag)}
            >
              {tag}
            </button>
          ))}
          {activeTag && (
            <button
              type="button"
              className="wiki-index__tag-clear"
              onClick={() => setActiveTag(null)}
            >
              Clear filter
            </button>
          )}
        </div>
      )}

      <p className="wiki-index__count" aria-live="polite" id={liveId}>
        {filtered.length === items.length
          ? `${items.length} article${items.length === 1 ? '' : 's'}`
          : `${filtered.length} of ${items.length} article${items.length === 1 ? '' : 's'}`}
        {activeTag ? ` tagged "${activeTag}"` : ''}
      </p>

      {filtered.length === 0 ? (
        <p className="wiki-index__empty">
          No articles match the selected tag. Try clearing the filter.
        </p>
      ) : (
        <ul className="wiki-index__grid" role="list">
          {filtered.map((entry) => (
            <li key={entry.article.id}>
              <ArticleCard article={entry.article} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
