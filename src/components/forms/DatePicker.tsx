import { useCallback, useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react'

import Input, { type InputSize, type InputState } from '@/components/ui/Input'
import { cn } from '@/lib/cn'
import { formatNumber, getDateFormatter } from '@/lib/format'
import { parseISODate, toISODate } from '@/lib/utils'
import { useClickOutside } from '@/hooks/useClickOutside'

export interface DatePickerProps {
  value?: string | null
  onChange?: (value: string | null) => void
  min?: string
  max?: string
  placeholder?: string
  disabled?: boolean
  clearable?: boolean
  size?: InputSize
  state?: InputState
  id?: string
  className?: string
}

const WEEK_DAY_COUNT = 7

type WeekStart = 0 | 1 | 2 | 3 | 4 | 5 | 6

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function isDisabledDate(date: Date, min: Date | null, max: Date | null): boolean {
  if (min && date < min) return true
  if (max && date > max) return true
  return false
}

function getWeekStart(weekStartKey: string | undefined): WeekStart {
  if (weekStartKey === 'saturday') return 6
  if (weekStartKey === 'sunday') return 0
  return 1
}

export function DatePicker({
  value,
  onChange,
  min,
  max,
  placeholder,
  disabled = false,
  clearable = true,
  size = 'md',
  state = 'default',
  id,
  className,
}: DatePickerProps) {
  const { t } = useTranslation('ui')
  const containerRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const inputId = useId()

  const selected = useMemo(() => parseISODate(value), [value])
  const minDate = useMemo(() => parseISODate(min), [min])
  const maxDate = useMemo(() => parseISODate(max), [max])

  const weekStart = getWeekStart(t('datePicker.weekStart'))

  const [viewDate, setViewDate] = useState<Date>(() => selected ?? new Date())
  const [focusedDate, setFocusedDate] = useState<Date>(() => selected ?? new Date())

  const dateFormatter = getDateFormatter({ day: '2-digit', month: '2-digit', year: 'numeric' })

  const weekdayNames = (() => {
    const formatter = getDateFormatter({ weekday: 'short' })
    const base = new Date(2024, 0, 1)
    const names = Array.from({ length: WEEK_DAY_COUNT }, (_, index) =>
      formatter.format(new Date(base.getFullYear(), base.getMonth(), base.getDate() + index)),
    )
    return [...names.slice(weekStart), ...names.slice(0, weekStart)]
  })()

  useEffect(() => {
    if (!open) return
    const focusedButton =
      panelRef.current?.querySelector<HTMLButtonElement>('[data-focused="true"]')
    focusedButton?.focus()
  }, [open, viewDate, focusedDate])

  useClickOutside(containerRef, () => setOpen(false), open)

  const handleToggle = (): void => {
    if (!open) {
      const base = selected ?? new Date()
      setViewDate(new Date(base.getFullYear(), base.getMonth(), 1))
      setFocusedDate(base)
    }
    setOpen(!open)
  }

  const handleSelect = useCallback(
    (date: Date) => {
      onChange?.(toISODate(date))
      setOpen(false)
    },
    [onChange],
  )

  const handleClear = (): void => {
    onChange?.(null)
  }

  const moveMonth = (offset: number): void => {
    setViewDate((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1))
  }

  const handlePanelKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    const step = (date: Date): Date => new Date(date.getFullYear(), date.getMonth(), date.getDate())

    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault()
        setFocusedDate((current) => {
          const next = step(current)
          next.setDate(next.getDate() - WEEK_DAY_COUNT)
          if (next.getMonth() !== current.getMonth())
            setViewDate(new Date(next.getFullYear(), next.getMonth(), 1))
          return next
        })
        break
      case 'ArrowDown':
        event.preventDefault()
        setFocusedDate((current) => {
          const next = step(current)
          next.setDate(next.getDate() + WEEK_DAY_COUNT)
          if (next.getMonth() !== current.getMonth())
            setViewDate(new Date(next.getFullYear(), next.getMonth(), 1))
          return next
        })
        break
      case 'ArrowLeft':
        event.preventDefault()
        setFocusedDate((current) => {
          const next = step(current)
          next.setDate(next.getDate() - 1)
          if (next.getMonth() !== current.getMonth())
            setViewDate(new Date(next.getFullYear(), next.getMonth(), 1))
          return next
        })
        break
      case 'ArrowRight':
        event.preventDefault()
        setFocusedDate((current) => {
          const next = step(current)
          next.setDate(next.getDate() + 1)
          if (next.getMonth() !== current.getMonth())
            setViewDate(new Date(next.getFullYear(), next.getMonth(), 1))
          return next
        })
        break
      case 'Enter':
      case ' ':
        event.preventDefault()
        if (!isDisabledDate(focusedDate, minDate, maxDate)) {
          handleSelect(focusedDate)
        }
        break
      case 'Escape':
        event.preventDefault()
        setOpen(false)
        break
      default:
        break
    }
  }

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDayOffset =
    (new Date(year, month, 1).getDay() - weekStart + WEEK_DAY_COUNT) % WEEK_DAY_COUNT
  const totalCells = Math.ceil((firstDayOffset + daysInMonth) / WEEK_DAY_COUNT) * WEEK_DAY_COUNT

  const monthLabel = getDateFormatter({ month: 'long', year: 'numeric' }).format(viewDate)

  const displayValue = selected ? dateFormatter.format(selected) : ''

  const endAdornment = (
    <div className="flex items-center gap-1">
      {clearable && selected && !disabled && (
        <button
          type="button"
          onClick={handleClear}
          aria-label={t('datePicker.clear')}
          className="inline-flex h-6 w-6 items-center justify-center rounded text-content-subtle transition-colors hover:bg-surface-sunken hover:text-content focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring/40"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      )}
      <Calendar className="h-4 w-4" aria-hidden="true" />
    </div>
  )

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? `${inputId}-calendar` : undefined}
        className="block w-full cursor-pointer text-start focus-visible:outline-none"
      >
        <Input
          id={id ?? inputId}
          readOnly
          value={displayValue}
          placeholder={placeholder ?? t('datePicker.placeholder')}
          disabled={disabled}
          size={size}
          state={state}
          endAdornment={endAdornment}
          className="cursor-pointer select-none"
          aria-label={t('datePicker.placeholder')}
        />
      </button>

      {open && (
        <div
          ref={panelRef}
          id={`${inputId}-calendar`}
          role="dialog"
          aria-label={t('datePicker.calendarLabel')}
          onKeyDown={handlePanelKeyDown}
          className={cn(
            'absolute top-full z-dropdown mt-1 w-72 rounded-lg border border-border bg-surface-overlay p-3 shadow-lg',
            'animate-[ds-slide-in-down_120ms_ease-out]',
            'focus:outline-none',
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => moveMonth(-1)}
              aria-label={t('datePicker.previousMonth')}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-content-muted transition-colors hover:bg-surface-sunken hover:text-content focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring/40"
            >
              <ChevronLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
            </button>

            <p className="text-sm font-semibold text-content">{monthLabel}</p>

            <button
              type="button"
              onClick={() => moveMonth(1)}
              aria-label={t('datePicker.nextMonth')}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-content-muted transition-colors hover:bg-surface-sunken hover:text-content focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring/40"
            >
              <ChevronRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
            </button>
          </div>

          <div className="mt-3 grid grid-cols-7 gap-1 text-center">
            {weekdayNames.map((name, index) => (
              <div key={index} className="px-0.5 pb-1 text-xs font-medium text-content-subtle">
                {name}
              </div>
            ))}

            {Array.from({ length: totalCells }, (_, index) => {
              const dayNumber = index - firstDayOffset + 1
              if (dayNumber < 1 || dayNumber > daysInMonth) {
                return <div key={index} aria-hidden="true" />
              }

              const date = new Date(year, month, dayNumber)
              const isSelected = selected ? isSameDay(date, selected) : false
              const isFocused = isSameDay(date, focusedDate)
              const isDisabled = isDisabledDate(date, minDate, maxDate)
              const isToday = isSameDay(date, new Date())

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSelect(date)}
                  disabled={isDisabled}
                  data-focused={isFocused ? 'true' : undefined}
                  tabIndex={isFocused ? 0 : -1}
                  aria-label={dateFormatter.format(date)}
                  aria-current={isSelected ? 'date' : undefined}
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-md text-sm transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring/40',
                    'disabled:cursor-not-allowed disabled:opacity-40',
                    isSelected
                      ? 'bg-primary font-semibold text-primary-content'
                      : isFocused
                        ? 'bg-primary-subtle text-primary'
                        : 'text-content hover:bg-surface-sunken',
                    !isSelected && isToday && 'font-semibold text-primary',
                  )}
                >
                  {formatNumber(dayNumber)}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default DatePicker
