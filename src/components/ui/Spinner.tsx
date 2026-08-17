import type { SVGProps } from 'react'

import { cn } from '@/lib/cn'

export interface SpinnerProps extends SVGProps<SVGSVGElement> {
  size?: number
}

/** Circular loading indicator. Inherits `currentColor`. */
export default function Spinner({ size = 16, className, ...rest }: SpinnerProps) {
  return (
    <svg
      className={cn('animate-spin', className)}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      {...rest}
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="4" />
      <path
        d="M22 12a10 10 0 0 0-10-10"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  )
}
