'use client'

import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { CameraViewfinder } from '@/components/primitives'
import { CameraViewfinderGallery, type GalleryItem } from '@/components/gallery'

/**
 * Test Page for CameraViewfinder Components
 *
 * Test all variants and configurations before integration
 * Access at: http://localhost:3000/test-camera
 */

// Sample 3D model component
function SampleModel({ color }: { color: string }) {
  return (
    <Canvas camera={{ position: [0, 0, 5] }}>
      <mesh>
        <boxGeometry args={[2, 2, 2]} />
        <meshPhongMaterial color={color} />
      </mesh>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} />
    </Canvas>
  )
}

function TestSection({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <section className="border-t border-slate-700 pt-8 pb-12">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">{title}</h2>
        <p className="text-gray-400 text-sm">{description}</p>
      </div>
      {children}
    </section>
  )
}

export default function TestCameraViewfinder() {
  const [recordingState, setRecordingState] = useState(true)
  const [cornersVisible, setCornersVisible] = useState(true)
  const [showCompact, setShowCompact] = useState(false)

  // Gallery test items
  const galleryItems: GalleryItem[] = [
    {
      id: 'test-1',
      title: 'Model A - Gold',
      description: 'Professional camera settings with recording',
      cameraProps: { fps: 60, iso: '100', aperture: 'F3.5' },
      content: <SampleModel color="#fbbf24" />,
    },
    {
      id: 'test-2',
      title: 'Model B - Purple',
      description: 'Shallow depth of field',
      cameraProps: { fps: 60, iso: '200', aperture: 'F1.4', focalLength: '50mm' },
      content: <SampleModel color="#8b5cf6" />,
    },
    {
      id: 'test-3',
      title: 'Model C - Pink',
      description: 'Cinema framerate',
      cameraProps: { fps: 24, iso: '400', aperture: 'F2.0' },
      content: <SampleModel color="#ec4899" />,
    },
    {
      id: 'test-4',
      title: 'Model D - Blue',
      description: 'Minimal settings',
      cameraProps: { fps: 60, iso: '100', aperture: 'F3.5', recording: false },
      content: <SampleModel color="#3b82f6" />,
    },
  ]

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur border-b border-slate-700 px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">CameraViewfinder Test Suite</h1>
          <p className="text-gray-400">Test variants and configurations before integration</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* Test Controls */}
        <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 mb-12">
          <h3 className="text-lg font-semibold mb-4">Global Test Controls</h3>
          <div className="grid grid-cols-3 gap-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={recordingState}
                onChange={(e) => setRecordingState(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm">Recording Indicator: {recordingState ? 'ON' : 'OFF'}</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={cornersVisible}
                onChange={(e) => setCornersVisible(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm">Corner Brackets: {cornersVisible ? 'ON' : 'OFF'}</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={showCompact}
                onChange={(e) => setShowCompact(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm">Compact Variant: {showCompact ? 'SQUARE' : 'VIDEO'}</span>
            </label>
          </div>
        </div>

        {/* Test 1: Default Camera Viewfinder */}
        <TestSection
          title="Test 1: Default CameraViewfinder"
          description="Standard 16:9 aspect ratio with full camera metadata display"
        >
          <div className="max-w-2xl">
            <CameraViewfinder
              fps={60}
              resolution="HD"
              iso="100"
              aperture="F3.5"
              recording={recordingState}
              showCorners={cornersVisible}
            >
              <SampleModel color="#fbbf24" />
            </CameraViewfinder>
          </div>
        </TestSection>

        {/* Test 2: Compact Variant */}
        <TestSection
          title="Test 2: Compact Variant (Square)"
          description="1:1 aspect ratio for product showcase"
        >
          <div className="max-w-md">
            <CameraViewfinder
              variant="compact"
              fps={60}
              iso="200"
              aperture="F2.0"
              recording={recordingState}
              showCorners={cornersVisible}
            >
              <SampleModel color="#8b5cf6" />
            </CameraViewfinder>
          </div>
        </TestSection>

        {/* Test 3: With All Camera Settings */}
        <TestSection
          title="Test 3: Full Camera Metadata"
          description="All camera settings displayed (fps, iso, aperture, focal length)"
        >
          <div className="max-w-2xl">
            <CameraViewfinder
              fps={24}
              resolution="4K"
              iso="400"
              aperture="F1.4"
              focalLength="85mm"
              recording={true}
              showCorners={true}
            >
              <SampleModel color="#ec4899" />
            </CameraViewfinder>
          </div>
        </TestSection>

        {/* Test 4: Minimal Config (No Recording/Corners) */}
        <TestSection
          title="Test 4: Minimal Configuration"
          description="No recording indicator, no corner brackets, camera info only"
        >
          <div className="max-w-2xl">
            <CameraViewfinder
              fps={60}
              iso="100"
              aperture="F3.5"
              recording={false}
              showCorners={false}
              className="rounded-xl shadow-lg"
            >
              <SampleModel color="#3b82f6" />
            </CameraViewfinder>
          </div>
        </TestSection>

        {/* Test 5: Multiple Variants Side-by-Side */}
        <TestSection
          title="Test 5: Comparison - Different Camera Settings"
          description="Side-by-side comparison with different camera profiles"
        >
          <div className="grid grid-cols-3 gap-4">
            {/* Wide aperture (portrait) */}
            <div>
              <p className="text-xs text-gray-400 mb-2 font-semibold">Wide Aperture (Portrait)</p>
              <CameraViewfinder
                variant="compact"
                fps={60}
                iso="100"
                aperture="F1.4"
                focalLength="85mm"
                recording={false}
              >
                <SampleModel color="#06b6d4" />
              </CameraViewfinder>
            </div>

            {/* Normal (standard) */}
            <div>
              <p className="text-xs text-gray-400 mb-2 font-semibold">Standard</p>
              <CameraViewfinder
                variant="compact"
                fps={60}
                iso="100"
                aperture="F3.5"
                recording={false}
              >
                <SampleModel color="#fbbf24" />
              </CameraViewfinder>
            </div>

            {/* Deep aperture (landscape) */}
            <div>
              <p className="text-xs text-gray-400 mb-2 font-semibold">Deep Depth (Landscape)</p>
              <CameraViewfinder
                variant="compact"
                fps={60}
                iso="100"
                aperture="F8.0"
                focalLength="24mm"
                recording={false}
              >
                <SampleModel color="#10b981" />
              </CameraViewfinder>
            </div>
          </div>
        </TestSection>

        {/* Test 6: Gallery - With Thumbnails */}
        <TestSection
          title="Test 6: Gallery with Thumbnails & Counter"
          description="Navigation with thumbnail previews and item counter"
        >
          <CameraViewfinderGallery
            items={galleryItems}
            showThumbnails={true}
            showCounter={true}
            onItemChange={(idx) => console.log('Gallery item changed to:', idx)}
          />
        </TestSection>

        {/* Test 7: Gallery - Minimal (No Thumbnails) */}
        <TestSection
          title="Test 7: Gallery - Minimal Navigation"
          description="Only arrow buttons and counter, no thumbnail previews"
        >
          <CameraViewfinderGallery
            items={galleryItems.slice(0, 2)}
            showThumbnails={false}
            showCounter={true}
          />
        </TestSection>

        {/* Test 8: Gallery - Auto-Rotate */}
        <TestSection
          title="Test 8: Gallery - Auto-Rotating"
          description="Automatically cycles through items (3 seconds per item)"
        >
          <CameraViewfinderGallery
            items={galleryItems.slice(0, 3)}
            showThumbnails={true}
            showCounter={true}
            autoRotate={true}
            autoRotateDelay={3000}
          />
        </TestSection>

        {/* Test 9: Gallery - Compact Grid */}
        <TestSection
          title="Test 9: Gallery - Grid Layout"
          description="Multiple galleries in a 2-column grid"
        >
          <div className="grid grid-cols-2 gap-6">
            {galleryItems.slice(0, 2).map((item) => (
              <CameraViewfinderGallery key={item.id} items={[item]} showThumbnails={false} />
            ))}
          </div>
        </TestSection>

        {/* Test 10: Interactive Toggle */}
        <TestSection
          title="Test 10: Interactive Controls"
          description="Use toggles above to dynamically change this viewfinder"
        >
          <div className="max-w-2xl">
            <CameraViewfinder
              variant={showCompact ? 'compact' : 'default'}
              fps={60}
              resolution={showCompact ? 'HD' : '4K'}
              iso="100"
              aperture="F3.5"
              recording={recordingState}
              showCorners={cornersVisible}
              className={showCompact ? 'max-w-md' : ''}
            >
              <SampleModel color="#a855f7" />
            </CameraViewfinder>
          </div>
        </TestSection>

        {/* Test 11: Responsive - Mobile View */}
        <TestSection
          title="Test 11: Responsive Design"
          description="Test how gallery responds on different screen sizes"
        >
          <div className="space-y-8">
            {/* Desktop */}
            <div>
              <p className="text-xs text-gray-400 mb-2 font-semibold">Desktop (Full)</p>
              <CameraViewfinderGallery
                items={galleryItems}
                showThumbnails={true}
                showCounter={true}
              />
            </div>

            {/* Mobile simulation */}
            <div>
              <p className="text-xs text-gray-400 mb-2 font-semibold">Mobile (Thumbnail-less)</p>
              <div className="max-w-md mx-auto">
                <CameraViewfinderGallery
                  items={galleryItems}
                  showThumbnails={false}
                  showCounter={true}
                />
              </div>
            </div>
          </div>
        </TestSection>

        {/* Test 12: Performance - Many Items */}
        <TestSection
          title="Test 12: Performance - Large Gallery"
          description="Test with maximum recommended items (8 models)"
        >
          <CameraViewfinderGallery
            items={[
              ...galleryItems,
              {
                id: 'test-5',
                title: 'Model E - Cyan',
                description: 'Extended gallery test',
                content: <SampleModel color="#06b6d4" />,
              },
              {
                id: 'test-6',
                title: 'Model F - Green',
                description: 'Performance validation',
                content: <SampleModel color="#10b981" />,
              },
              {
                id: 'test-7',
                title: 'Model G - Red',
                description: 'Stress test',
                content: <SampleModel color="#ef4444" />,
              },
              {
                id: 'test-8',
                title: 'Model H - Orange',
                description: 'Final item',
                content: <SampleModel color="#f97316" />,
              },
            ]}
            showThumbnails={true}
            showCounter={true}
          />
        </TestSection>

        {/* Test Summary */}
        <section className="border-t border-slate-700 pt-8 pb-12">
          <h2 className="text-2xl font-bold mb-6">Test Summary Checklist</h2>
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <label className="flex items-start gap-3">
                <input type="checkbox" className="w-4 h-4 mt-0.5" />
                <span>✓ Camera metadata displays correctly</span>
              </label>
              <label className="flex items-start gap-3">
                <input type="checkbox" className="w-4 h-4 mt-0.5" />
                <span>✓ Recording indicator shows/hides</span>
              </label>
              <label className="flex items-start gap-3">
                <input type="checkbox" className="w-4 h-4 mt-0.5" />
                <span>✓ Corner brackets appear correctly</span>
              </label>
              <label className="flex items-start gap-3">
                <input type="checkbox" className="w-4 h-4 mt-0.5" />
                <span>✓ Compact variant squares properly</span>
              </label>
              <label className="flex items-start gap-3">
                <input type="checkbox" className="w-4 h-4 mt-0.5" />
                <span>✓ Gallery navigation works smoothly</span>
              </label>
              <label className="flex items-start gap-3">
                <input type="checkbox" className="w-4 h-4 mt-0.5" />
                <span>✓ Thumbnails clickable and responsive</span>
              </label>
              <label className="flex items-start gap-3">
                <input type="checkbox" className="w-4 h-4 mt-0.5" />
                <span>✓ Auto-rotate cycles properly</span>
              </label>
              <label className="flex items-start gap-3">
                <input type="checkbox" className="w-4 h-4 mt-0.5" />
                <span>✓ Performance acceptable with many items</span>
              </label>
              <label className="flex items-start gap-3">
                <input type="checkbox" className="w-4 h-4 mt-0.5" />
                <span>✓ Responsive on different screen sizes</span>
              </label>
              <label className="flex items-start gap-3">
                <input type="checkbox" className="w-4 h-4 mt-0.5" />
                <span>✓ Ready for integration</span>
              </label>
            </div>
          </div>
        </section>

        {/* Notes */}
        <section className="border-t border-slate-700 pt-8 pb-12">
          <h2 className="text-lg font-semibold mb-4">Notes & Observations</h2>
          <textarea
            className="w-full h-24 bg-slate-900 border border-slate-700 rounded-lg p-4 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Document any issues, observations, or adjustments needed before committing..."
          />
        </section>
      </div>
    </div>
  )
}
