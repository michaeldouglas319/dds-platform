'use client';

import { useEffect, useRef, useState } from 'react';

export interface OrbitalState {
  selectedIndex: number; // Currently selected card (0-based)
  targetRotation: number; // Target rotation angle in radians
  currentRotation: React.MutableRefObject<number>; // Current rotation (lerped)
  totalCards: number; // Total number of cards
  selectCard: (index: number) => void; // Function to select a card
  nextCard: () => void; // Advance to next card
  previousCard: () => void; // Go to previous card
}

/**
 * Hook for managing orbital carousel state
 * Handles card selection, rotation angles, and smooth transitions
 *
 * @param totalCards - Total number of cards in the orbit
 * @returns Orbital state with selection and rotation tracking
 *
 * @example
 * const orbital = useOrbitalState(6); // 6 job cards
 * orbital.selectCard(2); // Select third card
 */
export function useOrbitalState(totalCards: number): OrbitalState {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [targetRotation, setTargetRotation] = useState(0);
  const currentRotationRef = useRef<number>(0);

  // Calculate target rotation based on selected card
  // Each card takes up (2π / totalCards) radians
  useEffect(() => {
    const anglePerCard = (Math.PI * 2) / totalCards;
    const newTargetRotation = selectedIndex * anglePerCard;
    setTargetRotation(newTargetRotation);
  }, [selectedIndex, totalCards]);

  const selectCard = (index: number) => {
    const validIndex = Math.max(0, Math.min(index, totalCards - 1));
    setSelectedIndex(validIndex);
  };

  const nextCard = () => {
    setSelectedIndex((prev) => (prev + 1) % totalCards);
  };

  const previousCard = () => {
    setSelectedIndex((prev) => (prev - 1 + totalCards) % totalCards);
  };

  return {
    selectedIndex,
    targetRotation,
    currentRotation: currentRotationRef,
    totalCards,
    selectCard,
    nextCard,
    previousCard
  };
}
