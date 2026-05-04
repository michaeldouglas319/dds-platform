'use client';

import { useState } from 'react';
import { useRoleBasedNavigation } from '@/hooks/useRoleBasedNavigation';
import { useRouter } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { NavItem } from '@/lib/config/navigation';

interface SidebarNavigationProps {
  currentSection?: number;
  sections?: Array<{ id: string; title: string }>;
  navigationLabel?: string;
  onSectionClick?: (sectionId: string) => void;
}

/**
 * Sidebar Navigation Component
 * Renders role-based navigation items with nested submenu support
 * Filters items based on user's access level
 */
export function SidebarNavigation({
  currentSection,
  sections,
  navigationLabel,
  onSectionClick,
}: SidebarNavigationProps) {
  const router = useRouter();
  const navItems = useRoleBasedNavigation();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleSubmenu = (itemLabel: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemLabel)) {
      newExpanded.delete(itemLabel);
    } else {
      newExpanded.add(itemLabel);
    }
    setExpandedItems(newExpanded);
  };

  const handleItemClick = (href: string) => {
    if (href === '#') return; // Don't navigate for category headers

    if (onSectionClick) {
      // For section items within the current page
      onSectionClick(href);
    } else {
      // For top-level navigation items
      router.push(href);
    }
  };

  const renderNavItem = (item: NavItem, depth: number = 0) => {
    const isExpandable = item.submenu && item.submenu.length > 0;
    const isExpanded = expandedItems.has(item.label);
    const isCategory = item.href === '#';

    return (
      <div key={item.label}>
        <button
          onClick={() => {
            if (isExpandable) {
              toggleSubmenu(item.label);
            } else {
              handleItemClick(item.href);
            }
          }}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-all group focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
            isCategory ? 'font-semibold text-muted-foreground/70 hover:text-foreground' : 'hover:bg-muted text-muted-foreground hover:text-foreground'
          )}
          style={{
            paddingLeft: `calc(0.75rem + ${depth * 0.75}rem)`,
          }}
        >
          {isExpandable && (
            <ChevronDown
              className={cn(
                'w-4 h-4 transition-transform flex-shrink-0',
                isExpanded ? 'rotate-180' : ''
              )}
            />
          )}
          {!isExpandable && !isCategory && (
            <span className="w-2 h-2 rounded-full bg-muted-foreground/40 group-hover:bg-primary/60 flex-shrink-0" />
          )}
          <span className="flex-1 text-left truncate">{item.label}</span>
        </button>

        {/* Nested submenu items */}
        {isExpandable && isExpanded && (
          <div className="space-y-1">
            {item.submenu!.map((subItem) => renderNavItem(subItem, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <nav className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-3" aria-label="Navigation">
      {navigationLabel && (
        <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 mb-4 px-4">
          {navigationLabel}
        </div>
      )}

      {/* Render page sections if provided */}
      {sections && sections.length > 0 && (
        <>
          <div className="space-y-1">
            {sections.map((section, index) => {
              const isActive = currentSection === index + 1;
              return (
                <button
                  key={section.id}
                  onClick={() => onSectionClick?.(section.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-all group focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                    isActive
                      ? 'bg-primary text-primary-foreground font-bold shadow-md'
                      : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span
                    className={cn(
                      'w-2 h-2 rounded-full transition-all flex-shrink-0',
                      isActive ? 'bg-primary-foreground' : 'bg-muted-foreground/40 group-hover:bg-primary/60'
                    )}
                    aria-hidden="true"
                  />
                  <span className="flex-1 text-left truncate">{section.title}</span>
                </button>
              );
            })}
          </div>

          {/* Divider if there are both page sections and global nav items */}
          {navItems.length > 0 && (
            <div className="h-px bg-white/5 my-2" />
          )}
        </>
      )}

      {/* Global navigation items */}
      <div className="space-y-1">
        {navItems.map((item) => renderNavItem(item))}
      </div>
    </nav>
  );
}
