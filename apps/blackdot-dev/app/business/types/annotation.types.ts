/**
 * Annotation Types
 * Shared types for the annotation system
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


