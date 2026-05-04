/**
 * Cycling Text Component
 * Reusable component for animated text that cycles through words
 * Based on the MorphingText pattern from landing page
 */

import { useEffect, useRef } from 'react';

export interface CyclingTextProps {
  /** Array of words to cycle through */
  words?: string[];
  /** Callback when a word transition completes */
  onWordChange?: (word: string, elementRef?: HTMLElement) => void;
  /** Time each word stays in view (seconds) */
  timeInView?: number;
  /** Custom className for styling */
  className?: string;
  /** Custom style for the container */
  style?: React.CSSProperties;
}

export function CyclingText({ 
  words = ['ADAPTATION', 'INNOVATION', 'COMPETITION'],
  onWordChange,
  timeInView = 3,
  className = '',
  style,
}: CyclingTextProps) {
  const containerRef = useRef<HTMLSpanElement>(null);
  
  // Internal timing constants derived from the master value
  const wordDelay = timeInView;
  const baseDurationPerWord = words.length * wordDelay; // Duration equals total cycle time
  const transitionStart = 0.18; // Point where it's fully gone (matched to 18% keyframe)
  
  // Trigger callback when each word transitions away
  useEffect(() => {
    if (!onWordChange) return;
    
    const intervals: NodeJS.Timeout[] = [];
    const timeouts: NodeJS.Timeout[] = [];
    
    words.forEach((word, index) => {
      const wordStartDelay = index * wordDelay;
      const triggerOffset = baseDurationPerWord * transitionStart;
      
      const triggerCallback = () => {
        const activeWordElement = containerRef.current?.querySelector(
          `span:nth-child(${index + 1})`
        ) as HTMLElement;
        onWordChange(word, activeWordElement || undefined);
      };
      
      const initialTimeout = setTimeout(triggerCallback, (wordStartDelay + triggerOffset) * 1000);
      timeouts.push(initialTimeout);
      
      const interval = setInterval(triggerCallback, baseDurationPerWord * 1000);
      intervals.push(interval);
    });
    
    return () => {
      intervals.forEach(interval => clearInterval(interval));
      timeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, [onWordChange, words, baseDurationPerWord, wordDelay, transitionStart]);
  
  const defaultClassName = "inline-block relative h-[1em] align-middle font-black text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl leading-[0.74em] tracking-tight text-foreground";
  const combinedClassName = className || defaultClassName;
  
  return (
    <span 
      ref={containerRef}
      className={combinedClassName}
      style={style}
    >
      {words.map((word, wordIndex) => {
        const delay = wordIndex * wordDelay; // 0s, 1s, 2s, 3s... scaled by wordDelay
        
        return (
          <span
            key={word}
            className="absolute left-0 top-0 whitespace-nowrap"
            style={{
              animation: `roll ${baseDurationPerWord}s linear infinite ${delay}s`,
              fontSize: '0px',
              opacity: 0,
              marginLeft: '-30px',
              marginTop: '0px',
              position: 'absolute',
              fontWeight: 300,
              animationFillMode: 'both',
            }}
          >
            {word}
          </span>
        );
      })}
      <style>{`
        @keyframes roll {
          0% {
            font-size: 0px;
            opacity: 0;
            margin-left: 800px;
            margin-top: 200px;
            transform: rotate(15deg);
          }
          3% {
            opacity: 0.5;
            transform: rotate(0deg);
          }
          5% {
            font-size: inherit;
            opacity: 1;
            margin-left: 0px;
            margin-top: 0px;
          }
          10% {
            font-size: inherit;
            opacity: 1;
            margin-left: 0px;
            margin-top: 0px;
            transform: rotate(0deg);
          }
          38% {
            font-size: 0px;
            opacity: 0.5;
            margin-left: 400px;
            margin-top: 300px;
          }
          100% {
            font-size: 0px;
            opacity: 0;
            margin-left: 600px;
            margin-top: 1000px;
            transform: rotate(15deg);
          }
        }
      `}</style>
    </span>
  );
}

export default CyclingText;

