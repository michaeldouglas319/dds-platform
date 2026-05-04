/**
 * Ideas Overview Page Data Configuration
 * Focus: Concise 12-Slide Investor Pitch Deck
 * Three-Pillar Strategy: FaaS → V1 Hardware → Full Vertical Ecosystem
 * 
 * Date: January 11, 2026
 * Transitioned from 36-slide business config to concise investor-ready deck
 */

import { ideasPitchDeckExtended } from './ideasPitchDeck-extended.config';
import type { UnifiedSection } from '@/lib/config/content';

export type IdeasSection = UnifiedSection;

/**
 * Get all ideas sections from the extended pitch deck config
 * Phase 3.2: Expanded from 12-slide base to 16-slide deck with competitive moat, derisking, validation, and tech stack
 */
export const ideasSections: IdeasSection[] = ideasPitchDeckExtended;

