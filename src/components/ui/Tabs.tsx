import {
  createContext,
  useContext,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react'

import { cn } from '@/lib/cn'

export type TabsVariant = 'underline' | 'pill'

export interface TabsProps {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  variant?: TabsVariant
  size?: 'sm' | 'md'
  className?: string
  children: ReactNode
}

export interface TabsListProps {
  className?: string
  children: ReactNode
}

export interface TabsTriggerProps {
  value: string
  disabled?: boolean
  className?: string
  children: ReactNode
}

export interface TabsContentProps {
  value: string
  className?: string
  children: ReactNode
}

interface TabsContextValue {
  value: string
  setValue: (value: string) => void
  variant: TabsVariant
  size: 'sm' | 'md'
  baseId: string
}

const TabsContext = createContext<TabsContextValue | null>(null)

function useTabsContext(): TabsContextValue {
  const context = useContext(TabsContext)
  if (!context) {
    throw new Error('Tabs components must be used within a <Tabs> parent.')
  }
  return context
}

export function Tabs({
  value,
  defaultValue,
  onValueChange,
  variant = 'underline',
  size = 'md',
  className,
  children,
}: TabsProps) {
  const [internalValue, setInternalValue] = useState(defaultValue ?? '')
  const baseId = useId()

  const activeValue = value ?? internalValue

  const setValue = (next: string): void => {
    setInternalValue(next)
    onValueChange?.(next)
  }

  return (
    <TabsContext.Provider value={{ value: activeValue, setValue, variant, size, baseId }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  )
}

export function TabsList({ className, children }: TabsListProps) {
  const { baseId } = useTabsContext()
  const listRef = useRef<HTMLDivElement>(null)

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    const triggers = Array.from(
      listRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]') ?? [],
    ).filter((tab) => !tab.disabled)
    if (triggers.length === 0) return

    const currentIndex = triggers.findIndex((tab) => tab === document.activeElement)
    const moveFocus = (index: number): void => {
      const target = triggers[index]
      target?.focus()
      target?.click()
    }

    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault()
        moveFocus(currentIndex < 0 ? 0 : (currentIndex + 1) % triggers.length)
        break
      case 'ArrowLeft':
        event.preventDefault()
        moveFocus(currentIndex <= 0 ? triggers.length - 1 : currentIndex - 1)
        break
      case 'Home':
        event.preventDefault()
        moveFocus(0)
        break
      case 'End':
        event.preventDefault()
        moveFocus(triggers.length - 1)
        break
      default:
        break
    }
  }

  return (
    <div
      ref={listRef}
      id={baseId}
      role="tablist"
      aria-orientation="horizontal"
      onKeyDown={handleKeyDown}
      className={cn('flex items-center gap-1', className)}
    >
      {children}
    </div>
  )
}

export function TabsTrigger({ value, disabled, className, children }: TabsTriggerProps) {
  const { value: activeValue, setValue, variant, size, baseId } = useTabsContext()
  const isActive = activeValue === value
  const tabId = `${baseId}-tab-${value}`
  const panelId = `${baseId}-panel-${value}`

  return (
    <button
      type="button"
      role="tab"
      id={tabId}
      aria-selected={isActive}
      aria-controls={panelId}
      disabled={disabled}
      tabIndex={isActive ? 0 : -1}
      onClick={() => setValue(value)}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
        'disabled:cursor-not-allowed disabled:opacity-60',
        size === 'sm' ? 'h-8 px-3 text-sm' : 'h-9 px-3.5 text-sm',
        variant === 'underline'
          ? cn(
              'border-b-2 rounded-none',
              isActive
                ? 'border-primary text-primary'
                : 'border-transparent text-content-muted hover:border-border-strong hover:text-content',
            )
          : cn(
              isActive
                ? 'bg-primary-subtle text-primary'
                : 'text-content-muted hover:bg-surface-sunken hover:text-content',
            ),
        className,
      )}
    >
      {children}
    </button>
  )
}

export function TabsContent({ value, className, children }: TabsContentProps) {
  const { value: activeValue, baseId } = useTabsContext()
  const isActive = activeValue === value
  const panelId = `${baseId}-panel-${value}`
  const tabId = `${baseId}-tab-${value}`

  if (!isActive) return null

  return (
    <div
      role="tabpanel"
      id={panelId}
      aria-labelledby={tabId}
      tabIndex={0}
      className={cn('mt-4', className)}
    >
      {children}
    </div>
  )
}

export default Tabs
