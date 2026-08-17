import { useSyncExternalStore } from 'react'

import { getTheme, setTheme, subscribeTheme, toggleTheme, type Theme } from '@/stores/theme.store'

export interface UseThemeResult {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

export function useTheme(): UseThemeResult {
  const theme = useSyncExternalStore(subscribeTheme, getTheme)

  return {
    theme,
    setTheme,
    toggleTheme,
  }
}
