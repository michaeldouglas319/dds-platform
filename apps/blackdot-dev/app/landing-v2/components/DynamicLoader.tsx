/**
 * Dynamic Loader Component
 *
 * Renders any loader item (Item1-Item12) based on type prop
 */

'use client';

import { Item1 } from '@/components/shared/loaders/Item1';
import { Item2 } from '@/components/shared/loaders/Item2';
import { Item3 } from '@/components/shared/loaders/Item3';
import { Item4 } from '@/components/shared/loaders/Item4';
import { Item5 } from '@/components/shared/loaders/Item5';
import { Item6 } from '@/components/shared/loaders/Item6';
import { Item7 } from '@/components/shared/loaders/Item7';
import { Item8 } from '@/components/shared/loaders/Item8';
import { Item9 } from '@/components/shared/loaders/Item9';
import { Item10 } from '@/components/shared/loaders/Item10';
import { Item11 } from '@/components/shared/loaders/Item11';
import { Item12 } from '@/components/shared/loaders/Item12';
import type { LoaderType } from '../config/display.config';

interface DynamicLoaderProps {
  type: LoaderType;
  lightResponsive?: boolean;
}

const loaderMap: Record<LoaderType, React.ComponentType<any>> = {
  Item1,
  Item2,
  Item3,
  Item4,
  Item5,
  Item6,
  Item7,
  Item8,
  Item9,
  Item10,
  Item11,
  Item12,
};

export function DynamicLoader({ type, lightResponsive = false }: DynamicLoaderProps) {
  const Component = loaderMap[type];

  if (!Component) {
    console.warn(`Unknown loader type: ${type}`);
    return null;
  }

  // Check if component accepts lightResponsive prop
  const supportsLightResponsive = ['Item1', 'Item2', 'Item3', 'Item4', 'Item5', 'Item6', 'Item7', 'Item8', 'Item9', 'Item10', 'Item11', 'Item12'].includes(type);

  return supportsLightResponsive
    ? <Component lightResponsive={lightResponsive} />
    : <Component />;
}
