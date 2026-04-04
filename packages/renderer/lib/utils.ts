/**
 * Local utility — lightweight classname merge.
 * We keep a local copy to avoid depending on @dds/ui internals.
 */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}
