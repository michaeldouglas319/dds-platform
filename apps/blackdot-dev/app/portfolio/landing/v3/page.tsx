'use client';

import { Suspense } from 'react';
import { LandingV3 } from '@/app/portfolio/pages/landings';

export default function LandingV3Page() {
  return (
    <Suspense fallback={<div style={{ width: '100vw', height: '100vh', background: '#0a0a0f' }} />}>
      <LandingV3 />
    </Suspense>
  );
}
