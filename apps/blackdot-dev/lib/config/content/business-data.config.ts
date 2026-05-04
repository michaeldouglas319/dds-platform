/**
 * Business Overview Page Data Configuration
 * Focus: Productionizing Gold Standards, Building the Future
 * 
 * Uses the existing config from @/lib/config/sections.config
 */

import { getSectionsByPage } from '@/lib/config/content/sections.config';
import type { UnifiedSection } from '@/lib/config/content/sections.config';

export type BusinessSection = UnifiedSection;

/**
 * Get all business sections from the unified config
 */
export const businessSections: BusinessSection[] = getSectionsByPage('business');

