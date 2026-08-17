/** Generic design-system types shared across components. */

/** Semantic status/alert tone used across badges, alerts, stats and toasts. */
export type Tone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info'

/** Common control sizes. */
export type Size = 'sm' | 'md' | 'lg'

/** Table sort direction. */
export type SortDirection = 'asc' | 'desc'

/** Horizontal alignment (logical, direction-aware). */
export type Align = 'start' | 'center' | 'end'

/** Simple pagination state. */
export interface PaginationState {
  page: number
  pageSize: number
}
