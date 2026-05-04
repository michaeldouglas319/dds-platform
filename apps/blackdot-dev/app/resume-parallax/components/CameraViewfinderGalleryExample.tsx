'use client'

import { Canvas } from '@react-three/fiber'
import { CameraViewfinderGallery, type GalleryItem } from '@/components/gallery'

/**
 * CameraViewfinderGalleryExample
 *
 * Demonstrates the gallery pattern with multiple 3D models
 * Shows how to build a portfolio or showcase multiple items
 *
 * Usage:
 * <CameraViewfinderGalleryExample />
 */

export function CameraViewfinderGalleryExample() {
  const galleryItems: GalleryItem[] = [
    {
      id: 'model-1',
      title: 'Product A - Golden',
      description: 'High-end product visualization with professional lighting',
      cameraProps: {
        fps: 60,
        iso: '100',
        aperture: 'F3.5',
        recording: true,
      },
      content: (
        <Canvas camera={{ position: [0, 0, 5] }}>
          <mesh>
            <boxGeometry args={[2, 2, 2]} />
            <meshPhongMaterial color="#fbbf24" />
          </mesh>
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} />
        </Canvas>
      ),
    },
    {
      id: 'model-2',
      title: 'Product B - Purple',
      description: 'Alternative design with gradient emphasis',
      cameraProps: {
        fps: 60,
        iso: '200',
        aperture: 'F2.0',
        recording: true,
      },
      content: (
        <Canvas camera={{ position: [0, 0, 5] }}>
          <mesh rotation={[0.2, 0.3, 0.1]}>
            <octahedronGeometry args={[1.5]} />
            <meshPhongMaterial color="#8b5cf6" />
          </mesh>
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 5, 5]} />
        </Canvas>
      ),
    },
    {
      id: 'model-3',
      title: 'Product C - Pink',
      description: 'Premium variant with enhanced camera settings',
      cameraProps: {
        fps: 60,
        iso: '400',
        aperture: 'F1.4',
        focalLength: '50mm',
        recording: true,
      },
      content: (
        <Canvas camera={{ position: [2, 2, 4] }}>
          <mesh rotation={[0.4, 0.5, 0.2]}>
            <tetrahedronGeometry args={[2]} />
            <meshPhongMaterial color="#ec4899" />
          </mesh>
          <ambientLight intensity={0.7} />
          <directionalLight position={[5, 5, 5]} intensity={1.2} />
        </Canvas>
      ),
    },
    {
      id: 'model-4',
      title: 'Product D - Blue',
      description: 'Minimal design showcasing simplicity',
      cameraProps: {
        fps: 60,
        iso: '100',
        aperture: 'F2.8',
        recording: false,
        showCorners: false,
      },
      content: (
        <Canvas camera={{ position: [0, 0, 5] }}>
          <mesh rotation={[0.3, 0.4, 0.1]}>
            <icosahedronGeometry args={[1.2]} />
            <meshPhongMaterial color="#3b82f6" />
          </mesh>
          <ambientLight intensity={0.8} />
          <directionalLight position={[5, 5, 5]} />
        </Canvas>
      ),
    },
  ]

  return (
    <div className="space-y-12">
      {/* Example 1: Standard Gallery */}
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold">Gallery with Thumbnails & Counter</h2>
          <p className="text-sm text-gray-400 mt-2">
            Navigate between products with arrow buttons and thumbnail previews
          </p>
        </div>
        <CameraViewfinderGallery
          items={galleryItems}
          showThumbnails={true}
          showCounter={true}
          onItemChange={(index) => console.log('Changed to item:', index)}
        />
      </div>

      {/* Example 2: Minimal Gallery (No Thumbnails) */}
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold">Gallery - Minimal (Navigation Only)</h2>
          <p className="text-sm text-gray-400 mt-2">
            Clean view with just navigation arrows and counter
          </p>
        </div>
        <CameraViewfinderGallery
          items={galleryItems.slice(0, 2)}
          showThumbnails={false}
          showCounter={true}
        />
      </div>

      {/* Example 3: Gallery with Auto-Rotate */}
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold">Gallery - Auto-Rotating</h2>
          <p className="text-sm text-gray-400 mt-2">
            Automatically cycles through products (3s per item)
          </p>
        </div>
        <CameraViewfinderGallery
          items={galleryItems}
          showThumbnails={true}
          showCounter={true}
          autoRotate={true}
          autoRotateDelay={3000}
        />
      </div>

      {/* Example 4: Single Row (Limited Items) */}
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold">Gallery - Feature Highlight</h2>
          <p className="text-sm text-gray-400 mt-2">
            Showcase top 3 products with descriptions
          </p>
        </div>
        <CameraViewfinderGallery
          items={galleryItems.slice(0, 3)}
          defaultIndex={0}
          showThumbnails={true}
          showCounter={true}
          className="max-w-2xl mx-auto"
        />
      </div>

      {/* Example 5: Dark Mode Variant */}
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold">Gallery - Compact Grid Layout</h2>
          <p className="text-sm text-gray-400 mt-2">
            Two columns for responsive display
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {galleryItems.slice(0, 2).map((item) => (
            <CameraViewfinderGallery
              key={item.id}
              items={[item]}
              showThumbnails={false}
              showCounter={false}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
