/**
 * Password policy — centralized password strength validation.
 *
 * SECURITY: All password validation must go through this module.
 * Never validate passwords directly in UI components.
 */

export interface PasswordPolicy {
  minLength: number
  maxLength: number
  requireUppercase: boolean
  requireLowercase: boolean
  requireDigit: boolean
  requireSpecial: boolean
}

export const DEFAULT_PASSWORD_POLICY: PasswordPolicy = {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireDigit: true,
  requireSpecial: false,
}

export interface PasswordValidationResult {
  valid: boolean
  errors: string[]
}

/**
 * Validates a password against the policy.
 * Returns an object with `valid` flag and an array of error message keys.
 */
export function validatePassword(
  password: string,
  policy: PasswordPolicy = DEFAULT_PASSWORD_POLICY,
): PasswordValidationResult {
  const errors: string[] = []

  if (password.length < policy.minLength) {
    errors.push('validation.passwordTooShort')
  }

  if (password.length > policy.maxLength) {
    errors.push('validation.passwordTooLong')
  }

  if (policy.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('validation.passwordNoUppercase')
  }

  if (policy.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('validation.passwordNoLowercase')
  }

  if (policy.requireDigit && !/[0-9]/.test(password)) {
    errors.push('validation.passwordNoDigit')
  }

  if (policy.requireSpecial && !/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(password)) {
    errors.push('validation.passwordNoSpecial')
  }

  return { valid: errors.length === 0, errors }
}

/** Maximum allowed password length to prevent scrypt DoS. */
export const MAX_PASSWORD_LENGTH = 128

/**
 * Truncates a password to the maximum allowed length before hashing.
 * This prevents denial-of-service attacks via extremely long passwords
 * that would take excessive time to hash with scrypt/PBKDF2.
 */
export function sanitizePasswordLength(password: string): string {
  return password.slice(0, MAX_PASSWORD_LENGTH)
}
