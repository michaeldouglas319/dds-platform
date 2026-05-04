/**
 * Utilities Barrel Export
 *
 * General utility functions for markdown parsing, PDF generation,
 * theme management, performance optimization, and responsive typography.
 */

export { parseMarkdownContent, extractCitations, stripMarkdown, markdownToHtml } from './markdownParser';
export { generateResumePDFBlob } from './resumePdfGenerator';
export { buildResumeHTML, buildResumePreviewHTML } from './resumePdfTemplate';
export { hslToHex, getCSSVariableColor, isDarkTheme, getBackgroundColor, getForegroundColor, getMutedColor } from './themeColors';
export { getOptimizedCanvasSettings, useAdaptiveResolution, getOptimalTextureResolution } from './resolutionOptimization';
export {
  getResponsiveFontSize,
  getResponsiveLineHeight,
  truncateForMobile,
  getResponsiveSpacing,
  getResponsiveTextAlignment,
  getResponsiveLetterSpacing
} from './responsiveText';
export {
  emitParticlesFromGeometry,
  generateParticleVelocities,
  generateSplineFlowField,
  interpolateParticlePosition,
  updateParticlePositions,
  computeParticleColor,
  easeInOutQuad
} from './particleSystemUtils';
