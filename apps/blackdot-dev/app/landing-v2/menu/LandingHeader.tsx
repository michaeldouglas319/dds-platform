'use client'

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export function LandingHeader() {
  const navigationItems = [
    { label: 'Resume', path: '/resumev3' },
    { label: 'Business', path: '/business' },
    { label: 'About', path: '/about' },
  ];

  return (
    <div className="hidden lg:flex fixed top-8 left-1/2 -translate-x-1/2 z-50 pointer-events-auto items-center gap-2 p-1 bg-background/40 backdrop-blur-md rounded-full border border-border/50 shadow-xl">
      <div className="flex items-center gap-1 px-3 border-r border-border/50">
        <Link href="/">
          <Button variant="ghost" size="sm" className="rounded-full font-black tracking-tighter hover:bg-transparent px-3">
            DDS
          </Button>
        </Link>
      </div>

      <div className="flex items-center gap-1 px-1">
        {navigationItems.map((item) => (
          <Link key={item.path} href={item.path}>
            <Button variant="ghost" size="sm" className="rounded-full">
              {item.label}
            </Button>
          </Link>
        ))}
      </div>

      <div className="flex items-center pl-1 border-l border-border/50">
        <ThemeToggle />
      </div>
    </div>
  );
}

