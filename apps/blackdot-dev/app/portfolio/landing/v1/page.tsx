'use client';

import { Suspense } from 'react';
import { LandingV1 } from '@/app/portfolio/pages/landings';

export default function LandingV1Page() {
  return (
    <Suspense fallback={<div style={{ width: '100vw', height: '100vh', background: '#0a0a0f' }} />}>
      <LandingV1 />
    </Suspense>
  );
}
