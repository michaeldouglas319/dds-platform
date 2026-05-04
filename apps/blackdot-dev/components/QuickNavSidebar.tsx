"use client";

import React, { useMemo, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ChevronRight, LayoutGrid, Target, Zap, Rocket, Users, MessageSquare, Info, ShieldCheck, Microscope } from 'lucide-react';
import type { Section } from '@/lib/portfolio/config/sections.types';

export type UnifiedSection = Section;

interface QuickNavSidebarProps {
  sections: UnifiedSection[];
  currentSectionId?: string;
  basePath: string;
  isOpen: boolean;
  onToggle: () => void;
}

/**
 * Quick Navigation Sidebar
 * Shows hierarchical view of all sections for the current page
 */
export function QuickNavSidebar({
  sections,
  currentSectionId,
  basePath,
  isOpen,
  onToggle,
}: QuickNavSidebarProps) {
  const pathname = usePathname();

  // Auto-close sidebar on mobile when location changes
  useEffect(() => {
    if (isOpen && window.innerWidth < 1024) {
      onToggle();
    }
  }, [pathname, isOpen, onToggle]);

  // Organize sections into a tree structure if not already flattened
  const sectionTree = useMemo(() => {
    return sections.filter(s => !s.parentId);
  }, [sections]);

  const getIcon = (id: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      'hero': <Zap size={16} />,
      'problem': <Target size={16} />,
      'solution': <ShieldCheck size={16} />,
      'market': <LayoutGrid size={16} />,
      'products': <Zap size={16} />,
      'technology': <Microscope size={16} />,
      'simulation': <Rocket size={16} />,
      'traction': <Zap size={16} />,
      'team': <Users size={16} />,
      'cta': <MessageSquare size={16} />,
      'footer': <Info size={16} />,
    };
    return iconMap[id] || iconMap[id.split('-')[0]] || <Zap size={16} />;
  };

  const NavItem = ({ section, depth = 0 }: { section: UnifiedSection; depth?: number }) => {
    const isActive = section.id === currentSectionId;
    const hasChildren = section.children && section.children.length > 0;
    const isParentOfActive = section.children?.some(c => c.id === currentSectionId);
    const href = section.path || `${basePath}/${section.id}`;

    return (
      <div className="space-y-1">
        <Link
          href={href}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-all group",
            isActive 
              ? "bg-primary text-primary-foreground font-bold shadow-md" 
              : "hover:bg-muted text-muted-foreground hover:text-foreground",
            depth > 0 && "ml-4 border-l pl-4"
          )}
        >
          <span className={cn(
            "transition-transform duration-300",
            isActive ? "scale-110" : "group-hover:scale-110 opacity-70"
          )}>
            {getIcon(section.id)}
          </span>
          <span className="flex-1 text-left truncate">{section.title}</span>
          {hasChildren && (
            <ChevronRight size={14} className={cn(
              "transition-transform duration-300",
              (isActive || isParentOfActive) && "rotate-90"
            )} />
          )}
        </Link>
        
        {(isActive || isParentOfActive || depth > 0) && hasChildren && (
          <div className="mt-1">
            {section.children?.map(child => (
              <NavItem key={child.id} section={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={onToggle}
        className={cn(
          "fixed top-6 left-6 z-[60] p-3 rounded-xl bg-background/80 backdrop-blur-xl border-2 shadow-2xl transition-all hover:scale-105 active:scale-95 lg:hidden",
          isOpen ? "left-[280px]" : "left-6"
        )}
      >
        <LayoutGrid size={24} className={isOpen ? "text-primary" : "text-muted-foreground"} />
      </button>

      {/* Sidebar Container */}
      <div 
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-background/60 backdrop-blur-3xl border-r border-white/10 shadow-[20px_0_40px_rgba(0,0,0,0.3)] transition-transform duration-500 ease-out lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full relative overflow-hidden">
          {/* HUD scanline effect */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]" />
          
          {/* Header */}
          <div className="p-8 border-b border-white/5 relative bg-white/5">
            <div className="absolute top-0 right-0 p-2 opacity-20">
              <LayoutGrid size={40} strokeWidth={1} />
            </div>
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/60 mb-2">
              System Interface
            </h2>
            <p className="text-2xl font-black tracking-tighter leading-none">Navigator</p>
          </div>

          {/* Nav List */}
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-3 relative">
            <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 mb-4 px-4">
              Project Hierarchy
            </div>
            {sectionTree.map(section => (
              <NavItem key={section.id} section={section} />
            ))}
          </div>

          {/* Footer / Status HUD */}
          <div className="p-8 border-t border-white/5 bg-black/20">
            <div className="space-y-4">
              <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-[0.2em]">
                <span className="text-muted-foreground/60">Career Progress</span>
                <span className="text-primary flex items-center gap-1.5">
                  <div className="w-1 h-1 rounded-full bg-primary animate-ping" />
                  Active
                </span>
              </div>
              <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-primary/40 w-[85%] animate-pulse" />
              </div>
              <div className="flex items-center justify-between text-[8px] font-medium uppercase tracking-widest text-muted-foreground/40">
                <span>Secure Node: {currentSectionId || 'root'}</span>
                <span>V2.0.4</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-background/20 backdrop-blur-sm lg:hidden"
          onClick={onToggle}
        />
      )}
    </>
  );
}




