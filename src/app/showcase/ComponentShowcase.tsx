import { useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Boxes,
  Check,
  ChevronDown,
  CircleDollarSign,
  Clock,
  Copy,
  FileCheck,
  FileText,
  Lock,
  Pencil,
  Plus,
  Receipt,
  Save,
  SearchX,
  Send,
  Settings,
  Trash2,
  Truck,
  UserPlus,
  Users,
  Wallet,
  X,
} from 'lucide-react'

import ActivityFeed, { ActivityItem } from '@/components/data-display/ActivityFeed'
import DataTable, { type DataTableColumn } from '@/components/data-display/DataTable'
import StatCard from '@/components/data-display/StatCard'
import StatusBadge from '@/components/data-display/StatusBadge'
import Timeline, { TimelineItem } from '@/components/data-display/Timeline'
import Breadcrumbs from '@/components/layout/Breadcrumbs'
import PageHeader from '@/components/layout/PageHeader'
import PageLayout from '@/components/layout/PageLayout'
import Alert from '@/components/ui/Alert'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Card, {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card'
import Checkbox from '@/components/ui/Checkbox'
import Dialog from '@/components/ui/Dialog'
import Drawer from '@/components/ui/Drawer'
import Dropdown, { DropdownItem, DropdownSeparator } from '@/components/ui/Dropdown'
import EmptyState from '@/components/ui/EmptyState'
import Input from '@/components/ui/Input'
import Pagination from '@/components/ui/Pagination'
import Select from '@/components/ui/Select'
import Skeleton, {
  SkeletonButton,
  SkeletonCard,
  SkeletonCircle,
  SkeletonText,
} from '@/components/ui/Skeleton'
import Switch from '@/components/ui/Switch'
import Tabs, { TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import Tooltip from '@/components/ui/Tooltip'
import DatePicker from '@/components/forms/DatePicker'
import FileUpload from '@/components/forms/FileUpload'
import FormActions from '@/components/forms/FormActions'
import FormField from '@/components/forms/FormField'
import SearchInput from '@/components/forms/SearchInput'
import { toast } from '@/hooks/useToast'
import { formatCurrency, formatDate, formatNumber } from '@/lib/format'
import { email, minLength, required } from '@/lib/validation'
import type { Tone } from '@/types/common'

interface SampleRow {
  id: string
  name: string
  role: string
  status: 'active' | 'pending' | 'blocked'
  amount: number
  lastLogin: string
}

const sampleRows: SampleRow[] = [
  {
    id: 'r1',
    name: 'Sarah Ahmed',
    role: 'Accountant',
    status: 'active',
    amount: 12400,
    lastLogin: '2026-08-15',
  },
  {
    id: 'r2',
    name: 'Omar Khalid',
    role: 'Sales manager',
    status: 'pending',
    amount: 8900,
    lastLogin: '2026-08-14',
  },
  {
    id: 'r3',
    name: 'Lina Haddad',
    role: 'Procurement',
    status: 'active',
    amount: 34000,
    lastLogin: '2026-08-13',
  },
  {
    id: 'r4',
    name: 'Yousef Nasser',
    role: 'Inventory clerk',
    status: 'blocked',
    amount: 0,
    lastLogin: '2026-07-30',
  },
  {
    id: 'r5',
    name: 'Mariam Saleh',
    role: 'HR specialist',
    status: 'pending',
    amount: 5200,
    lastLogin: '2026-08-12',
  },
  {
    id: 'r6',
    name: 'Khalid Fahad',
    role: 'Accountant',
    status: 'active',
    amount: 18750,
    lastLogin: '2026-08-10',
  },
  {
    id: 'r7',
    name: 'Noura Ali',
    role: 'Sales representative',
    status: 'active',
    amount: 9900,
    lastLogin: '2026-08-11',
  },
  {
    id: 'r8',
    name: 'Faisal Omar',
    role: 'Warehouse lead',
    status: 'pending',
    amount: 4300,
    lastLogin: '2026-08-09',
  },
]

const statusTone: Record<SampleRow['status'], Tone> = {
  active: 'success',
  pending: 'warning',
  blocked: 'danger',
}

const swatchClasses: Record<string, string> = {
  primary: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
  info: 'bg-info',
}

function Section({
  title,
  description,
  children,
}: {
  title: ReactNode
  description?: ReactNode
  children: ReactNode
}) {
  return (
    <section className="scroll-mt-24">
      <h2 className="text-lg font-semibold tracking-tight text-content">{title}</h2>
      {description && <p className="mt-1 text-sm text-content-muted">{description}</p>}
      <Card className="mt-4">
        <CardContent className="space-y-6">{children}</CardContent>
      </Card>
    </section>
  )
}

function Row({ label, children }: { label?: ReactNode; children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      {label && (
        <span className="block w-full text-xs font-semibold uppercase tracking-wide text-content-subtle">
          {label}
        </span>
      )}
      {children}
    </div>
  )
}

export default function ComponentShowcase() {
  const { t } = useTranslation('showcase')
  const { t: tUi } = useTranslation('ui')

  const [dialogOpen, setDialogOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [date, setDate] = useState<string | null>(null)
  const [check1, setCheck1] = useState(true)
  const [check2, setCheck2] = useState(false)
  const [check3, setCheck3] = useState(false)
  const [notificationsOn, setNotificationsOn] = useState(true)
  const [pPage, setPPage] = useState(1)
  const [pSize, setPSize] = useState(10)
  const [selected, setSelected] = useState<string[]>([])

  const [nameValue, setNameValue] = useState('')
  const [emailValue, setEmailValue] = useState('')
  const [referenceValue, setReferenceValue] = useState('')
  const [formErrors, setFormErrors] = useState<Record<string, string | undefined>>({})

  const handleFormSubmit = (): void => {
    const errors = {
      name: required(nameValue),
      email: email(emailValue),
      reference: minLength(4)(referenceValue),
    }
    setFormErrors(errors)

    if (Object.values(errors).some(Boolean)) {
      toast.error({ title: t('forms.submitFailed') })
      return
    }

    toast.success({ title: t('forms.submitSuccess') })
    setNameValue('')
    setEmailValue('')
    setReferenceValue('')
  }

  const handleFormReset = (): void => {
    setNameValue('')
    setEmailValue('')
    setReferenceValue('')
    setFormErrors({})
  }

  const statusLabel = (status: SampleRow['status']): string => {
    if (status === 'active') return t('table.statusActive')
    if (status === 'pending') return t('table.statusPending')
    return t('table.statusBlocked')
  }

  const columns: Array<DataTableColumn<SampleRow>> = [
    { key: 'name', header: t('table.name'), sortable: true },
    { key: 'role', header: t('table.role'), sortable: true },
    {
      key: 'status',
      header: t('table.status'),
      sortable: true,
      render: (row) => (
        <StatusBadge tone={statusTone[row.status]} label={statusLabel(row.status)} />
      ),
    },
    {
      key: 'amount',
      header: t('table.amount'),
      align: 'end',
      sortable: true,
      sortValue: (row) => row.amount,
      render: (row) => formatCurrency(row.amount),
    },
    {
      key: 'lastLogin',
      header: t('table.lastLogin'),
      align: 'end',
      sortable: true,
      render: (row) => formatDate(row.lastLogin),
    },
  ]

  const toneList = [
    { key: 'primary', label: t('tokens.tonePrimary') },
    { key: 'success', label: t('tokens.toneSuccess') },
    { key: 'warning', label: t('tokens.toneWarning') },
    { key: 'danger', label: t('tokens.toneDanger') },
    { key: 'info', label: t('tokens.toneInfo') },
  ]

  return (
    <PageLayout
      title={t('title')}
      description={t('description')}
      breadcrumbs={
        <Breadcrumbs
          items={[{ label: t('layout.breadcrumbsHome'), to: '/' }, { label: t('title') }]}
        />
      }
      fullWidth
    >
      <div className="space-y-12">
        <Section title={t('tokens.title')} description={t('tokens.description')}>
          <Row label={t('tokens.semantic')}>
            <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {toneList.map((tone) => (
                <div
                  key={tone.key}
                  className="flex items-center gap-3 rounded-md border border-border p-3"
                >
                  <span
                    className={`h-9 w-9 shrink-0 rounded-md ${swatchClasses[tone.key] ?? 'bg-primary'}`}
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-content">{tone.label}</p>
                    <p className="truncate text-xs text-content-subtle">{tone.key}</p>
                  </div>
                </div>
              ))}
            </div>
          </Row>

          <Row label={t('tokens.typography')}>
            <div className="flex w-full flex-wrap items-baseline gap-x-8 gap-y-2">
              {[
                'text-xs',
                'text-sm',
                'text-base',
                'text-lg',
                'text-xl',
                'text-2xl',
                'text-3xl',
                'text-4xl',
              ].map((size) => (
                <div key={size} className="flex flex-col gap-1">
                  <span className={`${size} leading-none text-content`}>{t('tokens.alpha')}</span>
                  <span className="text-xs text-content-subtle">{size}</span>
                </div>
              ))}
            </div>
          </Row>

          <Row label={t('tokens.spacing')}>
            {[4, 8, 16, 24, 32, 48].map((size) => (
              <div key={size} className="flex flex-col items-center gap-1.5">
                <span
                  className="block h-6 rounded-sm bg-primary-subtle"
                  style={{ width: size * 4 }}
                />
                <span className="text-xs text-content-subtle">{size * 4}px</span>
              </div>
            ))}
          </Row>

          <Row label={t('tokens.radius')}>
            {[
              'rounded-sm',
              'rounded-md',
              'rounded-lg',
              'rounded-xl',
              'rounded-2xl',
              'rounded-full',
            ].map((radius) => (
              <div key={radius} className="flex flex-col items-center gap-1.5">
                <span className={`h-10 w-10 ${radius} border border-border bg-surface-sunken`} />
                <span className="text-xs text-content-subtle">{radius}</span>
              </div>
            ))}
          </Row>

          <Row label={t('tokens.shadows')}>
            {['shadow-xs', 'shadow-sm', 'shadow-md', 'shadow-lg', 'shadow-xl', 'shadow-2xl'].map(
              (shadow) => (
                <div key={shadow} className="flex flex-col items-center gap-1.5">
                  <span className={`h-10 w-16 rounded-md bg-surface-raised ${shadow}`} />
                  <span className="text-xs text-content-subtle">{shadow}</span>
                </div>
              ),
            )}
          </Row>

          <Row label={t('tokens.zIndex')}>
            <div className="flex w-full flex-wrap gap-2">
              {['dropdown', 'sticky', 'drawer', 'modal', 'tooltip', 'toast', 'skip'].map((name) => (
                <span
                  key={name}
                  className="rounded-full border border-border bg-surface-sunken px-3 py-1 text-xs text-content-muted"
                >
                  {name}
                </span>
              ))}
            </div>
          </Row>
        </Section>

        <Section title={t('buttons.title')} description={t('buttons.description')}>
          <Row label={t('buttons.variants')}>
            <Button>{t('buttons.primary')}</Button>
            <Button variant="secondary">{t('buttons.secondary')}</Button>
            <Button variant="outline">{t('buttons.outline')}</Button>
            <Button variant="ghost">{t('buttons.ghost')}</Button>
            <Button variant="danger">{t('buttons.danger')}</Button>
          </Row>

          <Row label={t('buttons.sizes')}>
            <Button size="xs">{t('buttons.primary')}</Button>
            <Button size="sm">{t('buttons.primary')}</Button>
            <Button size="md">{t('buttons.primary')}</Button>
            <Button size="lg">{t('buttons.primary')}</Button>
          </Row>

          <Row label={t('buttons.states')}>
            <Button loading>{t('buttons.loading')}</Button>
            <Button disabled>{t('buttons.disabled')}</Button>
            <Button startIcon={<Save className="h-4 w-4" aria-hidden="true" />}>
              {t('buttons.withIcon')}
            </Button>
            <Button variant="outline" size="icon" aria-label={t('buttons.iconOnly')}>
              <Settings className="h-4 w-4" aria-hidden="true" />
            </Button>
          </Row>
        </Section>

        <Section title={t('inputs.title')} description={t('inputs.description')}>
          <Row label={t('inputs.inputLabel')}>
            <div className="w-full max-w-sm">
              <Input placeholder={t('inputs.inputPlaceholder')} />
            </div>
          </Row>

          <Row label={t('inputs.inputWithAdornment')}>
            <div className="w-full max-w-sm">
              <Input
                defaultValue="12,400"
                startAdornment={<CircleDollarSign className="h-4 w-4" aria-hidden="true" />}
              />
            </div>
          </Row>

          <Row label={t('inputs.selectLabel')}>
            <div className="w-full max-w-sm">
              <Select defaultValue="1">
                {[1, 2, 3].map((option) => (
                  <option key={option} value={String(option)}>
                    {t('inputs.selectOption', { n: option })}
                  </option>
                ))}
              </Select>
            </div>
          </Row>

          <Row label={t('inputs.errorLabel')}>
            <div className="w-full max-w-sm">
              <Input state="error" defaultValue={t('inputs.errorMessage')} aria-invalid />
              <p className="mt-1 text-sm text-danger">{t('inputs.errorMessage')}</p>
            </div>
          </Row>

          <Row label={t('inputs.successLabel')}>
            <div className="w-full max-w-sm">
              <Input state="success" defaultValue={t('inputs.successMessage')} />
            </div>
          </Row>

          <Row label={t('inputs.disabledLabel')}>
            <div className="w-full max-w-sm">
              <Input disabled placeholder={t('inputs.inputPlaceholder')} />
            </div>
          </Row>

          <Row label={t('inputs.searchPlaceholder')}>
            <div className="w-full max-w-sm">
              <SearchInput placeholder={t('inputs.searchPlaceholder')} />
            </div>
          </Row>
        </Section>

        <Section title={t('selection.title')} description={t('selection.description')}>
          <Row>
            <Checkbox
              checked={check1}
              onChange={(event) => setCheck1(event.target.checked)}
              label={t('selection.checked')}
            />
            <Checkbox
              checked={check2}
              onChange={(event) => setCheck2(event.target.checked)}
              label={t('selection.unchecked')}
            />
            <Checkbox
              checked={check3}
              indeterminate
              onChange={(event) => setCheck3(event.target.checked)}
              label={t('selection.indeterminate')}
            />
            <Checkbox disabled checked label={t('selection.disabled')} />
          </Row>

          <Row>
            <Switch
              checked={notificationsOn}
              onCheckedChange={setNotificationsOn}
              label={t('selection.switchOn')}
            />
            <Switch
              checked={false}
              onCheckedChange={() => undefined}
              label={t('selection.switchOff')}
            />
            <Switch
              checked
              size="sm"
              onCheckedChange={() => undefined}
              label={t('selection.smallSwitch')}
            />
            <Switch
              checked
              disabled
              onCheckedChange={() => undefined}
              label={t('selection.disabled')}
            />
          </Row>
        </Section>

        <Section title={t('feedback.title')} description={t('feedback.description')}>
          <Row>
            <div className="w-full space-y-3">
              <Alert tone="info" title={t('feedback.alertInfo')}>
                {t('feedback.alertInfoBody')}
              </Alert>
              <Alert tone="success" title={t('feedback.alertSuccess')} onClose={() => undefined}>
                {t('feedback.alertSuccessBody')}
              </Alert>
              <Alert tone="warning" title={t('feedback.alertWarning')}>
                {t('feedback.alertWarningBody')}
              </Alert>
              <Alert tone="danger" title={t('feedback.alertDanger')}>
                {t('feedback.alertDangerBody')}
              </Alert>
            </div>
          </Row>

          <Row label={t('feedback.showToast')}>
            <Button
              size="sm"
              variant="secondary"
              onClick={() =>
                toast.info({
                  title: t('feedback.toastInfo'),
                  description: t('feedback.toastInfoBody'),
                })
              }
            >
              {t('tokens.toneInfo')}
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() =>
                toast.success({
                  title: t('feedback.toastSuccess'),
                  description: t('feedback.toastSuccessBody'),
                })
              }
            >
              {t('tokens.toneSuccess')}
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() =>
                toast.warning({
                  title: t('feedback.toastWarning'),
                  description: t('feedback.toastWarningBody'),
                })
              }
            >
              {t('tokens.toneWarning')}
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() =>
                toast.error({
                  title: t('feedback.toastDanger'),
                  description: t('feedback.toastDangerBody'),
                })
              }
            >
              {t('tokens.toneDanger')}
            </Button>
          </Row>

          <Row label={t('feedback.skeletonLabel')}>
            <div className="flex w-full flex-wrap gap-6">
              <SkeletonText lines={3} className="w-48" />
              <SkeletonButton />
              <SkeletonCircle className="h-12 w-12" />
              <SkeletonCard className="w-64">
                <Skeleton className="h-4 w-1/2" />
              </SkeletonCard>
            </div>
          </Row>
        </Section>

        <Section title={t('overlays.title')} description={t('overlays.description')}>
          <Row>
            <Button variant="secondary" onClick={() => setDialogOpen(true)}>
              {t('overlays.openDialog')}
            </Button>
            <Button variant="secondary" onClick={() => setDrawerOpen(true)}>
              {t('overlays.openDrawer')}
            </Button>

            <Dropdown
              trigger={
                <Button
                  variant="secondary"
                  endIcon={<ChevronDown className="h-4 w-4" aria-hidden="true" />}
                >
                  {t('overlays.dropdownLabel')}
                </Button>
              }
            >
              <DropdownItem icon={<Pencil className="h-4 w-4" aria-hidden="true" />}>
                {t('overlays.dropdownEdit')}
              </DropdownItem>
              <DropdownItem icon={<Copy className="h-4 w-4" aria-hidden="true" />}>
                {t('overlays.dropdownDuplicate')}
              </DropdownItem>
              <DropdownSeparator />
              <DropdownItem danger icon={<Trash2 className="h-4 w-4" aria-hidden="true" />}>
                {t('overlays.dropdownDelete')}
              </DropdownItem>
            </Dropdown>
          </Row>

          <Row>
            <Tooltip label={t('overlays.tooltipTop')} side="top">
              <Button variant="outline" size="sm">
                {t('overlays.tooltipTop')}
              </Button>
            </Tooltip>
            <Tooltip label={t('overlays.tooltipBottom')} side="bottom">
              <Button variant="outline" size="sm">
                {t('overlays.tooltipBottom')}
              </Button>
            </Tooltip>
            <Tooltip label={t('overlays.tooltipEnd')} side="end">
              <Button variant="outline" size="sm">
                {t('overlays.tooltipEnd')}
              </Button>
            </Tooltip>
          </Row>
        </Section>

        <Section title={t('tabs.title')} description={t('tabs.description')}>
          <Row>
            <div className="w-full">
              <Tabs defaultValue="overview">
                <TabsList>
                  <TabsTrigger value="overview">{t('tabs.overview')}</TabsTrigger>
                  <TabsTrigger value="details">{t('tabs.details')}</TabsTrigger>
                  <TabsTrigger value="history" disabled>
                    {t('tabs.disabled')}
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="rounded-md border border-border p-4">
                  {t('tabs.overviewBody')}
                </TabsContent>
                <TabsContent value="details" className="rounded-md border border-border p-4">
                  {t('tabs.detailsBody')}
                </TabsContent>
                <TabsContent value="history" className="rounded-md border border-border p-4">
                  {t('tabs.historyBody')}
                </TabsContent>
              </Tabs>
            </div>
          </Row>

          <Row>
            <div className="w-full">
              <Tabs defaultValue="overview" variant="pill">
                <TabsList>
                  <TabsTrigger value="overview">{t('tabs.overview')}</TabsTrigger>
                  <TabsTrigger value="details">{t('tabs.details')}</TabsTrigger>
                </TabsList>
                <TabsContent value="overview">{t('tabs.overviewBody')}</TabsContent>
                <TabsContent value="details">{t('tabs.detailsBody')}</TabsContent>
              </Tabs>
            </div>
          </Row>
        </Section>

        <Section title={t('badges.title')} description={t('badges.description')}>
          <Row label={t('badges.soft')}>
            <Badge variant="neutral">{t('tokens.toneNeutral')}</Badge>
            <Badge variant="primary">{t('tokens.tonePrimary')}</Badge>
            <Badge variant="success">{t('tokens.toneSuccess')}</Badge>
            <Badge variant="warning">{t('tokens.toneWarning')}</Badge>
            <Badge variant="danger">{t('tokens.toneDanger')}</Badge>
            <Badge variant="info">{t('tokens.toneInfo')}</Badge>
          </Row>

          <Row label={t('badges.solid')}>
            <Badge variant="primary" fill="solid">
              {t('tokens.tonePrimary')}
            </Badge>
            <Badge variant="success" fill="solid">
              {t('tokens.toneSuccess')}
            </Badge>
            <Badge variant="warning" fill="solid">
              {t('tokens.toneWarning')}
            </Badge>
            <Badge variant="danger" fill="solid">
              {t('tokens.toneDanger')}
            </Badge>
          </Row>

          <Row label={t('badges.outline')}>
            <Badge variant="primary" fill="outline">
              {t('tokens.tonePrimary')}
            </Badge>
            <Badge variant="success" fill="outline">
              {t('tokens.toneSuccess')}
            </Badge>
            <Badge variant="info" fill="outline">
              {t('tokens.toneInfo')}
            </Badge>
          </Row>

          <Row label={t('badges.withDot')}>
            <StatusBadge tone="success" label={t('table.statusActive')} />
            <StatusBadge tone="warning" label={t('table.statusPending')} />
            <StatusBadge tone="danger" label={t('table.statusBlocked')} />
            <StatusBadge tone="primary" label={t('tokens.tonePrimary')} dot={false} />
          </Row>
        </Section>

        <Section title={t('cards.title')} description={t('cards.description')}>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>{t('cards.cardTitle')}</CardTitle>
                  <CardDescription>{t('cards.cardDescription')}</CardDescription>
                </div>
              </CardHeader>
              <CardContent>{t('cards.cardBody')}</CardContent>
              <CardFooter>
                <Button variant="ghost" size="sm">
                  {t('cards.cardAction')}
                </Button>
              </CardFooter>
            </Card>

            <Card interactive>
              <CardContent>{t('cards.cardBody')}</CardContent>
            </Card>

            <Card padding="lg">
              <CardContent className="px-0 py-0">{t('cards.cardBody')}</CardContent>
            </Card>
          </div>
        </Section>

        <Section title={t('table.title')} description={t('table.description')}>
          <Row label={t('table.sortableTitle')}>
            <div className="w-full">
              <DataTable
                columns={columns}
                data={sampleRows}
                rowKey={(row) => row.id}
                selectable
                selectedKeys={selected}
                onSelectionChange={setSelected}
                caption={t('table.users')}
              />
            </div>
          </Row>

          <Row label={t('feedback.skeletonLabel')}>
            <div className="w-full">
              <DataTable
                columns={columns}
                data={[]}
                rowKey={(row) => row.id}
                loading
                loadingRows={4}
              />
            </div>
          </Row>

          <Row label={t('empty.title')}>
            <div className="w-full">
              <DataTable
                columns={columns}
                data={[]}
                rowKey={(row) => row.id}
                empty={
                  <EmptyState
                    icon={<SearchX className="h-6 w-6" aria-hidden="true" />}
                    title={t('table.emptyTitle')}
                    description={t('table.emptyDescription')}
                    action={<Button size="sm">{t('layout.headerAction')}</Button>}
                  />
                }
              />
            </div>
          </Row>
        </Section>

        <Section title={t('stats.title')} description={t('stats.description')}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label={t('stats.totalRevenue')}
              value={formatCurrency(1284000)}
              icon={<Wallet className="h-5 w-5" aria-hidden="true" />}
              tone="primary"
              trend={12.5}
              trendLabel={t('stats.vsLastMonth')}
            />
            <StatCard
              label={t('stats.openInvoices')}
              value={formatNumber(487)}
              icon={<Receipt className="h-5 w-5" aria-hidden="true" />}
              tone="warning"
              trend={-4.2}
              trendLabel={t('stats.vsLastMonth')}
            />
            <StatCard
              label={t('stats.activeUsers')}
              value={formatNumber(1284)}
              icon={<Users className="h-5 w-5" aria-hidden="true" />}
              tone="success"
              trend={3.1}
              trendLabel={t('stats.vsLastMonth')}
            />
            <StatCard
              label={t('stats.pendingApprovals')}
              value={formatNumber(23)}
              icon={<Clock className="h-5 w-5" aria-hidden="true" />}
              tone="info"
              loading
            />
          </div>
        </Section>

        <Section title={t('timeline.title')} description={t('timeline.description')}>
          <div className="grid gap-8 md:grid-cols-2">
            <Timeline>
              <TimelineItem
                title={t('timeline.created')}
                description={t('timeline.createdDesc')}
                time={t('timeline.time1d')}
                icon={<FileText className="h-4 w-4" aria-hidden="true" />}
              />
              <TimelineItem
                title={t('timeline.submitted')}
                description={t('timeline.submittedDesc')}
                time={t('timeline.time3h')}
                icon={<Send className="h-4 w-4" aria-hidden="true" />}
                tone="info"
              />
              <TimelineItem
                title={t('timeline.approved')}
                description={t('timeline.approvedDesc')}
                time={t('timeline.time1h')}
                icon={<Check className="h-4 w-4" aria-hidden="true" />}
                tone="success"
              />
              <TimelineItem
                title={t('timeline.rejected')}
                description={t('timeline.rejectedDesc')}
                time={t('timeline.timelineNow')}
                icon={<X className="h-4 w-4" aria-hidden="true" />}
                tone="danger"
                isLast
              />
            </Timeline>

            <ActivityFeed>
              <ActivityItem
                title={t('timeline.activityPosted')}
                timestamp={t('timeline.time5m')}
                icon={<FileCheck className="h-4 w-4" aria-hidden="true" />}
                tone="success"
              />
              <ActivityItem
                title={t('timeline.activityDelivered')}
                timestamp={t('timeline.time1h')}
                icon={<Truck className="h-4 w-4" aria-hidden="true" />}
                tone="primary"
              />
              <ActivityItem
                title={t('timeline.activityEmployee')}
                timestamp={t('timeline.time3h')}
                icon={<UserPlus className="h-4 w-4" aria-hidden="true" />}
                tone="info"
              />
              <ActivityItem
                title={t('timeline.activityLocked')}
                timestamp={t('timeline.time1d')}
                icon={<Lock className="h-4 w-4" aria-hidden="true" />}
              />
            </ActivityFeed>
          </div>
        </Section>

        <Section title={t('pagination.title')} description={t('pagination.description')}>
          <Pagination
            page={pPage}
            pageSize={pSize}
            totalItems={87}
            onPageChange={setPPage}
            pageSizeOptions={[10, 20, 50]}
            onPageSizeChange={(size) => {
              setPSize(size)
              setPPage(1)
            }}
          />
        </Section>

        <Section title={t('empty.title')} description={t('empty.description')}>
          <EmptyState
            icon={<SearchX className="h-6 w-6" aria-hidden="true" />}
            title={t('table.emptyTitle')}
            description={t('table.emptyDescription')}
            action={<Button size="sm">{t('layout.headerAction')}</Button>}
          />
        </Section>

        <Section title={t('forms.title')} description={t('forms.description')}>
          <div className="grid gap-6 lg:grid-cols-2">
            <FormField
              label={t('forms.fieldLabel')}
              hint={t('forms.fieldHint')}
              error={formErrors.name}
            >
              <Input
                value={nameValue}
                onChange={(event) => setNameValue(event.target.value)}
                placeholder={t('inputs.inputPlaceholder')}
              />
            </FormField>

            <FormField label={t('forms.emailLabel')} required error={formErrors.email}>
              <Input
                type="email"
                value={emailValue}
                onChange={(event) => setEmailValue(event.target.value)}
                placeholder={t('forms.emailPlaceholder')}
              />
            </FormField>

            <FormField label={t('forms.fieldRequiredLabel')} required error={formErrors.reference}>
              <Input
                value={referenceValue}
                onChange={(event) => setReferenceValue(event.target.value)}
                placeholder={t('inputs.inputPlaceholder')}
              />
            </FormField>

            <FormField label={t('forms.dateLabel')}>
              <DatePicker value={date} onChange={setDate} />
            </FormField>

            <FormField label={t('forms.uploadLabel')}>
              <FileUpload
                multiple
                maxFiles={3}
                maxSizeBytes={5 * 1024 * 1024}
                value={files}
                onChange={setFiles}
                description={t('forms.uploadDescription')}
              />
            </FormField>
          </div>

          <FormActions
            submitLabel={t('forms.submit')}
            onSubmit={handleFormSubmit}
            onCancel={handleFormReset}
          />
        </Section>

        <Section title={t('layout.title')} description={t('layout.description')}>
          <PageHeader
            icon={<Boxes className="h-5 w-5" aria-hidden="true" />}
            title={t('layout.headerTitle')}
            description={t('layout.headerDescription')}
            breadcrumbs={
              <Breadcrumbs
                items={[
                  { label: t('layout.breadcrumbsHome'), to: '/' },
                  { label: t('layout.breadcrumbsUsers') },
                  { label: t('layout.breadcrumbsProfile') },
                ]}
              />
            }
            actions={
              <Button size="sm" startIcon={<Plus className="h-4 w-4" aria-hidden="true" />}>
                {t('layout.headerAction')}
              </Button>
            }
          />

          <Card>
            <CardContent>{t('layout.layoutDemoBody')}</CardContent>
          </Card>
        </Section>
      </div>

      <Dialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={t('overlays.dialogTitle')}
        description={t('overlays.dialogDescription')}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDialogOpen(false)}>
              {tUi('actions.cancel')}
            </Button>
            <Button onClick={() => setDialogOpen(false)}>{tUi('actions.submit')}</Button>
          </>
        }
      >
        <p className="text-sm text-content-muted">{t('overlays.dialogBody')}</p>
      </Dialog>

      <Drawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        title={t('overlays.drawerTitle')}
        description={t('overlays.drawerDescription')}
        footer={
          <Button variant="secondary" onClick={() => setDrawerOpen(false)}>
            {tUi('actions.cancel')}
          </Button>
        }
      >
        <p className="text-sm text-content-muted">{t('overlays.drawerBody')}</p>
      </Drawer>
    </PageLayout>
  )
}
