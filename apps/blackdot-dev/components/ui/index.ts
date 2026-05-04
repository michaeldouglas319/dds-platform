/**
 * UI Components Barrel Export
 *
 * Layer 1 components: Base shadcn/ui + Radix UI components with zero business logic.
 * These are primitive components for building user interfaces.
 *
 * @category ui
 * @layer 1
 */

// Core UI components
export { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from './accordion';
export { Avatar, AvatarImage, AvatarFallback } from './avatar';
export { Badge } from './badge';
export { Button, buttonVariants } from './button';
export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from './card';
export { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from './dialog';
export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup
} from './dropdown-menu';
export { Input } from './input';
export { Label } from './label';
export { ScrollArea, ScrollBar } from './scroll-area';
export { Separator } from './separator';
export { Slider } from './slider';
export { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs';
export { Textarea } from './textarea';
export { ThemeToggle } from './theme-toggle';
