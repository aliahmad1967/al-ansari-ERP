import { useState } from 'react'

import { useDebounce } from '@/hooks/useDebounce'

/**
 * Encapsulates the search + debounce + pagination state used by every
 * list page. The `search` value updates immediately (for the input);
 * `debouncedSearch` updates after `delay` ms (for filtering).
 */
export function useDebouncedSearch(delay = 250) {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const debouncedSearch = useDebounce(search, delay)

  return { search, setSearch, debouncedSearch, page, setPage } as const
}
