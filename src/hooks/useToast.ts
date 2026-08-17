import { useSyncExternalStore } from 'react'

import type { ToastInput, ToastItem, ToastTone } from '@/stores/notification.store'
import {
  clearToasts,
  dismissToast,
  getToasts,
  pushToast,
  subscribeToasts,
} from '@/stores/notification.store'

export interface ToastOptions {
  title: string
  description?: string
  duration?: number
}

export interface UseToastResult {
  toasts: ToastItem[]
  success: (options: ToastOptions) => string
  error: (options: ToastOptions) => string
  warning: (options: ToastOptions) => string
  info: (options: ToastOptions) => string
  dismiss: (id: string) => void
  clear: () => void
}

function notify(tone: ToastTone, options: ToastOptions): string {
  const input: ToastInput = { tone, ...options }
  return pushToast(input)
}

/** Hook-based access to the toast store. */
export function useToast(): UseToastResult {
  const toasts = useSyncExternalStore(subscribeToasts, getToasts)

  return {
    toasts,
    success: (options) => notify('success', options),
    error: (options) => notify('danger', options),
    warning: (options) => notify('warning', options),
    info: (options) => notify('info', options),
    dismiss: dismissToast,
    clear: clearToasts,
  }
}

/** Imperative access to the toast store (usable outside of React components). */
export const toast = {
  success: (options: ToastOptions): string => notify('success', options),
  error: (options: ToastOptions): string => notify('danger', options),
  warning: (options: ToastOptions): string => notify('warning', options),
  info: (options: ToastOptions): string => notify('info', options),
  dismiss: dismissToast,
  clear: clearToasts,
}
