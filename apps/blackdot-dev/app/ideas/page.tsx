'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Briefcase, Umbrella, Factory, Presentation, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { SceneErrorBoundary } from '@/components/SceneErrorBoundary';
import { NeuralNetworkScene } from '@/app/resumev3/scene/components/NeuralNetworkScene';
import { Suspense } from 'react';
import { usePathnameBreadcrumbs } from '@/lib/contexts';
import { ideasPitchDeckSections } from '@/lib/config/content/ideas-pitch-deck.config';
import { ideasPitchDeckExtended } from '@/app/ideas/config/ideasPitchDeck-extended.config';
import { DisplayMode, InvestorLevel, ContentType, ContentImportance, SlideCategoryPrimary } from '@/lib/config/taxonomy';
import PitchDeckSlideViewerRedesign from './components/PitchDeckSlideViewer-Redesign';
import SlideThumbnailCarouselRedesign from './components/SlideThumbnailCarousel-Redesign';
import type { SlideWithTaxonomy } from '@/lib/config/taxonomy';
import type { UnifiedSection } from '@/lib/config/content';

export default function IdeasPage() {
  const router = useRouter();
  const [showPitchDeck, setShowPitchDeck] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Set breadcrumbs for ideas page
  usePathnameBreadcrumbs();

  // Get extended pitch deck slides (16 slides)
  const extendedSlides = ideasPitchDeckExtended as UnifiedSection[];

  // Keyboard navigation for pitch deck
  useEffect(() => {
    if (!showPitchDeck) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        setCurrentSlide((prev) => (prev + 1) % extendedSlides.length);
      } else if (e.key === 'ArrowLeft') {
        setCurrentSlide((prev) => (prev - 1 + extendedSlides.length) % extendedSlides.length);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showPitchDeck, extendedSlides.length]);

  const goToPreviousSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + extendedSlides.length) % extendedSlides.length);
  }, [extendedSlides.length]);

  const goToNextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % extendedSlides.length);
  }, [extendedSlides.length]);

  // Cast pitch deck sections to SlideWithTaxonomy
  const pitchDeckSlides: SlideWithTaxonomy[] = ideasPitchDeckSections.map((section) => ({
    id: section.id,
    title: section.title,
    subtitle: section.subtitle,
    content: {
      paragraphs: section.content?.paragraphs?.filter(
        (p) => typeof p === 'object' && 'subtitle' in p && 'description' in p
      ),
      highlights: section.content?.highlights?.filter(
        (h) => typeof h === 'object' && 'subtitle' in h && 'description' in h
      ),
      stats: section.content?.stats,
    },
    // Add minimal taxonomy - all slides visible to all investors
    taxonomy: {
      primary: SlideCategoryPrimary.SOLUTION,
      investorLevel: InvestorLevel.ALL,
      contentTypes: [ContentType.NARRATIVE],
      importance: ContentImportance.HIGH,
    },
  }));

  // Pitch Deck with New Redesigned Viewer
  if (showPitchDeck) {
    const currentSlideData = extendedSlides[currentSlide];

    return (
      <div className="w-full min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 overflow-hidden">
        {/* Main Content */}
        <div className="relative">
          {/* Main Slide Viewer */}
          <div className="min-h-screen flex flex-col">
            <div className="flex-1 flex items-center justify-center px-4 py-12">
              <div className="w-full max-w-6xl">
                <PitchDeckSlideViewerRedesign
                  slide={currentSlideData}
                  slideNumber={currentSlide + 1}
                  totalSlides={extendedSlides.length}
                />
              </div>
            </div>

            {/* Navigation Controls */}
            <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-6 bg-gradient-to-t from-slate-950 to-transparent">
              <button
                onClick={goToPreviousSlide}
                className="group flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/70 transition-all text-white border border-slate-700/50 hover:border-slate-600"
                title="Previous slide (← key)"
              >
                <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                <span className="hidden sm:inline">Previous</span>
              </button>

              <div className="text-center">
                <p className="text-gray-300 text-sm">
                  Slide <span className="font-semibold text-white">{currentSlide + 1}</span> of{' '}
                  <span className="font-semibold text-white">{extendedSlides.length}</span>
                </p>
              </div>

              <button
                onClick={() => setShowPitchDeck(false)}
                className="px-4 py-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/70 transition-all text-white border border-slate-700/50 hover:border-slate-600 text-sm"
              >
                ← Back to Overview
              </button>

              <button
                onClick={goToNextSlide}
                className="group flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600/80 hover:bg-blue-700 transition-all text-white border border-blue-500/50"
                title="Next slide (→ key)"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>

          {/* Thumbnail Carousel */}
          <div className="bg-gradient-to-t from-slate-950 to-slate-900/50 border-t border-slate-800/50 backdrop-blur-sm sticky bottom-0 left-0 right-0">
            <SlideThumbnailCarouselRedesign
              slides={extendedSlides}
              currentSlideIndex={currentSlide}
              onSelectSlide={setCurrentSlide}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      {/* 3D Background Scene */}
      <div className="fixed inset-0 z-0">
        <SceneErrorBoundary>
          <Canvas
            shadows
            dpr={[1, typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 1.5) : 1]}
            camera={{ position: [0, 0, 1.1], fov: 50 }}
            gl={{
              antialias: true,
              powerPreference: 'high-performance',
              preserveDrawingBuffer: false,
              alpha: true,
            }}
          >
            <Suspense fallback={null}>
              <NeuralNetworkScene particleCountMultiplier={0.4} />
            </Suspense>
          </Canvas>
        </SceneErrorBoundary>
      </div>

      {/* Content Overlay */}
      <main className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16">
        <div className="w-full max-w-7xl">
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Ideas & Concepts
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore our business concepts, strategic planning, and FAA Part 108 certification expertise requirements
            </p>
          </div>

          {/* Pitch Deck Card */}
          <div className="mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0 }}
            >
              <Card
                className="h-full bg-background/80 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-all cursor-pointer group"
                onClick={() => setShowPitchDeck(true)}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <Presentation className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">Interactive Pitch Deck</CardTitle>
                  </div>
                  <CardDescription className="text-base">
                    14-slide investor-ready presentation with category-aware filtering and display modes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-6 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Three-pillar strategy presentation</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Multiple display modes (headline, summary, full, interactive)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Investor-level filtering</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Progressive content disclosure</span>
                    </li>
                  </ul>
                  <Button
                    className="w-full group-hover:gap-3 transition-all"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowPitchDeck(true);
                    }}
                  >
                    View Pitch Deck
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Three Card Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {/* General Ideas Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card 
                className="h-full bg-background/80 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-all cursor-pointer group"
                onClick={() => router.push('/ideas/general')}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <Briefcase className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">General Ideas</CardTitle>
                  </div>
                  <CardDescription className="text-base">
                    Business concepts, pitch deck sections, and strategic planning materials
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-6 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Pitch deck sections and presentations</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Business model overviews</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Strategic planning documents</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Interactive 3D visualizations</span>
                    </li>
                  </ul>
                  <Button 
                    className="w-full group-hover:gap-3 transition-all"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push('/ideas/general');
                    }}
                  >
                    Explore General Ideas
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Umbrella V1 Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card 
                className="h-full bg-background/80 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-all cursor-pointer group"
                onClick={() => router.push('/ideas/umbrellav1')}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <Umbrella className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">Expertise Umbrellas</CardTitle>
                  </div>
                  <CardDescription className="text-base">
                    Comprehensive FAA Part 108 certification expertise requirements and planning
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-6 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Founding partner expertise umbrellas</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>8-phase certification roadmap</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Budget and resource planning</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Interactive 3D explorer and visualizations</span>
                    </li>
                  </ul>
                  <Button 
                    className="w-full group-hover:gap-3 transition-all"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push('/ideas/umbrellav1');
                    }}
                  >
                    Explore Expertise Umbrellas
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Composites Manufacturing Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card 
                className="h-full bg-background/80 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-all cursor-pointer group"
                onClick={() => router.push('/ideas/composites')}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <Factory className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">Composites Manufacturing</CardTitle>
                  </div>
                  <CardDescription className="text-base">
                    Contract manufacturing acquisition and operational scaling guide
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-6 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Acquisition strategy and due diligence</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>3-4 core expertise areas</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Dual-tier market (aerospace + commercial)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Certification requirements and financial models</span>
                    </li>
                  </ul>
                  <Button 
                    className="w-full group-hover:gap-3 transition-all"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push('/ideas/composites');
                    }}
                  >
                    Explore Composites Manufacturing
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
