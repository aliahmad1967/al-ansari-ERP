import i18n from '@/i18n/i18n'

/**
 * Localized validators.
 *
 * Every message is resolved through the `validation` translation namespace so
 * errors adapt automatically to the active language. Validators return
 * `undefined` when the value is valid and a translated message otherwise.
 */

export type Validator = (value: string) => string | undefined

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Validates that a string value is present (whitespace is trimmed). */
export const required: Validator = (value) => {
  if (!value.trim()) return i18n.t('validation.required')
  return undefined
}

/** Validates a required email address format. */
export const email: Validator = (value) => {
  const requiredError = required(value)
  if (requiredError) return requiredError
  if (!EMAIL_PATTERN.test(value.trim())) return i18n.t('validation.email')
  return undefined
}

/** Validates a minimum length (after trimming). */
export function minLength(min: number): Validator {
  return (value) => {
    if (value.trim().length < min) return i18n.t('validation.minLength', { count: min })
    return undefined
  }
}

/** Validates a maximum length. */
export function maxLength(max: number): Validator {
  return (value) => {
    if (value.length > max) return i18n.t('validation.maxLength', { count: max })
    return undefined
  }
}

/** Validates that a value is a finite number. */
export const number: Validator = (value) => {
  if (!value.trim()) return undefined
  if (!Number.isFinite(Number(value.trim()))) return i18n.t('validation.number')
  return undefined
}

/** Validates a numeric minimum. */
export function min(minValue: number): Validator {
  return (value) => {
    if (!value.trim()) return undefined
    if (Number(value.trim()) < minValue) return i18n.t('validation.min', { count: minValue })
    return undefined
  }
}

/** Validates a numeric maximum. */
export function max(maxValue: number): Validator {
  return (value) => {
    if (!value.trim()) return undefined
    if (Number(value.trim()) > maxValue) return i18n.t('validation.max', { count: maxValue })
    return undefined
  }
}

/** Validates a value against a regular expression. */
export function pattern(regex: RegExp): Validator {
  return (value) => {
    if (!value.trim()) return undefined
    if (!regex.test(value.trim())) return i18n.t('validation.pattern')
    return undefined
  }
}

/** Runs validators in order and returns the first error message, if any. */
export function combineValidators(...validators: Validator[]): Validator {
  return (value) => {
    for (const validator of validators) {
      const error = validator(value)
      if (error) return error
    }
    return undefined
  }
}
