/**
 * ChangePasswordPage — forces the user to change their password.
 *
 * Shown when mustChangePassword is true after login.
 * Supports both mandatory and skippable flows.
 */

import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, KeyRound, SkipForward } from 'lucide-react'

import Button from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Alert } from '@/components/ui/Alert'
import { useAuth } from '@/hooks/useAuth'

export default function ChangePasswordPage() {
  const { t } = useTranslation('auth')
  const { t: tCommon } = useTranslation('common')
  const { session, changePassword } = useAuth()
  const navigate = useNavigate()

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const userId = session?.user.id

  function validate(): string | null {
    if (!currentPassword) return tCommon('validation.required')
    if (newPassword.length < 8) return t('changePassword.passwordTooShort')
    if (newPassword !== confirmPassword) return t('changePassword.passwordMismatch')
    return null
  }

  async function handleSubmit(e: FormEvent): Promise<void> {
    e.preventDefault()
    setError(null)

    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }
    if (!userId) return

    setIsSubmitting(true)
    const result = await changePassword(userId, currentPassword, newPassword)
    setIsSubmitting(false)

    if (result.success) {
      setSuccess(true)
      setTimeout(() => navigate('/', { replace: true }), 1500)
    } else {
      setError(result.error ? t(result.error) : t('changePassword.changePasswordFailed'))
    }
  }

  function handleSkip(): void {
    navigate('/', { replace: true })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="mb-8 flex flex-col items-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-content">
            <KeyRound className="h-7 w-7" aria-hidden="true" />
          </span>
          <h1 className="mt-4 text-xl font-bold text-content">{t('changePassword.title')}</h1>
          <p className="mt-1 text-center text-sm text-content-subtle">
            {t('changePassword.subtitle')}
          </p>
        </div>

        {/* Form card */}
        <div className="rounded-lg border border-border bg-surface-raised p-6 shadow-sm">
          {error && (
            <Alert tone="danger" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert tone="success">{t('changePassword.success')}</Alert>
          )}

          {!success && (
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div>
                <label
                  htmlFor="currentPassword"
                  className="mb-1 block text-sm font-medium text-content"
                >
                  {t('changePassword.currentPassword')}
                </label>
                <Input
                  id="currentPassword"
                  type={showCurrent ? 'text' : 'password'}
                  autoComplete="current-password"
                  autoFocus
                  required
                  placeholder={t('changePassword.currentPasswordPlaceholder')}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  disabled={isSubmitting}
                  endAdornment={
                    <button
                      type="button"
                      onClick={() => setShowCurrent(!showCurrent)}
                      className="text-content-subtle hover:text-content"
                      tabIndex={-1}
                    >
                      {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  }
                />
              </div>

              <div>
                <label
                  htmlFor="newPassword"
                  className="mb-1 block text-sm font-medium text-content"
                >
                  {t('changePassword.newPassword')}
                </label>
                <Input
                  id="newPassword"
                  type={showNew ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  placeholder={t('changePassword.newPasswordPlaceholder')}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={isSubmitting}
                  endAdornment={
                    <button
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      className="text-content-subtle hover:text-content"
                      tabIndex={-1}
                    >
                      {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  }
                />
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-1 block text-sm font-medium text-content"
                >
                  {t('changePassword.confirmPassword')}
                </label>
                <Input
                  id="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  placeholder={t('changePassword.confirmPasswordPlaceholder')}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isSubmitting}
                  endAdornment={
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="text-content-subtle hover:text-content"
                      tabIndex={-1}
                    >
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  }
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting || !currentPassword || !newPassword || !confirmPassword}
              >
                {isSubmitting ? t('changePassword.submitting') : t('changePassword.submit')}
              </Button>
            </form>
          )}

          {!success && (
            <div className="mt-4 border-t border-border pt-4">
              <Alert tone="warning">{t('changePassword.skipWarning')}</Alert>
              <Button
                variant="ghost"
                className="mt-3 w-full"
                onClick={handleSkip}
                disabled={isSubmitting}
              >
                <SkipForward className="me-2 h-4 w-4" aria-hidden="true" />
                {t('changePassword.skip')}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
