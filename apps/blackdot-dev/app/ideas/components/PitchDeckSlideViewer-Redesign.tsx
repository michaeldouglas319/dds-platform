'use client';

/**
 * Pitch Deck Slide Viewer
 * Displays individual slides with beautiful image-based design
 * Supports efficient loading of 3D models if configured
 * Falls back to gradient backgrounds for slides without models
 */

import React, { useState } from 'react';
import { Suspense } from 'react';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { UnifiedSection } from '@/lib/config/content';
import { SceneErrorBoundary } from '@/components/SceneErrorBoundary';
import dynamic from 'next/dynamic';

// Lazy load the model viewer component (must not use DOM in loading: used inside Canvas)
const LazyModelViewer = dynamic(
  () => import('./ModelViewerForSlide'),
  {
    loading: () => null,
    ssr: false
  }
);

interface PitchDeckSlideViewerProps {
  slide: UnifiedSection;
  slideNumber: number;
  totalSlides: number;
}

// Generate gradient colors based on slide index
function getGradientColor(index: number): [string, string] {
  const gradients: [string, string][] = [
    ['from-blue-600', 'to-blue-900'],
    ['from-purple-600', 'to-purple-900'],
    ['from-pink-600', 'to-pink-900'],
    ['from-green-600', 'to-green-900'],
    ['from-indigo-600', 'to-indigo-900'],
    ['from-cyan-600', 'to-cyan-900'],
    ['from-teal-600', 'to-teal-900'],
    ['from-amber-600', 'to-amber-900'],
  ];
  return gradients[index % gradients.length];
}

export default function PitchDeckSlideViewer({
  slide,
  slideNumber,
  totalSlides,
}: PitchDeckSlideViewerProps) {
  const [imageError, setImageError] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  const [gradFrom, gradTo] = getGradientColor(slideNumber);
  const hasModel = slide.modelConfig?.path;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full"
    >
      {/* Slide Container */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Left: Image/Visual Section */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="flex items-center justify-center"
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          <div className="relative w-full aspect-square rounded-2xl overflow-hidden shadow-2xl">
            {hasModel ? (
              // 3D Model Canvas — Canvas must be direct child of DOM container for R3F; error boundary wraps the container
              <SceneErrorBoundary
                fallback={
                  <div className="flex items-center justify-center w-full h-full bg-slate-900 text-slate-400 text-sm rounded-2xl">
                    Scene failed to load. Try refreshing.
                  </div>
                }
              >
                <Canvas
                  className="w-full h-full"
                  camera={{ position: [0, 0, 5], fov: 50 }}
                  gl={{
                    antialias: true,
                    powerPreference: 'high-performance',
                    alpha: true,
                  }}
                >
                  <ambientLight intensity={0.6} />
                  <directionalLight position={[5, 8, 5]} intensity={1.2} />
                  <pointLight position={[-5, 5, 5]} intensity={0.8} />
                  <fog attach="fog" args={['#0f172a', 5, 50]} />

                  <Suspense fallback={null}>
                    <LazyModelViewer modelPath={slide.modelConfig!.path!} />
                  </Suspense>

                  <OrbitControls
                    enableDamping
                    dampingFactor={0.05}
                    enableZoom
                    enablePan
                    autoRotate
                    autoRotateSpeed={2}
                    minDistance={2}
                    maxDistance={20}
                  />
                </Canvas>
              </SceneErrorBoundary>
            ) : (
              // Gradient Background Fallback
              <>
                {/* Gradient Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${gradFrom} ${gradTo} transition-all duration-700`} />

                {/* Image Placeholder with mouse tracking */}
                <div
                  className="absolute inset-0 flex items-center justify-center opacity-30"
                  style={
                    isHovering
                      ? {
                          background: `radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, rgba(255,255,255,0.1) 0%, transparent 70%)`,
                        }
                      : {}
                  }
                >
                  <div className="text-center pointer-events-none">
                    <div className="text-6xl md:text-7xl font-bold text-white/20 mb-4">{slideNumber.toString().padStart(2, '0')}</div>
                    <p className="text-white/20 text-lg">Slide {slideNumber} of {totalSlides}</p>
                  </div>
                </div>

                {/* Decorative elements */}
                <motion.div
                  animate={{
                    y: isHovering ? [0, -20, 0] : 0,
                    rotate: isHovering ? 360 : 0,
                  }}
                  transition={{
                    duration: isHovering ? 4 : 20,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div className="w-48 h-48 md:w-64 md:h-64 border-2 border-white/10 rounded-full" />
                </motion.div>

                {/* Border shine effect */}
                <div className="absolute inset-0 rounded-2xl border-2 border-white/20 pointer-events-none" />
              </>
            )}
          </div>
        </motion.div>

        {/* Right: Content Section */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-col justify-center"
        >
          {/* Slide Number Badge */}
          <div className="inline-flex items-center gap-2 mb-6 w-fit">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-400 to-purple-400" />
            <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
              Slide {slideNumber} of {totalSlides}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
            {slide.title}
          </h1>

          {/* Subtitle */}
          {slide.subtitle && (
            <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
              {slide.subtitle}
            </p>
          )}

          {/* Content Sections */}
          <div className="space-y-8">
            {/* Paragraphs */}
            {slide.content?.paragraphs?.map((para, idx) => {
              const isObject = typeof para === 'object' && para !== null && 'description' in para;
              if (!isObject) return null;

              const p = para as any;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 + idx * 0.1 }}
                  className="border-l-4 border-blue-500 pl-4"
                >
                  {p.subtitle && <h3 className="text-lg font-semibold text-white mb-2">{p.subtitle}</h3>}
                  <p className="text-gray-300 leading-relaxed">{p.description}</p>
                </motion.div>
              );
            })}

            {/* Highlights */}
            {slide.content?.highlights && slide.content.highlights.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 pt-8 border-t border-slate-700/50">
                {slide.content.highlights.map((highlight, idx) => {
                  const isObject = typeof highlight === 'object' && highlight !== null;
                  if (!isObject) return null;

                  const h = highlight as any;
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.5 + idx * 0.1 }}
                      className="bg-slate-800/30 backdrop-blur-sm rounded-lg p-4 border border-slate-700/50 hover:border-blue-500/50 transition-colors"
                    >
                      {h.subtitle && <h4 className="text-sm font-semibold text-blue-400 mb-1">{h.subtitle}</h4>}
                      <p className="text-sm text-gray-300">{h.description}</p>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* Stats */}
            {slide.content?.stats && slide.content.stats.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 pt-8 border-t border-slate-700/50">
                {slide.content.stats.map((stat, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 + idx * 0.1 }}
                    className="text-center p-4"
                  >
                    <p className="text-2xl md:text-3xl font-bold text-white">{stat.value}</p>
                    <p className="text-sm text-gray-400 mt-1">{stat.label}</p>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
