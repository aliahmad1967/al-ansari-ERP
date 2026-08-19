/**
 * WorkflowTimeline — visual timeline of workflow approval history.
 *
 * Displays the sequence of steps and actions taken in a workflow instance.
 * Reusable across any module that uses the workflow engine.
 */

import { useTranslation } from 'react-i18next'

import { WorkflowStatusBadge } from './WorkflowStatusBadge'

interface WorkflowTimelineStep {
  orderNumber: number
  name: string
  nameAr: string | null
  status: 'completed' | 'current' | 'pending'
  actorName?: string
  action?: string
  comment?: string
  date?: Date
}

interface WorkflowTimelineProps {
  steps: WorkflowTimelineStep[]
  currentStepOrder?: number
  className?: string
}

const ACTION_ICON_MAP: Record<string, string> = {
  approve: '\u2713',
  reject: '\u2717',
  submit: '\u2192',
  cancel: '\u2716',
  return: '\u21A9',
}

const STEP_STATUS_COLOR: Record<string, string> = {
  completed: 'bg-success/10 border-success text-success',
  current: 'bg-warning/10 border-warning text-warning',
  pending: 'bg-neutral/10 border-neutral text-neutral',
}

export function WorkflowTimeline({ steps, className }: WorkflowTimelineProps) {
  const { t, i18n } = useTranslation('workflow')
  const isRtl = i18n.language === 'ar'

  return (
    <div className={className}>
      <h3 className="text-lg font-semibold mb-4">{t('history.title')}</h3>
      <div className="relative">
        {steps.map((step, index) => {
          const stepName = isRtl && step.nameAr ? step.nameAr : step.name
          const isLast = index === steps.length - 1

          return (
            <div
              key={step.orderNumber}
              className={`flex gap-4 ${!isLast ? 'pb-6' : ''}`}
            >
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold ${STEP_STATUS_COLOR[step.status]}`}
                >
                  {step.status === 'completed'
                    ? (ACTION_ICON_MAP[step.action ?? ''] ?? '\u2713')
                    : step.orderNumber}
                </div>
                {!isLast && (
                  <div
                    className={`w-0.5 flex-1 mt-1 ${
                      step.status === 'completed' ? 'bg-success' : 'bg-neutral/30'
                    }`}
                  />
                )}
              </div>
              <div className="flex-1 pt-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{stepName}</span>
                  {step.status === 'current' && (
                    <WorkflowStatusBadge status="pending" />
                  )}
                </div>
                {step.actorName && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {step.actorName}
                  </p>
                )}
                {step.comment && (
                  <p className="text-sm text-muted-foreground mt-1 italic">
                    &ldquo;{step.comment}&rdquo;
                  </p>
                )}
                {step.date && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {step.date.toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
