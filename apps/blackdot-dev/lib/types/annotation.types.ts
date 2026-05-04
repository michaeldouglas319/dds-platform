/**
 * Shared Annotation Types
 * Generic annotation data structure used across scenes and components
 */

export interface AnnotationData {
  id: string;
  title: string;
  description?: string;
  camPos: { x: number; y: number; z: number };
  lookAt: { x: number; y: number; z: number };
  position?: { x: number; y: number; z: number };
  color?: string;
}

export interface AnnotationNavigationProps {
  annotations: AnnotationData[];
  onNavigate: (id: string) => void;
  className?: string;
}
