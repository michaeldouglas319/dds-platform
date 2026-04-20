import { Suspense } from 'react'
import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import './arms.css'

const ArmsExperience = dynamic(
  () => import('../../components/arms/ArmsExperience'),
  { ssr: false, loading: () => <div className="arms-loading-shell" /> }
)

export const metadata: Metadata = {
  title: 'Abundance at Arms — Global Conflict Map',
  description:
    'Real-time conflict mapping with integrated intelligence, research articles, and source data.',
  robots: 'noindex, nofollow', // Not for search indexing
}

export default function ArmsPage() {
  return (
    <main className="arms-page-root" data-arms-experience>
      <div className="arms-layout">
        <div className="arms-canvas-wrapper">
          <Suspense fallback={<div className="arms-loading-shell" />}>
            <ArmsExperience />
          </Suspense>
        </div>
      </div>
    </main>
  )
}
