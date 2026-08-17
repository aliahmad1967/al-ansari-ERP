/**
 * Domain-layer validation used by repositories and services.
 *
 * UI validation (src/lib/validation.ts) gives instant feedback; this layer
 * enforces business rules again before anything is written to the database.
 */

import { DatabaseError, DatabaseErrorCode, type DatabaseErrorContext } from '../database/errors'

export interface ValidationIssue {
  field: string
  message: string
}

export class ValidationError extends DatabaseError {
  readonly issues: ValidationIssue[]

  constructor(issues: ValidationIssue[], context?: DatabaseErrorContext) {
    super(DatabaseErrorCode.DB_VALIDATION_FAILED, 'Validation failed for the provided input.', {
      context,
    })
    this.name = 'ValidationError'
    this.issues = issues
  }
}

export type FieldValidator = (value: unknown) => string | undefined

/** A validator factory that requires a non-empty value. */
export function required(label: string): FieldValidator {
  return (value) => {
    if (value === undefined || value === null) return `${label} is required.`
    if (typeof value === 'string' && value.trim() === '') return `${label} is required.`
    return undefined
  }
}

/** A validator factory that requires a valid email address. */
export function email(label: string): FieldValidator {
  return (value) => {
    if (typeof value !== 'string' || value.trim() === '') return undefined
    if (!isValidEmail(value.trim())) return `${label} must be a valid email address.`
    return undefined
  }
}

/** A validator factory enforcing a minimum length on strings. */
export function minLength(label: string, min: number): FieldValidator {
  return (value) => {
    if (typeof value !== 'string') return undefined
    if (value.length < min) return `${label} must be at least ${min} characters.`
    return undefined
  }
}

/** A validator factory enforcing a maximum length on strings. */
export function maxLength(label: string, max: number): FieldValidator {
  return (value) => {
    if (typeof value !== 'string') return undefined
    if (value.length > max) return `${label} must not exceed ${max} characters.`
    return undefined
  }
}

/** A validator factory enforcing a regular expression. */
export function matches(label: string, regex: RegExp): FieldValidator {
  return (value) => {
    if (typeof value !== 'string' || value.trim() === '') return undefined
    if (!regex.test(value.trim())) return `${label} is not valid.`
    return undefined
  }
}

/** A validator factory enforcing membership in an allowed set. */
export function oneOf(label: string, allowed: readonly string[]): FieldValidator {
  return (value) => {
    if (value === undefined || value === null) return undefined
    if (typeof value !== 'string' || !allowed.includes(value)) {
      return `${label} must be one of: ${allowed.join(', ')}.`
    }
    return undefined
  }
}

/** Runs all validators and collects the issues found. Undefined validators are skipped. */
export function validateFields(
  record: Record<string, unknown>,
  validators: Record<string, FieldValidator | undefined>,
): ValidationIssue[] {
  const issues: ValidationIssue[] = []
  for (const [field, validate] of Object.entries(validators)) {
    if (!validate) continue
    const message = validate(record[field])
    if (message) issues.push({ field, message })
  }
  return issues
}

/** Throws a {@link ValidationError} when issues were found. */
export function throwIfInvalid(issues: ValidationIssue[], context?: DatabaseErrorContext): void {
  if (issues.length > 0) {
    throw new ValidationError(issues, context)
  }
}

/** Runs validators in order and returns the first error message, if any. */
export function combineValidators(...validators: FieldValidator[]): FieldValidator {
  return (value) => {
    for (const validator of validators) {
      const message = validator(value)
      if (message) return message
    }
    return undefined
  }
}

/** Basic RFC-style email check. */
export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

/** True when `value` is a non-empty string. */
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}
