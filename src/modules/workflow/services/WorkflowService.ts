/**
 * WorkflowService — business-layer facade for the reusable workflow engine.
 *
 * Responsibilities:
 *  - CRUD for workflow definitions and steps
 *  - Initiating workflow instances for entities
 *  - Processing approval/rejection/cancellation actions
 *  - Advancing through multi-level approval chains
 *  - Sending notifications at each workflow transition
 *  - Recording every action in the audit trail
 *
 * Architecture note: This service orchestrates repositories and emits
 * notifications + audit events. It never touches the UI layer.
 */

import { AuditAction, AuditOutcome } from '../models/AuditLog'
import { NotificationType } from '../models/Notification'
import {
  WorkflowAction,
  WorkflowActionType,
  type WorkflowActionInput,
} from '../models/WorkflowAction'
import {
  WorkflowDefinition,
  type WorkflowDefinitionInput,
  type WorkflowDefinitionUpdate,
} from '../models/WorkflowDefinition'
import {
  WorkflowInstance,
  WorkflowInstanceStatus,
} from '../models/WorkflowInstance'
import {
  WorkflowStep,
  WorkflowStepApproverType,
  type WorkflowStepInput,
  type WorkflowStepUpdate,
} from '../models/WorkflowStep'
import { AuditRepository } from '../repositories/AuditRepository'
import { NotificationRepository } from '../repositories/NotificationRepository'
import { WorkflowActionRepository } from '../repositories/WorkflowActionRepository'
import { WorkflowDefinitionRepository } from '../repositories/WorkflowDefinitionRepository'
import { WorkflowInstanceRepository } from '../repositories/WorkflowInstanceRepository'
import { WorkflowStepRepository } from '../repositories/WorkflowStepRepository'
import type {
  WorkflowActionResult,
  WorkflowActionRequest,
  WorkflowDefinitionWithSteps,
  WorkflowInitiationRequest,
  WorkflowInitiationResult,
  WorkflowInstanceWithDetails,
  WorkflowPendingApproval,
  WorkflowStats,
} from '@/types/workflow'

export class WorkflowService {
  private readonly definitionRepo = new WorkflowDefinitionRepository()
  private readonly stepRepo = new WorkflowStepRepository()
  private readonly instanceRepo = new WorkflowInstanceRepository()
  private readonly actionRepo = new WorkflowActionRepository()
  private readonly notificationRepo = new NotificationRepository()
  private readonly auditRepo = new AuditRepository()

  // ── Definition CRUD ───────────────────────────────────────────────

  createDefinition(input: WorkflowDefinitionInput): WorkflowDefinition {
    return this.definitionRepo.create(input)
  }

  updateDefinition(id: string, changes: WorkflowDefinitionUpdate): WorkflowDefinition {
    return this.definitionRepo.update(id, changes)
  }

  getDefinition(id: string): WorkflowDefinition | null {
    return this.definitionRepo.findById(id)
  }

  getDefinitionWithSteps(id: string): WorkflowDefinitionWithSteps | null {
    const definition = this.definitionRepo.findById(id)
    if (!definition) return null
    const steps = this.stepRepo.findByDefinition(id)
    return { ...definition, steps }
  }

  findAllDefinitions(
    options?: import('../repositories/BaseRepository').FindOptions,
  ): WorkflowDefinition[] {
    return this.definitionRepo.findAll(options)
  }

  findActiveDefinitions(): WorkflowDefinition[] {
    return this.definitionRepo.findActive()
  }

  findDefinitionsByEntityType(entityType: string): WorkflowDefinition[] {
    return this.definitionRepo.findByEntityType(entityType)
  }

  deleteDefinition(id: string): boolean {
    return this.definitionRepo.softDelete(id)
  }

  // ── Step CRUD ─────────────────────────────────────────────────────

  addStep(input: WorkflowStepInput): WorkflowStep {
    return this.stepRepo.create(input)
  }

  updateStep(id: string, changes: WorkflowStepUpdate): WorkflowStep {
    return this.stepRepo.update(id, changes)
  }

  getStepsForDefinition(definitionId: string): WorkflowStep[] {
    return this.stepRepo.findByDefinition(definitionId)
  }

  deleteStep(id: string): boolean {
    return this.stepRepo.delete(id)
  }

  // ── Instance lifecycle ────────────────────────────────────────────

  initiateWorkflow(request: WorkflowInitiationRequest): WorkflowInitiationResult {
    // Find an active definition for the entity type
    const definitions = this.definitionRepo.findByEntityType(request.entityType)
    const definition = definitions.find((d) => d.isActive)
    if (!definition) {
      return {
        success: false,
        error: `No active workflow definition found for entity type "${request.entityType}".`,
      }
    }

    // Check if there's already a pending workflow for this entity
    const existing = this.instanceRepo.findPendingForEntity(
      request.entityType,
      request.entityId,
    )
    if (existing) {
      return {
        success: false,
        error: 'A workflow is already in progress for this entity.',
      }
    }

    // Get the first step
    const firstStep = this.stepRepo.findFirstStep(definition._id)
    if (!firstStep) {
      return {
        success: false,
        error: 'Workflow definition has no steps configured.',
      }
    }

    // Create the instance
    const instance = this.instanceRepo.create({
      definitionId: definition._id,
      entityType: request.entityType,
      entityId: request.entityId,
      currentStepOrder: firstStep.orderNumber,
      status: WorkflowInstanceStatus.Pending,
      initiatedByUserId: request.initiatedByUserId,
    })

    // Record the submit action
    this.recordAction({
      instanceId: instance._id,
      stepId: firstStep._id,
      action: WorkflowActionType.Submit,
      actorUserId: request.initiatedByUserId,
      actorUsername: request.initiatedByUsername,
      comment: 'Workflow initiated',
    })

    // Send notification to the current approver(s)
    this.notifyCurrentApprover(instance, firstStep, definition)

    // Audit the initiation
    this.auditRepo.create({
      action: AuditAction.Update,
      module: 'workflow',
      resourceType: request.entityType,
      resourceId: request.entityId,
      summary: `Workflow initiated for ${request.entityType}`,
      outcome: AuditOutcome.Success,
      actorUserId: request.initiatedByUserId,
      actorUsername: request.initiatedByUsername,
    })

    return { success: true, instance }
  }

  processAction(request: WorkflowActionRequest): WorkflowActionResult {
    const instance = this.instanceRepo.findById(request.instanceId)
    if (!instance) {
      return { success: false, error: 'Workflow instance not found.' }
    }

    if (instance.status !== WorkflowInstanceStatus.Pending) {
      return { success: false, error: 'Workflow instance is not in pending status.' }
    }

    const definition = this.definitionRepo.findById(instance.definitionId)
    if (!definition) {
      return { success: false, error: 'Workflow definition not found.' }
    }

    const currentStep = this.stepRepo.findByDefinitionAndOrder(
      instance.definitionId,
      instance.currentStepOrder,
    )
    if (!currentStep) {
      return { success: false, error: 'Current workflow step not found.' }
    }

    // Validate the actor can perform this action
    const canAct = this.validateActorCanAct(currentStep, request.actorUserId)
    if (!canAct) {
      return { success: false, error: 'You are not authorized to act on this workflow step.' }
    }

    // Record the action
    this.recordAction({
      instanceId: instance._id,
      stepId: currentStep._id,
      action: request.action as WorkflowActionTypeValue,
      actorUserId: request.actorUserId,
      actorUsername: request.actorUsername,
      comment: request.comment,
    })

    // Process based on action type
    switch (request.action) {
      case 'approve':
        return this.processApproval(instance, definition, currentStep, request)
      case 'reject':
        return this.processRejection(instance, definition, currentStep, request)
      case 'cancel':
        return this.processCancellation(instance, definition, request)
      case 'submit':
        return this.processSubmission(instance, definition, currentStep)
      default:
        return { success: false, error: 'Unknown action type.' }
    }
  }

  // ── Query methods ─────────────────────────────────────────────────

  getInstance(id: string): WorkflowInstance | null {
    return this.instanceRepo.findById(id)
  }

  getInstanceWithDetails(id: string): WorkflowInstanceWithDetails | null {
    const instance = this.instanceRepo.findById(id)
    if (!instance) return null

    const definition = this.definitionRepo.findById(instance.definitionId)
    if (!definition) return null

    const currentStep = this.stepRepo.findByDefinitionAndOrder(
      instance.definitionId,
      instance.currentStepOrder,
    )
    const steps = this.stepRepo.findByDefinition(instance.definitionId)
    const actions = this.actionRepo.findByInstance(id)

    return {
      ...instance,
      definition,
      currentStep,
      steps,
      actions,
    }
  }

  findInstanceForEntity(entityType: string, entityId: string): WorkflowInstance | null {
    return this.instanceRepo.findByEntity(entityType, entityId)
  }

  findPendingForUser(userId: string): WorkflowPendingApproval[] {
    // Find all pending instances and filter by current step approver
    const pendingInstances = this.instanceRepo.findByStatus(WorkflowInstanceStatus.Pending)
    const results: WorkflowPendingApproval[] = []

    for (const instance of pendingInstances) {
      const currentStep = this.stepRepo.findByDefinitionAndOrder(
        instance.definitionId,
        instance.currentStepOrder,
      )
      if (!currentStep) continue

      if (this.isUserCurrentApprover(currentStep, userId)) {
        const definition = this.definitionRepo.findById(instance.definitionId)
        if (!definition) continue

        results.push({
          instanceId: instance._id,
          entityType: instance.entityType,
          entityId: instance.entityId,
          definitionName: definition.name,
          definitionNameAr: definition.nameAr,
          currentStepName: currentStep.name,
          currentStepNameAr: currentStep.nameAr,
          initiatedByUserId: instance.initiatedByUserId,
          initiatedAt: instance.initiatedAt,
          createdAt: instance.createdAt,
        })
      }
    }

    return results
  }

  findByInitiator(userId: string): WorkflowInstance[] {
    return this.instanceRepo.findByInitiator(userId)
  }

  getActionsForInstance(instanceId: string): WorkflowAction[] {
    return this.actionRepo.findByInstance(instanceId)
  }

  getStats(): WorkflowStats {
    const allDefinitions = this.definitionRepo.findAll({ includeDeleted: false })
    const activeDefinitions = allDefinitions.filter((d) => d.isActive)
    const pendingInstances = this.instanceRepo.findByStatus(WorkflowInstanceStatus.Pending)
    const completedInstances = this.instanceRepo.findByStatus(WorkflowInstanceStatus.Completed)
    const rejectedInstances = this.instanceRepo.findByStatus(WorkflowInstanceStatus.Rejected)

    return {
      totalDefinitions: allDefinitions.length,
      activeDefinitions: activeDefinitions.length,
      pendingInstances: pendingInstances.length,
      completedInstances: completedInstances.length,
      rejectedInstances: rejectedInstances.length,
    }
  }

  // ── Private helpers ───────────────────────────────────────────────

  private processApproval(
    instance: WorkflowInstance,
    definition: WorkflowDefinition,
    currentStep: WorkflowStep,
    request: WorkflowActionRequest,
  ): WorkflowActionResult {
    // Find the next step
    const nextStep = this.stepRepo.findNextStep(instance.definitionId, instance.currentStepOrder)

    if (nextStep) {
      // Advance to the next step
      this.instanceRepo.update(instance._id, {
        currentStepOrder: nextStep.orderNumber,
      })

      // Notify the next approver
      this.notifyCurrentApprover(instance, nextStep, definition)

      // Audit
      this.auditRepo.create({
        action: AuditAction.Approve,
        module: 'workflow',
        resourceType: instance.entityType,
        resourceId: instance.entityId,
        summary: `Workflow step "${currentStep.name}" approved, advancing to "${nextStep.name}"`,
        outcome: AuditOutcome.Success,
        actorUserId: request.actorUserId,
        actorUsername: request.actorUsername,
      })

      const updated = this.instanceRepo.findById(instance._id)
      return { success: true, instance: updated ?? undefined }
    }

    // No next step — workflow is fully approved
    this.instanceRepo.update(instance._id, {
      status: WorkflowInstanceStatus.Approved,
      completedAt: new Date(),
    })

    // Notify the initiator
    this.notifyInitiator(instance, 'approved', definition)

    // Audit
    this.auditRepo.create({
      action: AuditAction.Approve,
      module: 'workflow',
      resourceType: instance.entityType,
      resourceId: instance.entityId,
      summary: `Workflow fully approved for ${instance.entityType}`,
      outcome: AuditOutcome.Success,
      actorUserId: request.actorUserId,
      actorUsername: request.actorUsername,
    })

    const updated = this.instanceRepo.findById(instance._id)
    return { success: true, instance: updated ?? undefined }
  }

  private processRejection(
    instance: WorkflowInstance,
    definition: WorkflowDefinition,
    currentStep: WorkflowStep,
    request: WorkflowActionRequest,
  ): WorkflowActionResult {
    this.instanceRepo.update(instance._id, {
      status: WorkflowInstanceStatus.Rejected,
      completedAt: new Date(),
    })

    // Notify the initiator
    this.notifyInitiator(instance, 'rejected', definition)

    // Audit
    this.auditRepo.create({
      action: AuditAction.Reject,
      module: 'workflow',
      resourceType: instance.entityType,
      resourceId: instance.entityId,
      summary: `Workflow rejected at step "${currentStep.name}"`,
      outcome: AuditOutcome.Success,
      actorUserId: request.actorUserId,
      actorUsername: request.actorUsername,
    })

    const updated = this.instanceRepo.findById(instance._id)
    return { success: true, instance: updated ?? undefined }
  }

  private processCancellation(
    instance: WorkflowInstance,
    definition: WorkflowDefinition,
    request: WorkflowActionRequest,
  ): WorkflowActionResult {
    this.instanceRepo.update(instance._id, {
      status: WorkflowInstanceStatus.Cancelled,
      completedAt: new Date(),
    })

    // Audit
    this.auditRepo.create({
      action: AuditAction.Cancel,
      module: 'workflow',
      resourceType: instance.entityType,
      resourceId: instance.entityId,
      summary: 'Workflow cancelled by user',
      outcome: AuditOutcome.Success,
      actorUserId: request.actorUserId,
      actorUsername: request.actorUsername,
    })

    const updated = this.instanceRepo.findById(instance._id)
    return { success: true, instance: updated ?? undefined }
  }

  private processSubmission(
    instance: WorkflowInstance,
    _definition: WorkflowDefinition,
    currentStep: WorkflowStep,
  ): WorkflowActionResult {
    // Re-submit after rejection or initial submit — notify the current approver
    this.instanceRepo.update(instance._id, {
      status: WorkflowInstanceStatus.Pending,
    })

    this.notifyCurrentApprover(instance, currentStep, definition)

    const updated = this.instanceRepo.findById(instance._id)
    return { success: true, instance: updated ?? undefined }
  }

  private recordAction(input: WorkflowActionInput): WorkflowAction {
    return this.actionRepo.create(input)
  }

  private validateActorCanAct(step: WorkflowStep, actorUserId: string): boolean {
    switch (step.approverType) {
      case WorkflowStepApproverType.User:
        return step.approverUserId === actorUserId
      case WorkflowStepApproverType.Role:
      case WorkflowStepApproverType.DepartmentManager:
        // For role-based and department-manager, we check at the hook/UI level
        // with the permission system. The service trusts the caller has verified.
        return true
      default:
        return false
    }
  }

  private isUserCurrentApprover(step: WorkflowStep, userId: string): boolean {
    if (step.approverType === WorkflowStepApproverType.User) {
      return step.approverUserId === userId
    }
    // For role-based and department-manager, we need to check the user's role
    // This is a simplified check — the hook layer uses usePermissions for full checks
    return true
  }

  private notifyCurrentApprover(
    instance: WorkflowInstance,
    step: WorkflowStep,
    definition: WorkflowDefinition,
  ): void {
    const title = `Action Required: ${definition.name}`
    const titleAr = `مطلوب إجراء: ${definition.nameAr ?? definition.name}`
    const body = `A ${instance.entityType} requires your approval at step "${step.name}".`
    const bodyAr = `${instance.entityType} يتطلب موافقتك في الخطوة "${step.nameAr ?? step.name}".`

    if (step.approverType === WorkflowStepApproverType.User && step.approverUserId) {
      this.notificationRepo.create({
        userId: step.approverUserId,
        title,
        titleAr,
        body,
        bodyAr,
        type: NotificationType.Approval,
        entityType: instance.entityType,
        entityId: instance.entityId,
      })
    }
  }

  private notifyInitiator(
    instance: WorkflowInstance,
    outcome: 'approved' | 'rejected',
    definition: WorkflowDefinition,
  ): void {
    const isApproved = outcome === 'approved'
    const title = isApproved
      ? `Workflow Approved: ${definition.name}`
      : `Workflow Rejected: ${definition.name}`
    const titleAr = isApproved
      ? `تمت الموافقة على سير العمل: ${definition.nameAr ?? definition.name}`
      : `تم رفض سير العمل: ${definition.nameAr ?? definition.name}`
    const body = isApproved
      ? `Your ${instance.entityType} has been fully approved.`
      : `Your ${instance.entityType} has been rejected.`
    const bodyAr = isApproved
      ? `تمت الموافقة على ${instance.entityType} الخاص بك بالكامل.`
      : `تم رفض ${instance.entityType} الخاص بك.`

    this.notificationRepo.create({
      userId: instance.initiatedByUserId,
      title,
      titleAr,
      body,
      bodyAr,
      type: isApproved ? NotificationType.Success : NotificationType.Warning,
      entityType: instance.entityType,
      entityId: instance.entityId,
    })
  }
}

type WorkflowActionTypeValue = (typeof import('../models/WorkflowAction').WorkflowActionType)[keyof typeof import('../models/WorkflowAction').WorkflowActionType]
