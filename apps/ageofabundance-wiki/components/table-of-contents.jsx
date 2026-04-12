/**
 * Table of Contents — client component with IntersectionObserver scroll spy.
 *
 * Renders a `<nav>` landmark with an ordered list of section headings.
 * On wide viewports the nav sits in a sticky sidebar; on narrow viewports
 * it collapses behind a toggle button.
 *
 * Scroll-to-heading behavior respects `prefers-reduced-motion`: smooth
 * scrolling is used only when the user has no motion preference.
 *
 * Props:
 *   headings — Array<{ id: string, text: string }>
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Query the user's motion preference once per interaction rather than
 * on every click (the media query result can't change mid-interaction).
 */
function prefersReducedMotion() {
  if (typeof window === 'undefined') return true;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function TableOfContents({ headings }) {
  const [activeId, setActiveId] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const observerRef = useRef(null);

  /* ── Scroll spy via IntersectionObserver ─────────────────────── */
  useEffect(() => {
    if (!headings || headings.length === 0) return;

    // Track which headings are currently intersecting. When multiple
    // headings are visible, prefer the one closest to the top.
    const visibleSet = new Set();

    const pickActive = () => {
      if (visibleSet.size === 0) return;
      // Among visible headings, pick the one earliest in document order.
      for (const { id } of headings) {
        if (visibleSet.has(id)) {
          setActiveId(id);
          return;
        }
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            visibleSet.add(entry.target.id);
          } else {
            visibleSet.delete(entry.target.id);
          }
        }
        pickActive();
      },
      {
        // Fire when the heading enters the top third of the viewport.
        rootMargin: '0px 0px -66% 0px',
        threshold: 0,
      },
    );

    for (const { id } of headings) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }

    observerRef.current = observer;
    return () => observer.disconnect();
  }, [headings]);

  /* ── Click handler with motion-aware scroll ─────────────────── */
  const handleClick = useCallback(
    (e, id) => {
      e.preventDefault();
      const el = document.getElementById(id);
      if (!el) return;

      const behavior = prefersReducedMotion() ? 'instant' : 'smooth';
      el.scrollIntoView({ behavior, block: 'start' });

      // Move focus so keyboard users land at the heading.
      el.focus({ preventScroll: true });

      // Close the mobile drawer after navigation.
      setIsOpen(false);
    },
    [],
  );

  if (!headings || headings.length === 0) return null;

  return (
    <nav className="wiki-toc" aria-label="Table of contents">
      {/* Mobile toggle — hidden on wide viewports via CSS */}
      <button
        className="wiki-toc__toggle"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-controls="wiki-toc-list"
      >
        <span className="wiki-toc__toggle-label">Contents</span>
        <span className="wiki-toc__toggle-icon" aria-hidden="true">
          {isOpen ? '\u2212' : '+'}
        </span>
      </button>

      <ol
        id="wiki-toc-list"
        className={`wiki-toc__list${isOpen ? ' wiki-toc__list--open' : ''}`}
      >
        {headings.map(({ id, text }) => (
          <li key={id} className="wiki-toc__item">
            <a
              href={`#${id}`}
              className={`wiki-toc__link${activeId === id ? ' wiki-toc__link--active' : ''}`}
              onClick={(e) => handleClick(e, id)}
              aria-current={activeId === id ? 'true' : undefined}
            >
              {text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
