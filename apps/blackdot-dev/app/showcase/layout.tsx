/**
 * Showcase Layout
 *
 * Development-only layout for the component showcase.
 * Only rendered in development mode.
 */

import React from 'react';

export const metadata = {
  title: 'Component Showcase - Development Only',
  description: 'Interactive catalog of all components in the DDS V3 codebase'
};

interface ShowcaseLayoutProps {
  children: React.ReactNode;
}

export default function ShowcaseLayout({ children }: ShowcaseLayoutProps) {
  return <div className="w-full h-full">{children}</div>;
}
