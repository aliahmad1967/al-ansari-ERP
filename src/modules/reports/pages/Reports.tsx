import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import {
  Users,
  DollarSign,
  Package,
  ShoppingCart,
  FileCheck,
  FolderKanban,
  BarChart3,
} from 'lucide-react'
import PageLayout from '@/components/layout/PageLayout'
import { Card, CardContent } from '@/components/ui/Card'
import { RequirePermission } from '@/components/auth/RequirePermission'

interface ReportCard {
  id: string
  titleKey: string
  descriptionKey: string
  icon: typeof Users
  route: string
  permission: string
  tone: 'primary' | 'success' | 'info' | 'warning' | 'danger'
}

const REPORT_CARDS: ReportCard[] = [
  {
    id: 'hr',
    titleKey: 'reports:modules.hr',
    descriptionKey: 'reports:modules.hrDescription',
    icon: Users,
    route: '/reports/hr',
    permission: 'hr.employee.view',
    tone: 'primary',
  },
  {
    id: 'finance',
    titleKey: 'reports:modules.finance',
    descriptionKey: 'reports:modules.financeDescription',
    icon: DollarSign,
    route: '/reports/finance',
    permission: 'finance.invoice.view',
    tone: 'success',
  },
  {
    id: 'inventory',
    titleKey: 'reports:modules.inventory',
    descriptionKey: 'reports:modules.inventoryDescription',
    icon: Package,
    route: '/reports/inventory',
    permission: 'inventory.product.view',
    tone: 'info',
  },
  {
    id: 'procurement',
    titleKey: 'reports:modules.procurement',
    descriptionKey: 'reports:modules.procurementDescription',
    icon: ShoppingCart,
    route: '/reports/procurement',
    permission: 'procurement.order.view',
    tone: 'warning',
  },
  {
    id: 'sales',
    titleKey: 'reports:modules.sales',
    descriptionKey: 'reports:modules.salesDescription',
    icon: FileCheck,
    route: '/reports/sales',
    permission: 'sales.invoice.view',
    tone: 'success',
  },
  {
    id: 'assets',
    titleKey: 'reports:modules.assets',
    descriptionKey: 'reports:modules.assetsDescription',
    icon: BarChart3,
    route: '/reports/assets',
    permission: 'assets.asset.view',
    tone: 'info',
  },
  {
    id: 'projects',
    titleKey: 'reports:modules.projects',
    descriptionKey: 'reports:modules.projectsDescription',
    icon: FolderKanban,
    route: '/reports/projects',
    permission: 'projects.project.view',
    tone: 'primary',
  },
]

const TONE_STYLES: Record<string, string> = {
  primary: 'text-primary',
  success: 'text-success',
  info: 'text-info',
  warning: 'text-warning',
  danger: 'text-danger',
}

export default function Reports() {
  const { t } = useTranslation('reports')
  const navigate = useNavigate()

  return (
    <PageLayout
      title={t('title')}
      description={t('description')}
      breadcrumbs={<span className="text-sm text-content-muted">{t('title')}</span>}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {REPORT_CARDS.map((card) => (
          <RequirePermission key={card.id} permission={card.permission}>
            <Card
              className="cursor-pointer transition-shadow hover:shadow-md"
              onClick={() => navigate(card.route)}
            >
              <CardContent className="flex items-start gap-4 p-6">
                <div className={`mt-0.5 ${TONE_STYLES[card.tone]}`}>
                  <card.icon className="h-8 w-8" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-semibold text-content">{t(card.titleKey)}</h3>
                  <p className="mt-1 text-sm text-content-muted">{t(card.descriptionKey)}</p>
                </div>
              </CardContent>
            </Card>
          </RequirePermission>
        ))}
      </div>
    </PageLayout>
  )
}
