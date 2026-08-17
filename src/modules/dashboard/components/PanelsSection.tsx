import { PendingApprovalsPanel } from './panels/PendingApprovalsPanel'
import { RecentTransactionsPanel } from './panels/RecentTransactionsPanel'
import { RecentActivityPanel } from './panels/RecentActivityPanel'
import { NotificationsPanel } from './panels/NotificationsPanel'
import { QuickActionsPanel } from './panels/QuickActionsPanel'
import type {
  ApprovalItem,
  TransactionItem,
  ActivityLogItem,
  NotificationItem,
  QuickAction,
} from '../types/dashboard.types'

interface PanelsSectionProps {
  pendingApprovals: ApprovalItem[]
  recentTransactions: TransactionItem[]
  recentActivity: ActivityLogItem[]
  notifications: NotificationItem[]
  quickActions: QuickAction[]
  loading?: boolean
}

export function PanelsSection({
  pendingApprovals,
  recentTransactions,
  recentActivity,
  notifications,
  quickActions,
  loading,
}: PanelsSectionProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      <PendingApprovalsPanel items={pendingApprovals} loading={loading} />
      <RecentTransactionsPanel items={recentTransactions} loading={loading} />
      <RecentActivityPanel items={recentActivity} loading={loading} />
      <NotificationsPanel items={notifications} loading={loading} />
      <QuickActionsPanel actions={quickActions} loading={loading} />
    </div>
  )
}

export default PanelsSection
