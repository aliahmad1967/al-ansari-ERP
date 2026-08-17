import { useId, useRef, useState, type DragEvent, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { File, FileWarning, Upload, X } from 'lucide-react'

import Button from '@/components/ui/Button'
import { cn } from '@/lib/cn'
import { formatBytes } from '@/lib/utils'

export interface FileUploadProps {
  /** Comma separated MIME types / extensions, e.g. "image/png,image/jpeg". */
  accept?: string
  multiple?: boolean
  maxFiles?: number
  maxSizeBytes?: number
  value: File[]
  onChange: (files: File[]) => void
  label?: ReactNode
  description?: ReactNode
  disabled?: boolean
  error?: ReactNode
  className?: string
}

export function FileUpload({
  accept,
  multiple = false,
  maxFiles = 1,
  maxSizeBytes,
  value,
  onChange,
  label,
  description,
  disabled = false,
  error,
  className,
}: FileUploadProps) {
  const { t } = useTranslation('ui')
  const inputRef = useRef<HTMLInputElement>(null)
  const inputId = useId()
  const [isDragging, setIsDragging] = useState(false)

  const isMaxed = multiple && value.length >= maxFiles

  const isValidFile = (file: File): { valid: boolean; reason?: string } => {
    if (maxSizeBytes !== undefined && file.size > maxSizeBytes) {
      return { valid: false, reason: `${t('fileUpload.tooLarge')} (${formatBytes(maxSizeBytes)})` }
    }
    return { valid: true }
  }

  const addFiles = (files: File[]): void => {
    if (disabled) return

    const incoming = Array.from(files)
    if (!multiple) {
      const first = incoming[0]
      onChange(first ? [first] : [])
      return
    }

    const remaining = Math.max(0, maxFiles - value.length)
    onChange([...value, ...incoming.slice(0, remaining)])
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    addFiles(Array.from(event.target.files ?? []))
    event.target.value = ''
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>): void => {
    event.preventDefault()
    setIsDragging(false)
    addFiles(Array.from(event.dataTransfer.files))
  }

  const handleRemove = (file: File): void => {
    onChange(value.filter((item) => item !== file))
  }

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        aria-describedby={error ? `${inputId}-error` : undefined}
        onClick={() => {
          if (!disabled && !isMaxed) inputRef.current?.click()
        }}
        onKeyDown={(event) => {
          if (disabled) return
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            if (!isMaxed) inputRef.current?.click()
          }
        }}
        onDragOver={(event) => {
          event.preventDefault()
          if (!disabled) setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-6 py-8 text-center transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring/40',
          isDragging
            ? 'border-primary bg-primary-subtle'
            : error
              ? 'border-danger/60 bg-danger-subtle/40'
              : 'border-border-strong hover:border-primary hover:bg-primary-subtle/40',
          disabled && 'cursor-not-allowed opacity-60',
        )}
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-raised text-content-subtle shadow-sm">
          <Upload className="h-5 w-5" aria-hidden="true" />
        </span>

        {label ? (
          <p className="text-sm font-medium text-content">{label}</p>
        ) : (
          <p className="text-sm font-medium text-content">
            {t('fileUpload.dropHere')}{' '}
            <span className="text-primary">{t('fileUpload.browse')}</span>
          </p>
        )}

        {description && <p className="text-xs text-content-subtle">{description}</p>}

        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          onChange={handleInputChange}
          className="sr-only"
          tabIndex={-1}
        />
      </div>

      {error && (
        <p id={`${inputId}-error`} className="text-sm text-danger" role="alert">
          {error}
        </p>
      )}

      {value.length > 0 && (
        <ul className="flex flex-col gap-2">
          {value.map((file) => {
            const fileError = isValidFile(file)
            return (
              <li
                key={`${file.name}-${file.lastModified}`}
                className="flex items-center gap-3 rounded-md border border-border bg-surface-raised px-3 py-2"
              >
                {fileError.valid ? (
                  <File className="h-4 w-4 shrink-0 text-content-subtle" aria-hidden="true" />
                ) : (
                  <FileWarning className="h-4 w-4 shrink-0 text-danger" aria-hidden="true" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-content">{file.name}</p>
                  <p className="text-xs text-content-subtle">
                    {formatBytes(file.size)}
                    {!fileError.valid && <span className="text-danger"> — {fileError.reason}</span>}
                  </p>
                </div>
                {!disabled && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemove(file)}
                    aria-label={`${t('fileUpload.remove')} ${file.name}`}
                    className="text-content-subtle"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </Button>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export default FileUpload
