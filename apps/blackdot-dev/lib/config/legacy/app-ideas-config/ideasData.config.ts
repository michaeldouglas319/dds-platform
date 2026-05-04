/**
 * Ideas Overview Page Data Configuration
 * Focus: Concise 12-Slide Investor Pitch Deck
 * Three-Pillar Strategy: FaaS → V1 Hardware → Full Vertical Ecosystem
 * 
 * Date: January 11, 2026
 * Transitioned from 36-slide business config to concise investor-ready deck
 */

import { ideasPitchDeckSections } from './ideasPitchDeck.config';
import type { UnifiedSection } from '@/lib/config/content';

export type IdeasSection = UnifiedSection;

/**
 * Get all ideas sections from the new concise pitch deck config
 * This replaces the previous approach of duplicating business sections
 */
export const ideasSections: IdeasSection[] = ideasPitchDeckSections;

