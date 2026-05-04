'use client'

import { useState, useEffect, useRef } from 'react';

interface UseMountAnimationOptions {
  easing?: (t: number) => number;
  duration?: number;
  delay?: number;
  animateRotation?: boolean;
}

interface MountAnimationState {
  scale: number;
  rotation?: number;
  opacity?: number;
}

// Common easing functions
const easings = {
  linear: (t: number) => t,
  easeInOut: (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  easeOut: (t: number) => t * (2 - t),
  easeIn: (t: number) => t * t,
  easeOutCubic: (t: number) => --t * t * t + 1,
  mount: (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t, // easeInOut for mount
};

export function getRecommendedEasing(type: 'mount' | 'hover' | 'click'): (t: number) => number {
  switch (type) {
    case 'mount':
      return easings.mount;
    case 'hover':
      return easings.easeOut;
    case 'click':
      return easings.easeOutCubic;
    default:
      return easings.linear;
  }
}

export function useMountAnimation(options: UseMountAnimationOptions = {}): MountAnimationState {
  const {
    easing = easings.easeInOut,
    duration = 1000,
    delay = 0,
    animateRotation = false,
  } = options;

  const [scale, setScale] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [opacity, setOpacity] = useState(0);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const startTimeRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const startAnimation = () => {
      startTimeRef.current = performance.now();

      const animate = (currentTime: number) => {
        if (!startTimeRef.current) return;

        const elapsed = currentTime - startTimeRef.current;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easing(progress);

        setScale(easedProgress);
        setOpacity(easedProgress);

        if (animateRotation) {
          setRotation(easedProgress * Math.PI * 2);
        }

        if (progress < 1) {
          animationFrameRef.current = requestAnimationFrame(animate);
        }
      };

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    const timeoutId = setTimeout(startAnimation, delay);

    return () => {
      clearTimeout(timeoutId);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [duration, delay, easing, animateRotation]);

  return { scale, rotation, opacity };
}
