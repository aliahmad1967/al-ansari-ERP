export type ClassValue = string | number | false | null | undefined

/**
 * Joins class names, dropping falsy values. Small dependency-free alternative
 * to clsx; do not use for style-conflict resolution (no tailwind-merge).
 */
export function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(' ')
}
