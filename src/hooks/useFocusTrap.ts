import { useEffect, type RefObject } from 'react'

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

export interface UseFocusTrapOptions {
  enabled: boolean
  /** Element to focus on activation; defaults to the first focusable element. */
  initialFocus?: RefObject<HTMLElement | null>
  /** Called when Escape is pressed while the trap is active. */
  onEscape?: () => void
}

function getFocusable(element: HTMLElement): HTMLElement[] {
  return Array.from(element.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (node) => node.offsetParent !== null || node === document.activeElement,
  )
}

/**
 * Traps keyboard focus inside `ref` while `enabled`, restores focus to the
 * previously focused element on deactivation, and reports Escape presses.
 */
export function useFocusTrap<T extends HTMLElement>(
  ref: RefObject<T | null>,
  { enabled, initialFocus, onEscape }: UseFocusTrapOptions,
): void {
  useEffect(() => {
    if (!enabled) return

    const container = ref.current
    if (!container) return

    const previouslyFocused = document.activeElement as HTMLElement | null

    const focusInitial = (): void => {
      const target =
        initialFocus?.current ??
        container.querySelector<HTMLElement>('[data-autofocus]') ??
        getFocusable(container)[0]
      target?.focus()
    }

    focusInitial()

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        event.stopPropagation()
        onEscape?.()
        return
      }

      if (event.key !== 'Tab') return

      const focusable = getFocusable(container)
      if (focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (!first || !last) return

      const active = document.activeElement

      if (event.shiftKey) {
        if (active === first || active === container || !container.contains(active)) {
          event.preventDefault()
          last.focus()
        }
      } else if (active === last || !container.contains(active)) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown, true)

    return () => {
      document.removeEventListener('keydown', onKeyDown, true)
      previouslyFocused?.focus()
    }
  }, [ref, enabled, initialFocus, onEscape])
}
