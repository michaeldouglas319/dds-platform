import { useEffect, useRef, useState, useMemo } from 'react';
import { TransitionConfig } from '../config/cycling.config';

interface MorphingTextProps {
  words?: string[];
  onMorphComplete?: (word: string, elementRef?: HTMLElement) => void;
  displayDuration?: number;
  transitionDuration?: number;
  transitionConfig?: TransitionConfig;
}

export function MorphingText({
  words = ['ADAPTATION', 'INNOVATION', 'COMPETITION'],
  onMorphComplete,
  displayDuration = 3,
  transitionDuration = 0.6,
  transitionConfig,
}: MorphingTextProps) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Stabilize words array
  const stableWords = useMemo(() => words, [words.join(',')]);

  // Use provided transition config or create default based on type
  const transition = transitionConfig || {
    type: 'fade' as const,
    duration: transitionDuration,
    easing: 'ease-in-out',
  };

  // Cycle through words at specified interval
  useEffect(() => {
    const cycleInterval = displayDuration + transition.duration;
    const wordCount = stableWords.length;

    const timer = setInterval(() => {
      setActiveIndex((prev) => {
        const nextIndex = (prev + 1) % wordCount;

        // Trigger callback at transition start
        if (onMorphComplete) {
          const activeElement = containerRef.current?.querySelector(
            `[data-word-index="${nextIndex}"]`
          ) as HTMLElement;
          onMorphComplete(stableWords[nextIndex], activeElement || undefined);
        }

        return nextIndex;
      });
    }, cycleInterval * 1000);

    return () => clearInterval(timer);
  }, [displayDuration, transition.duration, onMorphComplete, stableWords]);
  
  return (
    <span
      ref={containerRef}
      className="inline-block relative h-[1em] align-middle font-black text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl leading-[0.74em] tracking-tight text-foreground"
    >
      {words.map((word, wordIndex) => {
        const isActive = wordIndex === activeIndex;

        return (
          <span
            key={word}
            data-word-index={wordIndex}
            className="absolute left-0 top-0 whitespace-nowrap"
            style={{
              opacity: isActive ? 1 : 0,
              transform: getTransformForTransition(transition, !isActive),
              transition: `all ${transition.duration}s ${transition.easing}`,
              pointerEvents: isActive ? 'auto' : 'none',
            }}
          >
            {word}
          </span>
        );
      })}
    </span>
  );
}

// Helper function to generate transform based on transition type
function getTransformForTransition(
  transition: TransitionConfig,
  isHidden: boolean
): string {
  if (!isHidden) return 'translateX(0) translateY(0) scale(1) rotate(0deg)';

  const direction = transition.direction || 'left';
  const scaleFrom = transition.scaleRange?.[1] ?? 1;
  const rotation = transition.rotation ?? 0;

  let translateX = 0,
    translateY = 0;

  if (transition.type === 'slide' || transition.type === 'slideScale') {
    switch (direction) {
      case 'left':
        translateX = 50;
        break;
      case 'right':
        translateX = -50;
        break;
      case 'up':
        translateY = 50;
        break;
      case 'down':
        translateY = -50;
        break;
    }
  }

  return `translateX(${translateX}px) translateY(${translateY}px) scale(${scaleFrom}) rotate(${rotation}deg)`;
}
