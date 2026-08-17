/**
 * LoginPage — bilingual login form (Arabic / English).
 *
 * Handles credential submission, error display, and redirects on success.
 * The page redirects authenticated users away automatically.
 */

import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'
import { Boxes, Eye, EyeOff, LogIn } from 'lucide-react'

import Button from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Alert } from '@/components/ui/Alert'
import { useAuth } from '@/hooks/useAuth'

export default function LoginPage() {
  const { t } = useTranslation('auth')
  const { t: tCommon } = useTranslation('common')
  const { login, error, clearError, isLoading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/'

  async function handleSubmit(e: FormEvent): Promise<void> {
    e.preventDefault()
    clearError()
    setLocalError(null)

    if (!username.trim() || !password) {
      setLocalError(tCommon('validation.required'))
      return
    }

    const result = await login({ username: username.trim(), password })
    if (result.success) {
      if (result.mustChangePassword) {
        navigate('/change-password', { replace: true })
      } else {
        navigate(from, { replace: true })
      }
    }
  }

  const displayError = localError ?? (error ? t(error) : null)

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="mb-8 flex flex-col items-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-content">
            <Boxes className="h-7 w-7" aria-hidden="true" />
          </span>
          <h1 className="mt-4 text-xl font-bold text-content">{tCommon('appName')}</h1>
          <p className="mt-1 text-sm text-content-subtle">{t('subtitle')}</p>
        </div>

        {/* Form card */}
        <div className="rounded-lg border border-border bg-surface-raised p-6 shadow-sm">
          <h2 className="mb-6 text-center text-lg font-semibold text-content">{t('title')}</h2>

          {displayError && (
            <Alert tone="danger" onClose={() => { clearError(); setLocalError(null) }}>
              {displayError}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="mt-4 space-y-4" noValidate>
            <div>
              <label htmlFor="username" className="mb-1 block text-sm font-medium text-content">
                {t('username')}
              </label>
              <Input
                id="username"
                type="text"
                autoComplete="username"
                autoFocus
                required
                placeholder={t('usernamePlaceholder')}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
                startAdornment={<LogIn className="h-4 w-4" aria-hidden="true" />}
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1 block text-sm font-medium text-content">
                {t('password')}
              </label>
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                placeholder={t('passwordPlaceholder')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                endAdornment={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-content-subtle hover:text-content"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <Eye className="h-4 w-4" aria-hidden="true" />
                    )}
                  </button>
                }
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !username.trim() || !password}
            >
              {isLoading ? t('submitting') : t('submit')}
            </Button>
          </form>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-content-subtle">
          {tCommon('footer.copyright', { year: new Date().getFullYear() })}
        </p>
      </div>
    </div>
  )
}
