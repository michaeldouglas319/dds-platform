'use client'

import { Suspense } from 'react'
import { SceneAnnotation } from './components/SceneAnnotation'
import { CardLayout } from './components/CardLayout'
import { ModelRings } from './components/ModelRings'
import { ModelRenderer } from '../components/ModelRenderer'
import type { JobSection } from '@/lib/config/content/resume-data.config'

interface ShowcaseSceneProps {
  jobs: JobSection[]
  selectedIndex: number
  onSelectJob: (index: number) => void
}

/**
 * ShowcaseScene Component
 *
 * Main 3D scene orchestrator that renders:
 * - Multiple job cards arranged in arc layout
 * - Central model with decorative rings
 * - Lighting and environment setup
 *
 * @category composite
 * @layer 2
 */
export function ShowcaseScene({
  jobs,
  selectedIndex,
  onSelectJob
}: ShowcaseSceneProps) {
  const selectedJob = jobs[selectedIndex]

  // Position info annotation at top
  const getInfoPosition = (): [number, number, number] => [0, 6, 0]

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.7} />
      <directionalLight position={[10, 12, 5]} intensity={0.8} />

      {/* Test cube */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color="#ff0000" />
      </mesh>

      {/* LAYER 2: CardLayout with generative card system */}
      {selectedJob && (
        <CardLayout
          job={selectedJob}
          layout="arc"
          scale={0.6}
        />
      )}

      {/* LAYER 3: ModelRings component */}
      {selectedJob && (
        <ModelRings color={selectedJob.color} scale={1} />
      )}

      {/* LAYER 4: ModelRenderer component */}
      {selectedJob && selectedJob.modelType && (
        <Suspense fallback={null}>
          <ModelRenderer
            modelType={selectedJob.modelType}
            color={selectedJob.color}
            position={[0, 0, 0]}
            rotation={selectedJob.rotation || [0, 0, 0]}
          />
        </Suspense>
      )}

      {/* LAYER 5-6: Consolidated into JobInfoCard (more efficient) */}
      {/* Details are now shown in the main JobInfoCard with all highlights */}
    </>
  )
}
