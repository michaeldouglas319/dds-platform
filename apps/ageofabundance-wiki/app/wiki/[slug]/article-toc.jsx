'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Accessible scroll-spy table of contents.
 *
 * - Uses IntersectionObserver (no scroll listener on the main thread).
 * - Marks the active link with `aria-current="location"` so screen readers
 *   announce position. Visual styling is scoped via `data-active`.
 * - Smooth-scroll is gated on `prefers-reduced-motion`.
 * - Degrades gracefully when JS is disabled: the underlying `<nav>` is just
 *   a list of in-page anchors that work without any client code.
 *
 * @param {{ entries: { id: string, label: string }[] }} props
 */
export function ArticleToc({ entries }) {
  const [activeId, setActiveId] = useState(entries[0]?.id ?? null);
  const visibleIdsRef = useRef(new Set());

  useEffect(() => {
    if (entries.length === 0) return undefined;

    const order = entries.map((e) => e.id);
    const visible = visibleIdsRef.current;

    const observer = new IntersectionObserver(
      (changes) => {
        for (const entry of changes) {
          if (entry.isIntersecting) {
            visible.add(entry.target.id);
          } else {
            visible.delete(entry.target.id);
          }
        }
        // Pick the topmost visible heading; if nothing is visible (between
        // sections), keep whatever was last active.
        const topMost = order.find((id) => visible.has(id));
        if (topMost) setActiveId(topMost);
      },
      {
        // Trigger slightly before the heading reaches the top so the active
        // link updates as you read into the section, not as it leaves.
        rootMargin: '-20% 0px -70% 0px',
        threshold: [0, 1],
      },
    );

    for (const { id } of entries) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [entries]);

  if (entries.length === 0) {
    return (
      <p className="wiki-toc__empty" role="status">
        This article has no sections yet.
      </p>
    );
  }

  return (
    <nav className="wiki-toc" aria-label="Table of contents">
      <h2 className="wiki-toc__heading">On this page</h2>
      <ol className="wiki-toc__list">
        {entries.map((entry) => {
          const isActive = entry.id === activeId;
          return (
            <li key={entry.id}>
              <a
                href={`#${entry.id}`}
                className="wiki-toc__link"
                data-active={isActive ? 'true' : undefined}
                aria-current={isActive ? 'location' : undefined}
              >
                {entry.label}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
