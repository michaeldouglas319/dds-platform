/**
 * Annotation Navigation Component
 * UI overlay for navigating between annotations
 * Based on the standard annotation navigation pattern
 */

import type { AnnotationData } from '../types/annotation.types';

interface AnnotationNavigationProps {
  annotations: AnnotationData[];
  onNavigate: (id: string) => void;
  className?: string;
}

export function AnnotationNavigation({
  annotations,
  onNavigate,
  className = '',
}: AnnotationNavigationProps) {
  if (annotations.length === 0) {
    return null;
  }

  return (
    <div
      className={`annotation-navigation ${className}`}
      style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        width: '280px',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderRadius: '8px',
        padding: '20px',
        color: 'white',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        zIndex: 1000,
        pointerEvents: 'auto',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      <h3
        style={{
          margin: '0 0 16px 0',
          fontSize: '18px',
          fontWeight: '600',
          color: '#fff',
        }}
      >
        Navigate to:
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {annotations.map((annotation) => {
          const color = annotation.color || '#4CAF50';

          return (
            <button
              key={annotation.id}
              onClick={() => onNavigate(annotation.id)}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: 'none',
                borderRadius: '6px',
                backgroundColor: color,
                color: 'white',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s ease',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
                e.currentTarget.style.opacity = '0.9';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.opacity = '1';
              }}
            >
              <span style={{ fontWeight: '600' }}>{annotation.title}</span>
              {annotation.description && (
                <span style={{ fontSize: '12px', opacity: 0.9 }}>
                  {annotation.description}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}


