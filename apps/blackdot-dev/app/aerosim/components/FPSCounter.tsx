'use client';

import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';

interface FPSCounterProps {
  onFrame: () => void;
  isRunning: boolean;
}

/**
 * FPSCounter - Tracks frames and calls onFrame callback
 * Used to update FPS statistics in parent component
 */
export function FPSCounter({ onFrame, isRunning }: FPSCounterProps) {
  const frameCountRef = useRef(0);
  
  useFrame(() => {
    if (isRunning) {
      frameCountRef.current += 1;
      onFrame();
    }
  });
  
  return null;
}

