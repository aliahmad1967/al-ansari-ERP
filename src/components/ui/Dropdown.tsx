import {
  Children,
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
} from 'react'

import { cn } from '@/lib/cn'
import { useClickOutside } from '@/hooks/useClickOutside'

export type DropdownAlign = 'start' | 'end'

export interface DropdownProps {
  /** The element that toggles the menu. Handlers are cloned onto it. */
  trigger: ReactElement
  align?: DropdownAlign
  disabled?: boolean
  onOpenChange?: (open: boolean) => void
  className?: string
  children?: ReactNode
}

export interface DropdownItemProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  icon?: ReactNode
  danger?: boolean
  onSelect?: () => void
}

export interface DropdownLabelProps {
  children: ReactNode
}

export interface DropdownSeparatorProps {
  className?: string
}

function getTriggerClick(
  trigger: ReactElement,
  onToggle: () => void,
): (event: React.MouseEvent) => void {
  const original = (trigger.props as { onClick?: (event: React.MouseEvent) => void }).onClick
  return (event) => {
    original?.(event)
    if (event.defaultPrevented) return
    onToggle()
  }
}

export function Dropdown({
  trigger,
  align = 'start',
  disabled = false,
  onOpenChange,
  className,
  children,
}: DropdownProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const menuId = useId()

  const close = useCallback(() => {
    setOpen(false)
    onOpenChange?.(false)
  }, [onOpenChange])

  const toggle = useCallback(() => {
    setOpen((current) => {
      onOpenChange?.(!current)
      return !current
    })
  }, [onOpenChange])

  useClickOutside(containerRef, close, open)

  const collectItems = (): HTMLButtonElement[] =>
    Array.from(
      menuRef.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]') ?? [],
    ).filter((item) => !item.disabled)

  const handleMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    const items = collectItems()
    if (items.length === 0) return

    const currentIndex = items.findIndex((item) => item === document.activeElement)

    const moveFocus = (index: number): void => {
      const target = items[index]
      target?.focus()
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        moveFocus(currentIndex < 0 ? 0 : (currentIndex + 1) % items.length)
        break
      case 'ArrowUp':
        event.preventDefault()
        moveFocus(currentIndex <= 0 ? items.length - 1 : currentIndex - 1)
        break
      case 'Home':
        event.preventDefault()
        moveFocus(0)
        break
      case 'End':
        event.preventDefault()
        moveFocus(items.length - 1)
        break
      case 'Tab':
        close()
        break
      default:
        break
    }
  }

  useEffect(() => {
    if (!open) return
    collectItems()[0]?.focus()
  }, [open])

  const childrenArray = Children.toArray(children)

  const triggerWithProps = disabled
    ? trigger
    : cloneElement(trigger as ReactElement<Record<string, unknown>>, {
        onClick: getTriggerClick(trigger, toggle),
        'aria-haspopup': 'menu',
        'aria-expanded': open,
        'aria-controls': open ? menuId : undefined,
      })

  return (
    <div ref={containerRef} className={cn('relative inline-block', className)}>
      {triggerWithProps}

      {open && (
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          tabIndex={-1}
          onKeyDown={handleMenuKeyDown}
          className={cn(
            'absolute top-full z-dropdown mt-1 min-w-52 rounded-md border border-border bg-surface-overlay p-1 shadow-lg',
            'animate-[ds-slide-in-down_120ms_ease-out]',
            'focus:outline-none',
            align === 'start' ? 'start-0' : 'end-0',
          )}
        >
          {Children.map(childrenArray, (child) => {
            if (!isValidElement(child)) return child

            if (child.type === DropdownItem) {
              const itemProps = child.props as DropdownItemProps
              const { onSelect, ...restProps } = itemProps

              const handleSelect = (): void => {
                onSelect?.()
                close()
              }

              return cloneElement(child as ReactElement<Record<string, unknown>>, {
                role: 'menuitem',
                onSelect: handleSelect,
                ...restProps,
              })
            }

            return child
          })}
        </div>
      )}
    </div>
  )
}

export function DropdownItem({
  icon,
  danger = false,
  onSelect,
  onClick,
  disabled,
  className,
  children,
  ...rest
}: DropdownItemProps) {
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>): void => {
    onClick?.(event)
    if (event.defaultPrevented) return
    onSelect?.()
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={handleClick}
      className={cn(
        'flex w-full cursor-pointer items-center gap-2.5 rounded-md px-3 py-2 text-start text-sm transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring/40',
        'disabled:cursor-not-allowed disabled:opacity-60',
        danger ? 'text-danger hover:bg-danger-subtle' : 'text-content hover:bg-surface-sunken',
        className,
      )}
      {...rest}
    >
      {icon && (
        <span
          className={cn(
            'flex h-4 w-4 shrink-0 items-center justify-center',
            danger ? 'text-danger' : 'text-content-subtle',
          )}
        >
          {icon}
        </span>
      )}
      {children}
    </button>
  )
}

export function DropdownLabel({ children }: DropdownLabelProps) {
  return (
    <div className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-content-subtle">
      {children}
    </div>
  )
}

export function DropdownSeparator({ className }: DropdownSeparatorProps) {
  return <div role="separator" className={cn('my-1 h-px bg-border', className)} />
}

export default Dropdown
