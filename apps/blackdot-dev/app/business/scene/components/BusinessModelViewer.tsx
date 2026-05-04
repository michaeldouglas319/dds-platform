/**
 * Business Model Viewer
 * Professional scrollable model display following overlay pattern
 *
 * Layout:
 * - 3D Canvas: centered, full viewport
 * - Overlay: positioned absolutely, content on right
 * - Scroll: drives model rotation + overlay slide position
 * - State: manages which section is active
 *
 * Pattern based on: https://codesandbox.io/s/ioxywi (shirt customizer)
 */

'use client';

import React, { useRef, useMemo, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, Center } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { easing } from 'maath';

import { useCachedModel } from '@/lib/threejs/utils/modelCache';
import { optimizeGLTFScene } from '@/lib/threejs/optimization/modelOptimization';
import { detectDeviceCapabilities, getOptimalModelOptions } from '@/lib/threejs/optimization/deviceCapability';
import { getSectionsByPage, type UnifiedSection } from '@/lib/config/content';
import { DynamicModel } from './DynamicModel';
import { FallbackModel } from './FallbackModel';
import { cn } from '@/lib/utils';
import { ParsedParagraph, ParsedHighlight } from '@/lib/components/ParsedContent';

/**
 * Scroll State Management
 * Tracks which section user is viewing
 */
interface ViewerState {
  activeSection: number;
  scrollProgress: number; // 0-1, normalized scroll position
}

/**
 * 3D Model Container
 * Centered canvas with rotating model
 */
function ModelCanvas({
  activeSection,
  sections,
}: {
  activeSection: number;
  sections: UnifiedSection[];
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const section = sections[activeSection];

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full z-0"
    >
      <Canvas
        shadows
        camera={{ position: [0, 0, 4], fov: 75 }}
        gl={{ preserveDrawingBuffer: true }}
        style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)' }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} castShadow />
        <Environment preset="studio" />

        <ModelRig activeSection={activeSection}>
          <AnimatePresence mode="wait">
            {section?.modelConfig ? (
              <Suspense
                key={section.id}
                fallback={
                  <Center>
                    <FallbackModel color={section.color} />
                  </Center>
                }
              >
                <DynamicModel modelConfig={section.modelConfig} />
              </Suspense>
            ) : (
              <Center key="fallback">
                <FallbackModel color={section?.color} />
              </Center>
            )}
          </AnimatePresence>
        </ModelRig>

        <OrbitControls enableZoom={false} enablePan={false} />
      </Canvas>
    </div>
  );
}

/**
 * Camera Rig for model rotation
 * Follows section state with smooth damping
 */
function ModelRig({
  activeSection,
  children,
}: {
  activeSection: number;
  children: React.ReactNode;
}) {
  const group = useRef<THREE.Group>(null);
  const targetRotation = useRef(0);

  // Update target rotation based on section
  useEffect(() => {
    targetRotation.current = (activeSection / 3) * Math.PI * 2; // Full rotation over sections
  }, [activeSection]);

  useFrame((state, dt) => {
    if (!group.current) return;

    // Smooth rotation transition
    easing.damp(
      group.current.rotation,
      'y',
      targetRotation.current,
      0.3, // Damping factor (lower = smoother)
      dt
    );
  });

  return <group ref={group}>{children}</group>;
}

/**
 * Overlay Component
 * Content positioned on right side, animates with scroll
 * Data pulled directly from config (like snap.color in example)
 */
interface OverlayProps {
  activeSection: number;
  sections: ReturnType<typeof getSectionsByPage>;
  onSectionChange: (index: number) => void;
}

function Overlay({ activeSection, sections, onSectionChange }: OverlayProps) {
  const transition = { type: 'spring' as const, duration: 0.6, damping: 15, stiffness: 200 };

  // Animation config for content slide-in from right
  const contentConfig = {
    initial: { x: 100, opacity: 0 },
    animate: { x: 0, opacity: 1, transition: { ...transition, delay: 0.2 } },
    exit: { x: 100, opacity: 0, transition: { ...transition, delay: 0 } },
  };

  const section = sections[activeSection];
  const sectionColor = section?.color || '#4CAF50';

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none z-10">
      {/* HUD scanline effect - reduced opacity for better performance */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]" />
      
      {/* Header - Data from config */}
      <motion.header
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={transition}
        className="absolute top-8 right-8 z-20 pointer-events-auto"
      >
        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/60 mb-2">
          Business Model
        </h3>
        <p className="text-2xl font-black tracking-tighter leading-none text-foreground">
          {section?.title?.toUpperCase() || 'SECTION'}
        </p>
      </motion.header>

      {/* Main Content Panel - Data from config */}
      <motion.section
        key={`section-${activeSection}`}
        {...contentConfig}
        className="absolute bottom-12 right-8 max-w-[400px] pointer-events-auto z-20"
      >
        <div
          className="bg-background/60 backdrop-blur-3xl border border-white/10 rounded-xl p-8 shadow-[20px_0_40px_rgba(0,0,0,0.3)]"
          style={{
            borderColor: `${sectionColor}33`,
          }}
        >
          {/* Section Heading - From config.content.heading */}
          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ ...transition, delay: 0.3 }}
            className="text-2xl font-black tracking-tighter leading-none mb-4"
            style={{ color: sectionColor }}
          >
            {section?.content?.heading || section?.title || 'Loading...'}
          </motion.h2>

          {/* Paragraphs - Support both string and structured format */}
          {section?.content?.paragraphs && section.content.paragraphs.length > 0 && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ ...transition, delay: 0.35 }}
              className="mb-6 space-y-3"
            >
              {section.content.paragraphs.map((paragraph, idx) => {
                if (typeof paragraph === 'string') {
                  return (
                    <ParsedParagraph
                      key={idx}
                      text={paragraph}
                      categoryColor={sectionColor}
                      descriptionColor="rgba(255, 255, 255, 0.8)"
                    />
                  );
                } else {
                  return (
                    <ParsedParagraph
                      key={idx}
                      subtitle={paragraph.subtitle}
                      description={paragraph.description}
                      citations={paragraph.citations}
                      categoryColor={sectionColor}
                      descriptionColor="rgba(255, 255, 255, 0.8)"
                    />
                  );
                }
              })}
            </motion.div>
          )}

          {/* Highlights - Support both string and structured format */}
          {section?.content?.highlights && section.content.highlights.length > 0 && (
            <motion.ul
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ ...transition, delay: 0.37 }}
              className="mb-6 pl-6 space-y-2 text-sm list-disc"
            >
              {section.content.highlights.slice(0, 3).map((highlight, idx) => {
                if (typeof highlight === 'string') {
                  return (
                    <ParsedHighlight
                      key={idx}
                      text={highlight}
                      categoryColor={sectionColor}
                      fontSize="0.9rem"
                      lineHeight={1.5}
                    />
                  );
                } else {
                  return (
                    <ParsedHighlight
                      key={idx}
                      subtitle={highlight.subtitle}
                      description={highlight.description}
                      categoryColor={sectionColor}
                      fontSize="0.9rem"
                      lineHeight={1.5}
                    />
                  );
                }
              })}
            </motion.ul>
          )}

          {/* Navigation Dots */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ ...transition, delay: 0.4 }}
            className="flex gap-2 justify-start pointer-events-auto"
          >
            {sections.map((_, index) => (
              <button
                key={index}
                onClick={() => onSectionChange(index)}
                className={cn(
                  "h-2 rounded-full transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                  activeSection === index
                    ? "w-8 bg-primary shadow-md"
                    : "w-2 bg-white/30 hover:bg-white/50"
                )}
                style={activeSection === index ? { backgroundColor: sectionColor } : undefined}
                aria-label={`Go to section ${index + 1}`}
              />
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ ...transition, delay: 0.6 }}
        className="absolute bottom-8 left-8 text-xs text-muted-foreground/50 uppercase tracking-widest pointer-events-none"
      >
        ↓ Scroll to explore ↓
      </motion.div>
    </div>
  );
}

/**
 * Main Business Model Viewer Component
 * Combines canvas and overlay with scroll control
 * Data-driven from unified config
 */
export function BusinessModelViewer() {
  const businessSections = useMemo(() => getSectionsByPage('business'), []);
  const [activeSection, setActiveSection] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle scroll for section navigation
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      // Scroll down = next section
      if (e.deltaY > 0) {
        setActiveSection((prev) => Math.min(prev + 1, businessSections.length - 1));
      } else {
        setActiveSection((prev) => Math.max(prev - 1, 0));
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
      return () => container.removeEventListener('wheel', handleWheel);
    }
  }, [businessSections.length]);

  if (businessSections.length === 0) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-background text-foreground">
        No business sections configured
      </div>
    );
  }

  const progressPercentage = Math.round(((activeSection + 1) / businessSections.length) * 100);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden bg-background"
    >
      {/* Layer 0: Skill Badges Background Overlay */}

      {/* 3D Canvas */}
      <ModelCanvas activeSection={activeSection} sections={businessSections} />

      {/* Overlay UI - Data-driven from config */}
      <Overlay
        activeSection={activeSection}
        sections={businessSections}
        onSectionChange={setActiveSection}
      />

      {/* Section Counter / Progress Indicator HUD */}
      <motion.div
        key={activeSection}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="fixed bottom-4 right-4 lg:bottom-8 lg:right-8 z-20 pointer-events-none group"
        role="status"
        aria-live="polite"
        aria-label={`Section ${activeSection + 1} of ${businessSections.length} - ${progressPercentage}%`}
      >
        <div className="bg-background/40 backdrop-blur-2xl border border-white/10 rounded-xl lg:rounded-2xl p-3 lg:p-5 shadow-2xl transition-all group-hover:bg-background/60">
          <div className="flex items-center gap-2 lg:gap-3 mb-2 lg:mb-3">
            <div 
              className="w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(var(--primary),0.5)]" 
              aria-hidden="true"
            />
            <div className="text-[8px] lg:text-[10px] font-black uppercase tracking-[0.2em] text-primary/80">
              Business Model
            </div>
          </div>
          <div className="space-y-1.5 lg:space-y-2">
            <div className="flex justify-between text-[8px] lg:text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
              <span className="truncate max-w-[120px] lg:max-w-none">
                Section {String(activeSection + 1).padStart(2, '0')} / {String(businessSections.length).padStart(2, '0')}
              </span>
              <span className="ml-2">{progressPercentage}%</span>
            </div>
            <div className="w-40 lg:w-48 h-1 lg:h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
              <div 
                className="h-full bg-primary transition-all duration-500 ease-out shadow-[0_0_10px_rgba(var(--primary),0.5)]"
                style={{ width: `${progressPercentage}%` }}
                role="progressbar"
                aria-valuenow={progressPercentage}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default BusinessModelViewer;
