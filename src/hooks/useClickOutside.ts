import { useEffect, type RefObject } from 'react'

/**
 * Calls `handler` when a pointer event occurs outside of the referenced element.
 * Used to dismiss popovers, dropdowns and date pickers.
 */
export function useClickOutside<T extends HTMLElement>(
  ref: RefObject<T | null>,
  handler: (event: MouseEvent | TouchEvent) => void,
  enabled = true,
): void {
  useEffect(() => {
    if (!enabled) return

    const onPointerDown = (event: MouseEvent | TouchEvent): void => {
      const element = ref.current
      if (!element) return

      const target = event.target as Node | null
      if (target && element.contains(target)) return

      handler(event)
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('touchstart', onPointerDown)

    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('touchstart', onPointerDown)
    }
  }, [ref, handler, enabled])
}
