'use client';

/**
 * Wiki search combobox.
 *
 * Implements the WAI-ARIA combobox pattern (APG §combobox) with a listbox
 * popup. Keyboard-driven: Ctrl+K / Cmd+K opens, Arrow keys navigate,
 * Enter selects, Escape closes. Focus is managed via `aria-activedescendant`
 * so the input retains DOM focus while the SR cursor moves through results.
 *
 * No external search library — the articles dataset is small enough for
 * in-memory substring matching. The search function is imported from
 * `content/wiki-search.js` and runs entirely client-side.
 *
 * Accessibility:
 * - `role="combobox"` + `aria-expanded` + `aria-controls` on the input
 * - `role="listbox"` on the results list
 * - `role="option"` + `aria-selected` on each result
 * - `aria-activedescendant` for visual focus management
 * - `aria-live="polite"` status region announces result count
 * - All interactive elements meet 44px touch-target minimum
 * - Focus ring uses `--wiki-focus` custom property
 */

import { useState, useRef, useCallback, useEffect, useId } from 'react';
import { useRouter } from 'next/navigation.js';

/**
 * @param {{ entries: { slug: string, title: string, summary: string, category: string, tags: string[] }[] }} props
 */
export function WikiSearch({ entries }) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef(null);
  const listboxRef = useRef(null);
  const router = useRouter();

  const listboxId = useId();
  const statusId = useId();

  // ── Client-side search ──────────────────────────────────────────
  const results = query.trim().length > 0
    ? matchEntries(entries, query.trim())
    : [];

  const hasResults = results.length > 0;
  const showPopup = isOpen && query.trim().length > 0;

  // ── Navigation ──────────────────────────────────────────────────
  const navigate = useCallback(
    (slug) => {
      setIsOpen(false);
      setQuery('');
      setActiveIndex(-1);
      router.push(`/a/${slug}`);
    },
    [router],
  );

  // ── Keyboard handling ───────────────────────────────────────────
  const handleKeyDown = useCallback(
    (e) => {
      if (!showPopup) {
        if (e.key === 'ArrowDown' && hasResults) {
          e.preventDefault();
          setIsOpen(true);
          setActiveIndex(0);
        }
        return;
      }

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setActiveIndex((i) => (i < results.length - 1 ? i + 1 : 0));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setActiveIndex((i) => (i > 0 ? i - 1 : results.length - 1));
          break;
        case 'Enter':
          e.preventDefault();
          if (activeIndex >= 0 && activeIndex < results.length) {
            navigate(results[activeIndex].slug);
          }
          break;
        case 'Escape':
          e.preventDefault();
          setIsOpen(false);
          setActiveIndex(-1);
          break;
        case 'Home':
          e.preventDefault();
          setActiveIndex(0);
          break;
        case 'End':
          e.preventDefault();
          setActiveIndex(results.length - 1);
          break;
        default:
          break;
      }
    },
    [showPopup, hasResults, results, activeIndex, navigate],
  );

  // ── Global Ctrl+K / Cmd+K ──────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  // ── Scroll active option into view ─────────────────────────────
  useEffect(() => {
    if (activeIndex < 0 || !listboxRef.current) return;
    const option = listboxRef.current.children[activeIndex];
    if (option) {
      option.scrollIntoView({ block: 'nearest' });
    }
  }, [activeIndex]);

  // ── Reset active index when results change ─────────────────────
  useEffect(() => {
    setActiveIndex(-1);
  }, [query]);

  // ── Open popup when query changes ──────────────────────────────
  const handleInput = (e) => {
    setQuery(e.target.value);
    setIsOpen(true);
  };

  // ── Close on outside click ─────────────────────────────────────
  const containerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  const activeDescendant =
    activeIndex >= 0 && activeIndex < results.length
      ? `wiki-search-option-${results[activeIndex].slug}`
      : undefined;

  return (
    <div className="wiki-search" ref={containerRef}>
      <div className="wiki-search__input-wrap">
        <svg
          className="wiki-search__icon"
          aria-hidden="true"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="6.5" cy="6.5" r="5" />
          <path d="M10 10l4.5 4.5" />
        </svg>
        <input
          ref={inputRef}
          type="search"
          className="wiki-search__input"
          placeholder="Search articles…"
          role="combobox"
          aria-expanded={showPopup}
          aria-controls={listboxId}
          aria-activedescendant={activeDescendant}
          aria-autocomplete="list"
          aria-label="Search articles"
          autoComplete="off"
          value={query}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (query.trim().length > 0) setIsOpen(true);
          }}
        />
        <kbd className="wiki-search__kbd" aria-hidden="true">
          <span className="wiki-search__kbd-mod">⌘</span>K
        </kbd>
      </div>

      {showPopup && (
        <ul
          ref={listboxRef}
          id={listboxId}
          className="wiki-search__listbox"
          role="listbox"
          aria-label="Search results"
        >
          {results.length === 0 ? (
            <li className="wiki-search__no-results" role="presentation">
              No articles match &ldquo;{query}&rdquo;
            </li>
          ) : (
            results.map((entry, i) => (
              <li
                key={entry.slug}
                id={`wiki-search-option-${entry.slug}`}
                className={`wiki-search__option${i === activeIndex ? ' wiki-search__option--active' : ''}`}
                role="option"
                aria-selected={i === activeIndex}
                onMouseEnter={() => setActiveIndex(i)}
                onMouseDown={(e) => {
                  e.preventDefault(); // prevent blur before click
                  navigate(entry.slug);
                }}
              >
                <span className="wiki-search__option-title">{entry.title}</span>
                {entry.category && (
                  <span className="wiki-search__option-category">{entry.category}</span>
                )}
                <span className="wiki-search__option-summary">{entry.summary}</span>
              </li>
            ))
          )}
        </ul>
      )}

      <div className="wiki-search__status" role="status" aria-live="polite" id={statusId}>
        {showPopup && query.trim().length > 0
          ? results.length === 0
            ? 'No results found'
            : `${results.length} result${results.length === 1 ? '' : 's'} available`
          : ''}
      </div>
    </div>
  );
}

// ── Client-side matching ──────────────────────────────────────────

/**
 * Match entries against a query string using case-insensitive substring
 * matching with a simple relevance score.
 */
function matchEntries(entries, query) {
  const q = query.toLowerCase();
  const scored = [];

  for (const entry of entries) {
    const titleMatch = entry.title.toLowerCase().includes(q);
    const summaryMatch = entry.summary.toLowerCase().includes(q);
    const categoryMatch = entry.category.toLowerCase().includes(q);
    const tagsMatch = entry.tags.some((t) => t.toLowerCase().includes(q));

    if (!titleMatch && !summaryMatch && !categoryMatch && !tagsMatch) continue;

    let score = 0;
    if (titleMatch) score += 4;
    if (summaryMatch) score += 2;
    if (categoryMatch) score += 1;
    if (tagsMatch) score += 1;

    scored.push({ ...entry, score });
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 10);
}
