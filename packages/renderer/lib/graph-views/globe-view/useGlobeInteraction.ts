/**
 * Globe Interaction Hook
 *
 * Provides mouse and touch interaction handlers for the GlobeView component.
 * Handles rotation, zoom, and selection gestures.
 */

import { useCallback, useRef, useEffect } from 'react';
import type { Vector3 } from 'three';

export interface GlobeInteractionState {
  isDragging: boolean;
  dragStartX: number;
  dragStartY: number;
  dragDeltaX: number;
  dragDeltaY: number;
  zoom: number;
  rotationX: number;
  rotationY: number;
}

export interface UseGlobeInteractionProps {
  containerRef: React.RefObject<HTMLDivElement>;
  onRotate?: (deltaX: number, deltaY: number) => void;
  onZoom?: (delta: number) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  sensitivity?: number;
  zoomSensitivity?: number;
}

/**
 * Hook for managing globe interaction (rotation, zoom, etc.)
 *
 * @example
 * ```tsx
 * const containerRef = useRef<HTMLDivElement>(null);
 * useGlobeInteraction({
 *   containerRef,
 *   onRotate: (dx, dy) => console.log('rotate', dx, dy),
 *   onZoom: (delta) => console.log('zoom', delta),
 *   sensitivity: 0.01,
 * });
 * ```
 */
export function useGlobeInteraction({
  containerRef,
  onRotate,
  onZoom,
  onDragStart,
  onDragEnd,
  sensitivity = 0.01,
  zoomSensitivity = 0.1,
}: UseGlobeInteractionProps) {
  const stateRef = useRef<GlobeInteractionState>({
    isDragging: false,
    dragStartX: 0,
    dragStartY: 0,
    dragDeltaX: 0,
    dragDeltaY: 0,
    zoom: 1,
    rotationX: 0,
    rotationY: 0,
  });

  // Handle mouse down
  const handleMouseDown = useCallback((e: MouseEvent) => {
    stateRef.current.isDragging = true;
    stateRef.current.dragStartX = e.clientX;
    stateRef.current.dragStartY = e.clientY;
    stateRef.current.dragDeltaX = 0;
    stateRef.current.dragDeltaY = 0;

    if (onDragStart) {
      onDragStart();
    }
  }, [onDragStart]);

  // Handle mouse move
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!stateRef.current.isDragging) return;

    const deltaX = e.clientX - stateRef.current.dragStartX;
    const deltaY = e.clientY - stateRef.current.dragStartY;

    stateRef.current.dragDeltaX = deltaX;
    stateRef.current.dragDeltaY = deltaY;
    stateRef.current.rotationY += deltaX * sensitivity;
    stateRef.current.rotationX += deltaY * sensitivity;

    if (onRotate) {
      onRotate(deltaX * sensitivity, deltaY * sensitivity);
    }

    stateRef.current.dragStartX = e.clientX;
    stateRef.current.dragStartY = e.clientY;
  }, [onRotate, sensitivity]);

  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    stateRef.current.isDragging = false;

    if (onDragEnd) {
      onDragEnd();
    }
  }, [onDragEnd]);

  // Handle wheel zoom
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();

    const zoomDelta = e.deltaY > 0 ? -zoomSensitivity : zoomSensitivity;
    stateRef.current.zoom += zoomDelta;
    stateRef.current.zoom = Math.max(0.1, Math.min(5, stateRef.current.zoom));

    if (onZoom) {
      onZoom(zoomDelta);
    }
  }, [onZoom, zoomSensitivity]);

  // Handle touch start
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (e.touches.length !== 1) return;

    const touch = e.touches[0];
    stateRef.current.isDragging = true;
    stateRef.current.dragStartX = touch.clientX;
    stateRef.current.dragStartY = touch.clientY;
    stateRef.current.dragDeltaX = 0;
    stateRef.current.dragDeltaY = 0;

    if (onDragStart) {
      onDragStart();
    }
  }, [onDragStart]);

  // Handle touch move
  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!stateRef.current.isDragging || e.touches.length !== 1) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - stateRef.current.dragStartX;
    const deltaY = touch.clientY - stateRef.current.dragStartY;

    stateRef.current.dragDeltaX = deltaX;
    stateRef.current.dragDeltaY = deltaY;
    stateRef.current.rotationY += deltaX * sensitivity;
    stateRef.current.rotationX += deltaY * sensitivity;

    if (onRotate) {
      onRotate(deltaX * sensitivity, deltaY * sensitivity);
    }

    stateRef.current.dragStartX = touch.clientX;
    stateRef.current.dragStartY = touch.clientY;
  }, [onRotate, sensitivity]);

  // Handle touch end
  const handleTouchEnd = useCallback(() => {
    stateRef.current.isDragging = false;

    if (onDragEnd) {
      onDragEnd();
    }
  }, [onDragEnd]);

  // Set up event listeners
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleMouseDown, handleMouseMove, handleMouseUp, handleWheel, handleTouchStart, handleTouchMove, handleTouchEnd]);

  // Return current state
  return stateRef.current;
}
