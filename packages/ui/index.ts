/**
 * @dds/ui — Shared UI primitives for the DDS platform
 */

export { BrandHeading } from './brand-heading';

// Utilities
export { cn } from './lib/utils';

// Components
export { Button, buttonVariants, type ButtonProps } from './components/button';
export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from './components/card';
export { Badge, badgeVariants, type BadgeProps } from './components/badge';
export { Input, type InputProps } from './components/input';
export { Separator, type SeparatorProps } from './components/separator';
export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetOverlay,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
  type SheetContentProps,
} from './components/sheet';
export {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  type TabsProps,
  type TabsTriggerProps,
  type TabsContentProps,
} from './components/tabs';

// Partnership
export { PartnershipPitch, type PartnershipPitchProps, type PartnershipTier, type RegistrationData } from './partnership-pitch';
