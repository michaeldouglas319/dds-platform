/**
 * Universal Section Type System
 *
 * Core TypeScript types for the DDS universal section schema.
 * These types represent the complete data model for all section types.
 *
 * @module @dds/types/section
 */

import type { ReactNode } from 'react';

// ─── Theme Types ──────────────────────────────────────────────────

export type Theme = 'light' | 'dark';

// ─── Image Types ──────────────────────────────────────────────────

export interface ImageSource {
  src: string;
  srcLarge?: string;
  placeholder?: string;
  [key: string]: unknown;
}

export interface ImageWithDimensions extends ImageSource {
  width?: number;
  height?: number;
  alt?: string;
  sizes?: string;
}

export interface ThemedImage {
  dark: ImageSource;
  light: ImageSource;
  width?: number;
  height?: number;
  alt?: string;
  altTemplate?: string;
  sizes?: string;
  [key: string]: unknown;
}

export interface SidebarImage {
  dark: ImageSource;
  light: ImageSource;
  width?: number;
  height?: number;
  alt?: string;
  sizes?: string;
  [key: string]: unknown;
}

// ─── Content Types ────────────────────────────────────────────────

export interface Citation {
  text: string;
  url: string;
}

export interface Paragraph {
  subtitle?: string;
  description?: string;
  citations?: Citation[];
  [key: string]: unknown;
}

export interface Highlight {
  subtitle?: string;
  description?: string;
}

export interface Stat {
  label: string;
  value: string;
}

export interface Subject {
  title?: string;
  subtitle?: string;
  summary?: string;
  description?: string;
  category?: string;
  order?: number;
  color?: string;
  featured?: boolean;
  tags?: Record<string, string>;
  [key: string]: unknown;
}

export interface Content {
  body?: string;
  paragraphs?: Paragraph[];
  highlights?: Highlight[];
  stats?: Stat[];
  items?: string[];
  /** @deprecated Use highlights instead */
  disciplines?: string[];
  decorativeText?: string;
  decorativeFontSize?: string;
  decorativeLayout?: 'horizontal' | 'vertical';
  [key: string]: unknown;
}

export interface Media {
  image?: string | { src: string; [key: string]: unknown };
  themedImage?: ThemedImage;
  background?: ImageSource;
  backgroundFull?: ImageWithDimensions;
  video?: ImageWithDimensions;
  sidebarImages?: SidebarImage[];
  svgComponent?: string;
  modelComponent?: string;
  [key: string]: unknown;
}

export interface Link {
  text: string;
  href: string;
}

export interface Links {
  primary?: Link;
  url?: string;
  inline?: Link;
  roles?: string[];
  [key: string]: unknown;
}

export interface Display {
  layout?: string;
  textWidth?: 's' | 'm' | 'l' | 'xl';
  contentWidth?: string;
  textAlign?: 'start' | 'center' | 'end';
  imagePosition?: 'above' | 'below';
  padding?: string;
  headingLevel?: number;
  headingAs?: string;
  raised?: boolean;
  scrim?: boolean;
  scrimReverse?: boolean;
  animate?: 'none' | 'fade' | 'slide' | 'scale';
  animationDuration?: number;
  animationDelay?: number;
  visible?: boolean;
  visibleBreakpoints?: string[];
  accessRoles?: string[];
  featureFlag?: string;
  [key: string]: unknown;
}

export interface Spatial {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  camera?:
    | { position?: { x: number; y: number; z: number }; lookAt?: { x: number; y: number; z: number } }
    | [number, number, number];
  meshes?: string[];
  hideMeshes?: string[];
  animations?: string[];
  labels?: unknown[];
  modelType?: string;
  modelPath?: string;
  autoRotate?: boolean;
  [key: string]: unknown;
}

export interface Landing {
  enabled: boolean;
  figure: number;
  model?: Record<string, unknown>;
  katakana?: string;
  detailLayout?: string;
}

// ─── Universal Section ────────────────────────────────────────────

export interface UniversalSection {
  id: string;
  type: 'section' | 'entry' | 'hero' | 'profile' | 'config';
  name?: string;
  page?: string;
  subject?: Subject;
  content?: Content;
  media?: Media;
  links?: Links;
  display?: Display;
  spatial?: Spatial;
  meta?: Record<string, unknown>;
  landing?: Landing;
  children?: UniversalSection[];
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
}

// ─── Renderer Types ───────────────────────────────────────────────

export interface RendererProps {
  section: UniversalSection;
  onError?: (error: Error) => void;
  [key: string]: unknown;
}

export type RendererComponent = (props: RendererProps) => ReactNode;

export interface RendererMetadata {
  name: string;
  displayName: string;
  description?: string;
  required?: {
    subject?: (keyof Subject)[];
    content?: (keyof Content)[];
    media?: (keyof Media)[];
    links?: (keyof Links)[];
    display?: (keyof Display)[];
    spatial?: (keyof Spatial)[];
    meta?: string[];
  };
  optional?: {
    subject?: (keyof Subject)[];
    content?: (keyof Content)[];
    media?: (keyof Media)[];
    links?: (keyof Links)[];
    display?: (keyof Display)[];
    spatial?: (keyof Spatial)[];
    meta?: string[];
  };
  supports?: string[];
  composable?: boolean;
  themeAware?: boolean;
  layouts?: string[];
}

export interface RendererEntry {
  component: RendererComponent;
  metadata: RendererMetadata;
}

export type RendererRegistry = Record<string, RendererEntry>;
