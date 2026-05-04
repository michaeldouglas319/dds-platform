'use client'

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function CornerMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div ref={menuRef} className="lg:hidden absolute bottom-0 right-0 p-4 md:p-8 pointer-events-auto z-20">
      {/* Menu Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative z-20 p-3 bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-lg hover:bg-muted transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary"
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
      >
        <svg
          className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {isOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Expanded Menu */}
      <div
        className={`absolute bottom-0 right-0 mb-14 md:mb-16 bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-xl transition-all duration-300 ease-out ${
          isOpen
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-2 pointer-events-none'
        }`}
        style={{ minWidth: '200px' }}
      >
        <div className="p-4 space-y-3">
          <div className="space-y-1">
            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className="block text-xs md:text-sm font-medium text-foreground/80 hover:text-foreground transition-colors cursor-pointer"
            >
              3D Portfolio
            </Link>
            <div className="text-xs text-muted-foreground/60">React Three Fiber</div>
          </div>

        </div>
      </div>
    </div>
  );
}



