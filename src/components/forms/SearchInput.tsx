import { forwardRef, type ChangeEvent, type InputHTMLAttributes } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, X } from 'lucide-react'

import Input, { type InputSize } from '@/components/ui/Input'
import Spinner from '@/components/ui/Spinner'
import { cn } from '@/lib/cn'

export interface SearchInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'size' | 'className'
> {
  size?: InputSize
  /** Shows a spinner in place of the clear button while loading. */
  loading?: boolean
  /** Whether the clear button is rendered. */
  clearable?: boolean
  onClear?: () => void
  className?: string
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(function SearchInput(
  { size = 'md', loading = false, clearable = true, onClear, className, ...rest },
  ref,
) {
  const { t } = useTranslation('ui')
  const value = rest.value

  const endAdornment = loading ? (
    <Spinner size={16} />
  ) : clearable && value ? (
    <button
      type="button"
      onClick={() => {
        onClear?.()
        rest.onChange?.({ target: { value: '' } } as ChangeEvent<HTMLInputElement>)
      }}
      aria-label={t('search.clear')}
      className="inline-flex h-6 w-6 items-center justify-center rounded text-content-subtle transition-colors hover:bg-surface-sunken hover:text-content focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring/40"
    >
      <X className="h-3.5 w-3.5" aria-hidden="true" />
    </button>
  ) : null

  return (
    <Input
      ref={ref}
      type="search"
      size={size}
      placeholder={rest.placeholder ?? t('search.placeholder')}
      startAdornment={<Search className="h-4 w-4" aria-hidden="true" />}
      endAdornment={endAdornment}
      aria-label={rest['aria-label'] ?? rest.placeholder ?? t('search.placeholder')}
      className={cn(className)}
      {...rest}
    />
  )
})

export default SearchInput
