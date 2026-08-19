/**
 * Workflow types — shared TypeScript interfaces for the workflow engine.
 */

import type {
  WorkflowDefinitionEntity,
  WorkflowStepEntity,
  WorkflowInstanceEntity,
  WorkflowActionEntity,
} from '@/core/models'

// ── Definition with steps ─────────────────────────────────────────────

export interface WorkflowDefinitionWithSteps extends WorkflowDefinitionEntity {
  steps: WorkflowStepEntity[]
}

// ── Instance with context ─────────────────────────────────────────────

export interface WorkflowInstanceWithDetails extends WorkflowInstanceEntity {
  definition: WorkflowDefinitionEntity
  currentStep: WorkflowStepEntity | null
  actions: WorkflowActionEntity[]
  steps: WorkflowStepEntity[]
}

// ── Initiation request ────────────────────────────────────────────────

export interface WorkflowInitiationRequest {
  entityType: string
  entityId: string
  initiatedByUserId: string
  initiatedByUsername?: string
}

// ── Action request ────────────────────────────────────────────────────

export interface WorkflowActionRequest {
  instanceId: string
  action: 'approve' | 'reject' | 'cancel' | 'submit'
  actorUserId: string
  actorUsername?: string
  comment?: string
}

// ── Result types ──────────────────────────────────────────────────────

export interface WorkflowActionResult {
  success: boolean
  instance?: WorkflowInstanceEntity
  error?: string
}

export interface WorkflowInitiationResult {
  success: boolean
  instance?: WorkflowInstanceEntity
  error?: string
}

// ── Dashboard / summary ───────────────────────────────────────────────

export interface WorkflowPendingApproval {
  instanceId: string
  entityType: string
  entityId: string
  definitionName: string
  definitionNameAr: string | null
  currentStepName: string
  currentStepNameAr: string | null
  initiatedByUserId: string
  initiatedAt: Date
  createdAt: Date
}

export interface WorkflowStats {
  totalDefinitions: number
  activeDefinitions: number
  pendingInstances: number
  completedInstances: number
  rejectedInstances: number
}

// ── Status display mapping ────────────────────────────────────────────

export const WORKFLOW_STATUS_DISPLAY: Record<
  string,
  { labelKey: string; tone: 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info' }
> = {
  draft: { labelKey: 'workflow.status.draft', tone: 'neutral' },
  pending: { labelKey: 'workflow.status.pending', tone: 'warning' },
  approved: { labelKey: 'workflow.status.approved', tone: 'success' },
  rejected: { labelKey: 'workflow.status.rejected', tone: 'danger' },
  cancelled: { labelKey: 'workflow.status.cancelled', tone: 'neutral' },
  completed: { labelKey: 'workflow.status.completed', tone: 'success' },
  archived: { labelKey: 'workflow.status.archived', tone: 'info' },
}

export const WORKFLOW_ACTION_DISPLAY: Record<
  string,
  { labelKey: string; tone: 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info' }
> = {
  submit: { labelKey: 'workflow.action.submit', tone: 'primary' },
  approve: { labelKey: 'workflow.action.approve', tone: 'success' },
  reject: { labelKey: 'workflow.action.reject', tone: 'danger' },
  cancel: { labelKey: 'workflow.action.cancel', tone: 'neutral' },
  return: { labelKey: 'workflow.action.return', tone: 'warning' },
}
