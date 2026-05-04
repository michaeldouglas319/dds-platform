'use client';

import { useCallback } from 'react';

interface ScrollableSection {
  id: string;
}

/**
 * Hook for scroll-based navigation between sections
 * @param sections - Array of sections with id property
 * @returns Object with scroll navigation functions
 */
export function useScrollNavigation(sections: ScrollableSection[]) {
  const scrollToNext = useCallback((currentIndex: number) => {
    if (currentIndex < sections.length - 1) {
      const nextSection = sections[currentIndex + 1];
      const element = document.getElementById(nextSection.id);
      element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [sections]);

  const scrollToSection = useCallback((sectionId: string) => {
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  return { scrollToNext, scrollToSection };
}
