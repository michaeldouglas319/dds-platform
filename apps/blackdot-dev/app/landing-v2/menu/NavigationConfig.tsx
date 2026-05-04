'use client'

import { usePathname } from 'next/navigation';
import { NAVIGATION_ITEMS, isNavItemActive, type NavItem } from '@/lib/config/navigation';

export interface NavigationItem {
  label: string;
  path: string;
  isActive: boolean;
  group?: string;
}

export function useNavigationItems(): NavigationItem[] {
  const pathname = usePathname();

  return NAVIGATION_ITEMS.map((item) => ({
    label: item.label,
    path: item.href,
    isActive: isNavItemActive(pathname, item),
  }));
}

