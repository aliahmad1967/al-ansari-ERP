import { useTranslation } from 'react-i18next'
import { Calculator } from 'lucide-react'

import PageLayout from '@/components/layout/PageLayout'
import { RequirePermission } from '@/components/auth/RequirePermission'

export default function TrialBalance() {
  const { t } = useTranslation('accounting')

  return (
    <RequirePermission permission="accounting.reports.view">
      <PageLayout
        title={t('reports.trialBalance')}
        icon={<Calculator className="h-5 w-5" />}
      >
        <div className="bg-card rounded-lg border border-border p-6">
          <p className="text-content-muted">{t('reports.trialBalanceDescription')}</p>
        </div>
      </PageLayout>
    </RequirePermission>
  )
}
