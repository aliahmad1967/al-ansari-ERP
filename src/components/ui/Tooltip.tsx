import {
  cloneElement,
  useCallback,
  useId,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react'

import { cn } from '@/lib/cn'

export type TooltipSide = 'top' | 'bottom' | 'start' | 'end'

export interface TooltipProps {
  label: ReactNode
  side?: TooltipSide
  /** Delay in milliseconds before the tooltip appears. */
  delay?: number
  children: ReactElement
  className?: string
}

const sideClasses: Record<TooltipSide, string> = {
  top: 'bottom-full mb-2 start-1/2 -translate-x-1/2',
  bottom: 'top-full mt-2 start-1/2 -translate-x-1/2',
  start: 'end-full me-2 top-1/2 -translate-y-1/2',
  end: 'start-full ms-2 top-1/2 -translate-y-1/2',
}

export function Tooltip({ label, side = 'top', delay = 150, children, className }: TooltipProps) {
  const [visible, setVisible] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const tooltipId = useId()

  const show = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => setVisible(true), delay)
  }, [delay])

  const hide = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setVisible(false)
  }, [])

  const trigger = visible
    ? cloneElement(children as ReactElement<Record<string, unknown>>, {
        'aria-describedby': tooltipId,
      })
    : children

  return (
    <span
      className={cn('relative inline-flex', className)}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {trigger}
      {visible && (
        <span
          role="tooltip"
          id={tooltipId}
          className={cn(
            'pointer-events-none absolute z-tooltip max-w-64 rounded-md bg-surface-inverse px-2.5 py-1.5 text-xs font-medium text-content-inverse shadow-md',
            'animate-[ds-fade-in_100ms_ease-out]',
            sideClasses[side],
          )}
        >
          {label}
        </span>
      )}
    </span>
  )
}

export default Tooltip
