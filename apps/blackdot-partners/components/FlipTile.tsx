'use client';

import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';

export interface FlipTileProps {
  front: ReactNode;
  back: ReactNode;
  flipDelay?: number;
  flipDuration?: number;
  autoFlip?: boolean;
  clickToFlip?: boolean;
  size?: number;
  borderRadius?: number;
  className?: string;
  style?: CSSProperties;
  'aria-label'?: string;
}

function FlipTile({
  front,
  back,
  flipDelay = 900,
  flipDuration = 800,
  autoFlip = true,
  clickToFlip = false,
  size = 72,
  borderRadius = 14,
  className,
  style,
  'aria-label': ariaLabel,
}: FlipTileProps): JSX.Element {
  const [flipped, setFlipped] = useState<boolean>(false);

  useEffect(() => {
    if (!autoFlip) return;
    const id = window.setTimeout(() => setFlipped(true), flipDelay);
    return () => window.clearTimeout(id);
  }, [autoFlip, flipDelay]);

  const handleClick = (): void => {
    if (clickToFlip) setFlipped((f) => !f);
  };

  const wrapperStyle: CSSProperties = {
    width: size,
    height: size,
    perspective: 1000,
    display: 'inline-block',
    cursor: clickToFlip ? 'pointer' : 'default',
    ...style,
  };

  const innerStyle: CSSProperties = {
    position: 'relative',
    width: '100%',
    height: '100%',
    transformStyle: 'preserve-3d',
    transition: `transform ${flipDuration}ms ease`,
    transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
  };

  const faceStyle: CSSProperties = {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    WebkitBackfaceVisibility: 'hidden',
    backfaceVisibility: 'hidden',
    borderRadius,
    overflow: 'hidden',
  };

  const backStyle: CSSProperties = {
    ...faceStyle,
    transform: 'rotateY(180deg)',
  };

  return (
    <div
      className={className}
      style={wrapperStyle}
      onClick={handleClick}
      aria-label={ariaLabel}
    >
      <div style={innerStyle}>
        <div style={faceStyle}>{front}</div>
        <div style={backStyle}>{back}</div>
      </div>
    </div>
  );
}

export default FlipTile;
