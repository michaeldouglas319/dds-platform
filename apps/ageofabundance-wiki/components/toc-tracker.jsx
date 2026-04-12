'use client';

/**
 * TocTracker — client component that renders a table of contents with
 * IntersectionObserver-based active-heading tracking.
 *
 * Renders:
 * - On wide screens (≥960px via CSS): a sticky sidebar `<nav>`.
 * - On narrow screens: a `<details>/<summary>` disclosure widget.
 *   Uses native HTML semantics — no custom ARIA required.
 *
 * The TOC entries (id, text, level) are extracted at build time by the
 * server component and passed here as a serializable array.
 */

import { useEffect, useRef, useState } from 'react';

/**
 * @param {{ entries: Array<{ id: string, text: string, level: number }> }} props
 */
export function TocTracker({ entries }) {
  const [activeId, setActiveId] = useState(/** @type {string | null} */ (null));
  const observerRef = useRef(/** @type {IntersectionObserver | null} */ (null));

  useEffect(() => {
    const ids = entries.map((e) => e.id);
    const headings = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    if (headings.length === 0) return;

    // Activate when heading enters the top 30% of the viewport.
    observerRef.current = new IntersectionObserver(
      (ioEntries) => {
        const intersecting = ioEntries.filter((e) => e.isIntersecting);
        if (intersecting.length > 0) {
          // Pick the one closest to the top of the viewport
          intersecting.sort(
            (a, b) => a.boundingClientRect.top - b.boundingClientRect.top,
          );
          setActiveId(intersecting[0].target.id);
        }
      },
      {
        rootMargin: '0px 0px -70% 0px',
        threshold: 0,
      },
    );

    for (const h of headings) {
      observerRef.current.observe(h);
    }

    // Edge case: when user scrolls to the very bottom, activate the last heading
    function handleScroll() {
      if (
        window.innerHeight + Math.ceil(window.scrollY) >=
        document.body.offsetHeight - 2
      ) {
        const last = headings[headings.length - 1];
        if (last) setActiveId(last.id);
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      observerRef.current?.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, [entries]);

  const linkList = (
    <ol className="wiki-toc__list">
      {entries.map((entry) => (
        <li key={entry.id} className="wiki-toc__item">
          <a
            href={`#${entry.id}`}
            className={`wiki-toc__link${activeId === entry.id ? ' wiki-toc__link--active' : ''}`}
            aria-current={activeId === entry.id ? 'true' : undefined}
          >
            {entry.text}
          </a>
        </li>
      ))}
    </ol>
  );

  return (
    <nav className="wiki-toc" aria-label="Table of contents">
      {/* Mobile: collapsible disclosure */}
      <details className="wiki-toc__mobile">
        <summary className="wiki-toc__toggle">
          Table of contents
        </summary>
        <div className="wiki-toc__body">
          {linkList}
        </div>
      </details>

      {/* Desktop: always-visible sticky sidebar */}
      <div className="wiki-toc__desktop">
        <p className="wiki-toc__heading" aria-hidden="true">
          Contents
        </p>
        {linkList}
      </div>
    </nav>
  );
}
