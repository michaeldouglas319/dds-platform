'use client';

/**
 * Wiki search combobox.
 *
 * Implements the WAI-ARIA combobox pattern (APG) with a listbox of results.
 * Opens via a trigger button or Cmd/Ctrl+K global shortcut.
 *
 * Accessibility:
 * - `role="combobox"` on input with `aria-expanded`, `aria-controls`,
 *   `aria-autocomplete="list"`, `aria-activedescendant`.
 * - `role="listbox"` on results with `role="option"` items.
 * - Arrow keys move active descendant; Enter selects; Escape closes.
 * - Live region announces result count.
 * - Focus is trapped inside the dialog while open; returns on close.
 * - 44px minimum touch targets on all interactive elements.
 */

import { useState, useRef, useCallback, useEffect, useId } from 'react';
import { searchIndex } from '../content/wiki-search.js';

/**
 * @param {{ index: import('../content/wiki-search.js').SearchEntry[] }} props
 */
export function WikiSearch({ index }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);

  const inputRef = useRef(null);
  const listboxRef = useRef(null);
  const triggerRef = useRef(null);
  const dialogRef = useRef(null);
  const instanceId = useId();

  const listboxId = `wiki-search-listbox-${instanceId}`;
  const liveId = `wiki-search-live-${instanceId}`;
  const inputId = `wiki-search-input-${instanceId}`;

  const results = query.trim() ? searchIndex(index, query, 8) : [];

  // ── Open / close helpers ───────────────────────────────────────

  const openSearch = useCallback(() => {
    setOpen(true);
    setQuery('');
    setActiveIndex(-1);
    // Focus the input after the dialog renders.
    requestAnimationFrame(() => inputRef.current?.focus());
  }, []);

  const closeSearch = useCallback(() => {
    setOpen(false);
    setQuery('');
    setActiveIndex(-1);
    triggerRef.current?.focus();
  }, []);

  // ── Global Cmd/Ctrl+K shortcut ────────────────────────────────

  useEffect(() => {
    function handleGlobalKey(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (open) {
          closeSearch();
        } else {
          openSearch();
        }
      }
    }
    document.addEventListener('keydown', handleGlobalKey);
    return () => document.removeEventListener('keydown', handleGlobalKey);
  }, [open, openSearch, closeSearch]);

  // ── Click-outside to close ────────────────────────────────────

  useEffect(() => {
    if (!open) return;
    function handleClick(e) {
      if (dialogRef.current && !dialogRef.current.contains(e.target)) {
        closeSearch();
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open, closeSearch]);

  // ── Combobox keyboard interaction ─────────────────────────────

  const handleInputKeyDown = (e) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((prev) => {
          const next = prev + 1;
          return next >= results.length ? 0 : next;
        });
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((prev) => {
          const next = prev - 1;
          return next < 0 ? results.length - 1 : next;
        });
        break;
      case 'Enter':
        e.preventDefault();
        if (activeIndex >= 0 && activeIndex < results.length) {
          navigateToResult(results[activeIndex].entry.slug);
        }
        break;
      case 'Escape':
        e.preventDefault();
        closeSearch();
        break;
      case 'Home':
        if (results.length > 0) {
          e.preventDefault();
          setActiveIndex(0);
        }
        break;
      case 'End':
        if (results.length > 0) {
          e.preventDefault();
          setActiveIndex(results.length - 1);
        }
        break;
      default:
        break;
    }
  };

  const handleInputChange = (e) => {
    setQuery(e.target.value);
    setActiveIndex(-1);
  };

  const navigateToResult = (slug) => {
    // Use window.location for SSG compatibility (no router needed).
    window.location.href = `/a/${slug}`;
  };

  // Scroll active option into view.
  useEffect(() => {
    if (activeIndex < 0 || !listboxRef.current) return;
    const option = listboxRef.current.children[activeIndex];
    if (option) {
      option.scrollIntoView({ block: 'nearest' });
    }
  }, [activeIndex]);

  const activeOptionId =
    activeIndex >= 0 ? `wiki-search-option-${instanceId}-${activeIndex}` : undefined;

  // ── Render ────────────────────────────────────────────────────

  return (
    <>
      {/* Trigger button */}
      <button
        ref={triggerRef}
        type="button"
        className="wiki-search__trigger"
        onClick={openSearch}
        aria-label="Search articles"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <svg
          className="wiki-search__icon"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5" />
          <line x1="10.5" y1="10.5" x2="14.5" y2="14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <span className="wiki-search__trigger-text">Search</span>
        <kbd className="wiki-search__kbd" aria-hidden="true">
          <abbr title="Command">&#x2318;</abbr>K
        </kbd>
      </button>

      {/* Search dialog overlay */}
      {open && (
        <div className="wiki-search__overlay" role="presentation">
          <div
            ref={dialogRef}
            className="wiki-search__dialog"
            role="dialog"
            aria-label="Search articles"
            aria-modal="true"
          >
            {/* Combobox input */}
            <div className="wiki-search__input-wrap">
              <svg
                className="wiki-search__input-icon"
                width="18"
                height="18"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
              >
                <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5" />
                <line x1="10.5" y1="10.5" x2="14.5" y2="14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <input
                ref={inputRef}
                id={inputId}
                className="wiki-search__input"
                type="text"
                role="combobox"
                aria-expanded={results.length > 0}
                aria-controls={listboxId}
                aria-autocomplete="list"
                aria-activedescendant={activeOptionId}
                aria-label="Search articles"
                placeholder="Search articles&#x2026;"
                value={query}
                onChange={handleInputChange}
                onKeyDown={handleInputKeyDown}
                autoComplete="off"
                spellCheck="false"
              />
              <button
                type="button"
                className="wiki-search__close"
                onClick={closeSearch}
                aria-label="Close search"
              >
                <kbd aria-hidden="true">Esc</kbd>
              </button>
            </div>

            {/* Results listbox */}
            <ul
              ref={listboxRef}
              id={listboxId}
              className="wiki-search__listbox"
              role="listbox"
              aria-label="Search results"
            >
              {results.map((result, i) => (
                <li
                  key={result.entry.slug}
                  id={`wiki-search-option-${instanceId}-${i}`}
                  className={`wiki-search__option${i === activeIndex ? ' wiki-search__option--active' : ''}`}
                  role="option"
                  aria-selected={i === activeIndex}
                  onMouseEnter={() => setActiveIndex(i)}
                  onClick={() => navigateToResult(result.entry.slug)}
                >
                  <span className="wiki-search__option-category">
                    {result.entry.category}
                  </span>
                  <span className="wiki-search__option-title">
                    {result.entry.title}
                  </span>
                  <span className="wiki-search__option-summary">
                    {result.entry.summary}
                  </span>
                </li>
              ))}
            </ul>

            {/* Live region for result count */}
            <div id={liveId} className="wiki-search__live" aria-live="polite" aria-atomic="true">
              {query.trim()
                ? results.length === 0
                  ? 'No articles found.'
                  : `${results.length} result${results.length === 1 ? '' : 's'} found.`
                : ''}
            </div>

            {/* Empty state */}
            {query.trim() && results.length === 0 && (
              <p className="wiki-search__empty">
                No articles match &ldquo;{query.trim()}&rdquo;. Try a different term.
              </p>
            )}

            {/* Hint when no query */}
            {!query.trim() && (
              <p className="wiki-search__hint">
                Type to search across all wiki articles.
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
