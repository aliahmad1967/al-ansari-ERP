import { DEFAULT_TOAST_DURATION } from '@/lib/constants'
import { createId } from '@/lib/utils'
import type { Tone } from '@/types/common'

/**
 * Toast (notification) store — external store consumed by useToast.
 * Timers are owned by the store so toasts auto-dismiss even without a viewport.
 */

export type ToastTone = Exclude<Tone, 'neutral' | 'primary'>

export interface ToastInput {
  id?: string
  tone: ToastTone
  title: string
  description?: string
  duration?: number
}

export interface ToastItem extends ToastInput {
  id: string
}

const listeners = new Set<() => void>()
let toasts: ToastItem[] = []
const timers = new Map<string, ReturnType<typeof setTimeout>>()

function emit(): void {
  listeners.forEach((listener) => listener())
}

function clearTimer(id: string): void {
  const timer = timers.get(id)
  if (timer) {
    clearTimeout(timer)
    timers.delete(id)
  }
}

export function getToasts(): ToastItem[] {
  return toasts
}

export function pushToast(input: ToastInput): string {
  const id = input.id ?? createId('toast')
  const item: ToastItem = { ...input, id }
  toasts = [...toasts, item]
  emit()

  const duration = input.duration ?? DEFAULT_TOAST_DURATION
  if (duration > 0) {
    timers.set(
      id,
      setTimeout(() => dismissToast(id), duration),
    )
  }
  return id
}

export function dismissToast(id: string): void {
  clearTimer(id)
  toasts = toasts.filter((toast) => toast.id !== id)
  emit()
}

export function clearToasts(): void {
  timers.forEach((timer) => clearTimeout(timer))
  timers.clear()
  toasts = []
  emit()
}

export function subscribeToasts(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
