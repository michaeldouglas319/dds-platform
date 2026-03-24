'use client';

import type { ReactNode } from 'react';

interface BrandHeadingProps {
  children?: ReactNode;
  className?: string;
}

/**
 * Shared brand heading: "Age of Abundance"
 * Pass a child to get "Age of Abundance: {child}"
 *
 * <BrandHeading />              → "Age of Abundance"
 * <BrandHeading>Shop</BrandHeading> → "Age of Abundance: Shop"
 */
export function BrandHeading({ children, className }: BrandHeadingProps) {
  return (
    <h1 className={className} style={{
      fontSize: 'clamp(2rem, 5vw, 4rem)',
      fontWeight: 700,
      letterSpacing: '-0.02em',
      lineHeight: 1.1,
      margin: 0,
    }}>
      <span style={{ opacity: 0.6 }}>Age of</span>{' '}
      <span>Abundance</span>
      {children && (
        <>
          <span style={{ opacity: 0.3, margin: '0 0.3em' }}>:</span>
          <span>{children}</span>
        </>
      )}
    </h1>
  );
}
