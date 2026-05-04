import { ModelShowcaseLayout } from './layout/ModelShowcaseLayout'

/**
 * Resume Parallax Page
 * Central model showcase with arrow navigation
 *
 * Route: /resume-parallax
 *
 * Features:
 * - Central 3D model based on job modelType
 * - Info cards above/below model
 * - Left/Right arrow navigation
 * - Uses Layer 2 Brand Primitives (GlassCard, BrandButton, StatusBadge)
 * - Configuration from resumeData.config.ts
 * - Fully responsive design
 *
 * Architecture:
 * - ModelShowcaseLayout: Main orchestrator
 * - Canvas with perspective camera and model rendering
 * - useModelShowcase: State management for navigation
 * - InfoCardAbove: Job title, company, period display
 * - CentralModelCanvas: 3D model with navigation arrows
 * - InfoCardBelow: Job description and highlights
 */
export default function ResumeParallaxPage() {
  return <ModelShowcaseLayout />
}
