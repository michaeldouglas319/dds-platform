'use client';

import type { ReactNode } from 'react';

interface BrandHeadingProps {
  children?: ReactNode;
  className?: string;
}

export function BrandHeading({ children, className }: BrandHeadingProps) {
  return (
    <h1 className={className} style={{
      fontSize: 'clamp(2.5rem, 7vw, 5.5rem)',
      fontWeight: 800,
      letterSpacing: '-0.03em',
      lineHeight: 1.05,
      margin: 0,
      textAlign: 'center',
    }}>
      <span style={{ opacity: 0.3, fontWeight: 300, fontSize: '0.5em' }}>The</span>
      {' '}
      <span style={{ opacity: 0.4, fontWeight: 400 }}>Age of</span>
      <br />
      <span>Abundance</span>
      {children && (
        <span style={{
          display: 'block',
          fontSize: '0.4em',
          fontWeight: 500,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          opacity: 0.5,
          marginTop: '0.5em',
        }}>
          {children}
        </span>
      )}
    </h1>
  );
}
