/**
 * WorkflowStatsCards — summary statistics for the workflow engine.
 *
 * Displays key metrics like total definitions, pending instances,
 * completed, and rejected counts.
 */

import { useTranslation } from 'react-i18next'

import { Card } from '@/components/ui/Card'
import type { WorkflowStats } from '@/types/workflow'

interface WorkflowStatsCardsProps {
  stats: WorkflowStats | null
  className?: string
}

export function WorkflowStatsCards({ stats, className }: WorkflowStatsCardsProps) {
  const { t } = useTranslation('workflow')

  if (!stats) return null

  const cards = [
    {
      label: t('stats.totalDefinitions'),
      value: stats.totalDefinitions,
      color: 'text-primary',
    },
    {
      label: t('stats.activeDefinitions'),
      value: stats.activeDefinitions,
      color: 'text-success',
    },
    {
      label: t('stats.pendingInstances'),
      value: stats.pendingInstances,
      color: 'text-warning',
    },
    {
      label: t('stats.completedInstances'),
      value: stats.completedInstances,
      color: 'text-success',
    },
    {
      label: t('stats.rejectedInstances'),
      value: stats.rejectedInstances,
      color: 'text-danger',
    },
  ]

  return (
    <div className={`grid grid-cols-2 md:grid-cols-5 gap-4 ${className ?? ''}`}>
      {cards.map((card) => (
        <Card key={card.label} className="p-4">
          <p className="text-sm text-muted-foreground">{card.label}</p>
          <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
        </Card>
      ))}
    </div>
  )
}
