/** Application-wide configuration values. */

export const APP_NAME = 'AL-ANSARI ERP'

/** ISO 4217 currency code used for money formatting. */
export const APP_CURRENCY = 'SAR'

/** LocalStorage keys — single source of truth for persisted UI state. */
export const STORAGE_KEYS = {
  theme: 'al-ansari:theme',
  language: 'al-ansari:language',
  sidebarCollapsed: 'al-ansari:sidebar-collapsed',
  session: 'al-ansari:session',
} as const

/** Session timeout in milliseconds (30 minutes). */
export const SESSION_TIMEOUT_MS = 30 * 60 * 1000

/**
 * Responsive breakpoints in pixels, mirroring the CSS `--breakpoint-*` tokens
 * (see globals.css). Useful for JS-side media queries via useMediaQuery.
 */
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const

export type BreakpointKey = keyof typeof BREAKPOINTS

/** Layout dimensions in pixels (mirrors the CSS layout tokens). */
export const LAYOUT = {
  sidebarWidth: 256,
  sidebarWidthCollapsed: 72,
  topbarHeight: 64,
  topbarHeightMobile: 56,
  mobileNavHeight: 60,
  contentMaxWidth: 1408,
} as const

/** Semantic z-index scale (mirrors the CSS z-index tokens). */
export const Z_INDEX = {
  dropdown: 30,
  sticky: 40,
  drawer: 50,
  modal: 60,
  tooltip: 70,
  toast: 80,
  skip: 100,
} as const
