'use client';

import { useMemo } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { NAVIGATION_ITEMS, type NavItem } from '@/lib/config/navigation';
import { AccessLevelWeight, type AccessLevelType } from '@/lib/types/auth.types';

/**
 * Filter navigation items based on user's access level
 * Removes items the user doesn't have permission to see
 */
export function useRoleBasedNavigation(): NavItem[] {
  const { accessLevel: userAccessLevel } = useAuth();

  const filteredItems = useMemo(() => {
    const userWeight = AccessLevelWeight[userAccessLevel];

    const filterItems = (items: NavItem[]): NavItem[] => {
      return items
        .filter((item) => {
          // If item has no access level requirement, always show it
          if (!item.accessLevel) return true;
          // Only show if user's access level meets the requirement
          const itemWeight = AccessLevelWeight[item.accessLevel as AccessLevelType];
          return userWeight >= itemWeight;
        })
        .map((item) => {
          // Recursively filter submenu items
          if (item.submenu) {
            return {
              ...item,
              submenu: filterItems(item.submenu),
            };
          }
          return item;
        })
        .filter((item) => {
          // Don't show parent items if all their children are filtered out
          if (item.submenu && item.submenu.length === 0) {
            return false;
          }
          return true;
        });
    };

    return filterItems(NAVIGATION_ITEMS);
  }, [userAccessLevel]);

  return filteredItems;
}
