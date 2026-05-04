'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import DebugPanel from '@/app/portfolio/components/DebugPanel';

const LandingV4 = dynamic(
  () => import('@/app/portfolio/pages/landings/LandingV4').then(m => m.LandingV4),
  { ssr: false }
);

export default function LandingPage() {
  return (
    <Suspense fallback={<div style={{ width: '100vw', height: '100vh', background: '#0a0a0f' }} />}>
      <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
        <LandingV4 />
        <DebugPanel />
      </div>
    </Suspense>
  );
}
