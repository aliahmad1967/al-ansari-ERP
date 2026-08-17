import { BREAKPOINTS, type BreakpointKey } from '@/config/app.config'
import { useMediaQuery } from '@/hooks/useMediaQuery'

/**
 * Returns true when the viewport is at or above the given breakpoint
 * (mobile-first, mirrors the Tailwind breakpoint tokens).
 */
export function useBreakpoint(breakpoint: BreakpointKey): boolean {
  return useMediaQuery(`(min-width: ${BREAKPOINTS[breakpoint]}px)`)
}

/** Convenience: true below the desktop (lg) breakpoint. */
export function useIsMobile(): boolean {
  return !useBreakpoint('lg')
}
