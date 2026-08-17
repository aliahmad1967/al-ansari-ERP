import { LAYOUT, STORAGE_KEYS } from '@/config/app.config'

export const appName = 'AL-ANSARI ERP'

/** LocalStorage keys — single source of truth. */
export const storageKeys = STORAGE_KEYS

/** Default toast auto-dismiss duration in milliseconds. */
export const DEFAULT_TOAST_DURATION = 4000

/** CSS variable names for layout dimensions (declared in variables.css). */
export const LAYOUT_CSS_VARS = {
  sidebarWidth: '--sidebar-width',
  sidebarWidthCollapsed: '--sidebar-width-collapsed',
  topbarHeight: '--topbar-height',
  topbarHeightMobile: '--topbar-height-mobile',
  mobileNavHeight: '--mobile-nav-height',
  contentMax: '--content-max',
} as const

export { LAYOUT }
