import type { ReactNode } from 'react';

export function LandingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="landing-layout">
      {children}
    </div>
  );
}
