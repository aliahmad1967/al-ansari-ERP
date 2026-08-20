import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../models/AuditLog', () => ({
  AuditAction: { Create: 'create', Update: 'update', Delete: 'delete', Approve: 'approve', Reject: 'reject', Cancel: 'cancel', Post: 'post' },
  AuditOutcome: { Success: 'success', Failure: 'failure' },
}))

vi.mock('../models/Notification', () => ({
  NotificationType: { Info: 'info', Success: 'success', Warning: 'warning', Error: 'error', Approval: 'approval' },
}))

vi.mock('../models/WorkflowAction', () => ({
  WorkflowAction: {},
  WorkflowActionType: { Submit: 'submit', Approve: 'approve', Reject: 'reject', Cancel: 'cancel' },
}))

vi.mock('../models/WorkflowDefinition', () => ({
  WorkflowDefinition: {},
}))

vi.mock('../models/WorkflowInstance', () => ({
  WorkflowInstance: {},
  WorkflowInstanceStatus: { Pending: 'pending', Approved: 'approved', Rejected: 'rejected', Cancelled: 'cancelled', Completed: 'completed' },
}))

vi.mock('../models/WorkflowStep', () => ({
  WorkflowStep: {},
  WorkflowStepApproverType: { User: 'user', Role: 'role', DepartmentManager: 'department_manager' },
}))

vi.mock('../repositories/AuditRepository', () => ({
  AuditRepository: vi.fn().mockImplementation(function () {
    return { create: vi.fn() }
  }),
}))

vi.mock('../repositories/NotificationRepository', () => ({
  NotificationRepository: vi.fn().mockImplementation(function () {
    return { create: vi.fn() }
  }),
}))

vi.mock('../repositories/WorkflowActionRepository', () => ({
  WorkflowActionRepository: vi.fn().mockImplementation(function () {
    return {
      findByInstance: vi.fn().mockReturnValue([]),
      create: vi.fn().mockImplementation(function (input: Record<string, unknown>) {
        return { _id: 'wa-001', ...input }
      }),
    }
  }),
}))

vi.mock('../repositories/WorkflowDefinitionRepository', () => ({
  WorkflowDefinitionRepository: vi.fn().mockImplementation(function () {
    return {
      findAll: vi.fn().mockReturnValue([]),
      findById: vi.fn().mockImplementation(function (id: string) {
        if (id === 'wf-001') return { _id: 'wf-001', name: 'Leave Approval', nameAr: 'موافقة الإجازة', entityType: 'LeaveRequest', isActive: true, createdAt: new Date(), updatedAt: new Date(), isDeleted: false, deletedAt: null }
        return null
      }),
      findActive: vi.fn().mockReturnValue([{ _id: 'wf-001', name: 'Leave Approval', nameAr: 'موافقة الإجازة', entityType: 'LeaveRequest', isActive: true }]),
      findByEntityType: vi.fn().mockImplementation(function (type: string) {
        if (type === 'LeaveRequest') return [{ _id: 'wf-001', name: 'Leave Approval', nameAr: 'موافقة الإجازة', entityType: 'LeaveRequest', isActive: true }]
        return []
      }),
      create: vi.fn().mockImplementation(function (input: Record<string, unknown>) {
        return { _id: 'wf-001', ...input }
      }),
      update: vi.fn().mockImplementation(function (id: string, changes: Record<string, unknown>) {
        return { _id: id, ...changes }
      }),
      softDelete: vi.fn().mockReturnValue(true),
    }
  }),
}))

vi.mock('../repositories/WorkflowInstanceRepository', () => ({
  WorkflowInstanceRepository: vi.fn().mockImplementation(function () {
    return {
      findById: vi.fn().mockImplementation(function (id: string) {
        if (id === 'wi-001') return { _id: 'wi-001', definitionId: 'wf-001', entityType: 'LeaveRequest', entityId: 'lr-001', currentStepOrder: 1, status: 'pending', initiatedByUserId: 'emp-001', initiatedAt: new Date(), completedAt: null, createdAt: new Date(), updatedAt: new Date() }
        return null
      }),
      findPendingForEntity: vi.fn().mockReturnValue(null),
      findByEntity: vi.fn().mockReturnValue(null),
      findByStatus: vi.fn().mockReturnValue([{ _id: 'wi-001', definitionId: 'wf-001', entityType: 'LeaveRequest', entityId: 'lr-001', currentStepOrder: 1, status: 'pending', initiatedByUserId: 'emp-001', initiatedAt: new Date(), completedAt: null, createdAt: new Date(), updatedAt: new Date() }]),
      findByInitiator: vi.fn().mockReturnValue([]),
      create: vi.fn().mockImplementation(function (input: Record<string, unknown>) {
        return { _id: 'wi-001', ...input, initiatedAt: new Date(), completedAt: null, createdAt: new Date(), updatedAt: new Date() }
      }),
      update: vi.fn().mockImplementation(function (id: string, changes: Record<string, unknown>) {
        return { _id: id, definitionId: 'wf-001', entityType: 'LeaveRequest', entityId: 'lr-001', currentStepOrder: 1, status: changes.status ?? 'pending', initiatedByUserId: 'emp-001', initiatedAt: new Date(), completedAt: changes.completedAt ?? null, createdAt: new Date(), updatedAt: new Date() }
      }),
    }
  }),
}))

vi.mock('../repositories/WorkflowStepRepository', () => ({
  WorkflowStepRepository: vi.fn().mockImplementation(function () {
    return {
      findByDefinition: vi.fn().mockImplementation(function (defId: string) {
        if (defId === 'wf-001') return [
          { _id: 'ws-001', definitionId: 'wf-001', name: 'Manager Approval', nameAr: 'موافقة المدير', orderNumber: 1, approverType: 'user', approverUserId: 'mgr-001' },
          { _id: 'ws-002', definitionId: 'wf-001', name: 'HR Approval', nameAr: 'موافقة الموارد البشرية', orderNumber: 2, approverType: 'role', approverUserId: null },
        ]
        return []
      }),
      findByDefinitionAndOrder: vi.fn().mockImplementation(function (_defId: string, order: number) {
        if (order === 1) return { _id: 'ws-001', definitionId: 'wf-001', name: 'Manager Approval', nameAr: 'موافقة المدير', orderNumber: 1, approverType: 'user', approverUserId: 'mgr-001' }
        if (order === 2) return { _id: 'ws-002', definitionId: 'wf-001', name: 'HR Approval', nameAr: 'موافقة الموارد البشرية', orderNumber: 2, approverType: 'role', approverUserId: null }
        return null
      }),
      findFirstStep: vi.fn().mockImplementation(function (defId: string) {
        if (defId === 'wf-001') return { _id: 'ws-001', definitionId: 'wf-001', name: 'Manager Approval', nameAr: 'موافقة المدير', orderNumber: 1, approverType: 'user', approverUserId: 'mgr-001' }
        return null
      }),
      findNextStep: vi.fn().mockImplementation(function (_defId: string, currentOrder: number) {
        if (currentOrder === 1) return { _id: 'ws-002', definitionId: 'wf-001', name: 'HR Approval', nameAr: 'موافقة الموارد البشرية', orderNumber: 2, approverType: 'role', approverUserId: null }
        return null
      }),
      create: vi.fn().mockImplementation(function (input: Record<string, unknown>) {
        return { _id: 'ws-001', ...input }
      }),
      update: vi.fn().mockImplementation(function (id: string, changes: Record<string, unknown>) {
        return { _id: id, ...changes }
      }),
      delete: vi.fn().mockReturnValue(true),
    }
  }),
}))

vi.mock('@/types/workflow', () => ({}))

import { WorkflowService } from '@/modules/workflow/services/WorkflowService'

describe('WorkflowService', () => {
  let service: WorkflowService

  beforeEach(() => {
    vi.clearAllMocks()
    service = new WorkflowService()
  })

  describe('createDefinition', () => {
    it('creates a workflow definition', () => {
      const result = service.createDefinition({ name: 'Leave Approval', entityType: 'LeaveRequest' } as never)
      expect(result.name).toBe('Leave Approval')
    })
  })

  describe('getDefinitionWithSteps', () => {
    it('returns definition with steps', () => {
      const result = service.getDefinitionWithSteps('wf-001')
      expect(result).toBeDefined()
      expect(result?.name).toBe('Leave Approval')
    })

    it('returns null for nonexistent', () => {
      expect(service.getDefinitionWithSteps('nonexistent')).toBeNull()
    })
  })

  describe('deleteDefinition', () => {
    it('deletes a definition', () => {
      expect(service.deleteDefinition('wf-001')).toBe(true)
    })
  })

  describe('initiateWorkflow', () => {
    it('initiates a workflow successfully', () => {
      const result = service.initiateWorkflow({
        entityType: 'LeaveRequest',
        entityId: 'lr-001',
        initiatedByUserId: 'emp-001',
        initiatedByUsername: 'employee',
      })
      expect(result.success).toBe(true)
      expect(result.instance).toBeDefined()
    })

    it('fails when no active definition exists', () => {
      const result = service.initiateWorkflow({
        entityType: 'UnknownEntity',
        entityId: 'x-001',
        initiatedByUserId: 'emp-001',
        initiatedByUsername: 'employee',
      })
      expect(result.success).toBe(false)
      expect(result.error).toContain('No active workflow definition')
    })

    it('fails when workflow already in progress', () => {
      const svc = service as unknown as { instanceRepo: { findPendingForEntity: ReturnType<typeof vi.fn> } }
      svc.instanceRepo.findPendingForEntity.mockReturnValue({ _id: 'wi-existing' })
      const result = service.initiateWorkflow({
        entityType: 'LeaveRequest',
        entityId: 'lr-001',
        initiatedByUserId: 'emp-001',
        initiatedByUsername: 'employee',
      })
      expect(result.success).toBe(false)
      expect(result.error).toContain('already in progress')
    })
  })

  describe('processAction - approve', () => {
    it('processes approval and advances to next step', () => {
      const result = service.processAction({
        instanceId: 'wi-001',
        action: 'approve',
        actorUserId: 'mgr-001',
        actorUsername: 'manager',
      })
      expect(result.success).toBe(true)
    })
  })

  describe('processAction - reject', () => {
    it('processes rejection', () => {
      const result = service.processAction({
        instanceId: 'wi-001',
        action: 'reject',
        actorUserId: 'mgr-001',
        actorUsername: 'manager',
        comment: 'Not approved',
      })
      expect(result.success).toBe(true)
    })
  })

  describe('processAction - cancel', () => {
    it('processes cancellation', () => {
      const result = service.processAction({
        instanceId: 'wi-001',
        action: 'cancel',
        actorUserId: 'mgr-001',
        actorUsername: 'manager',
      })
      expect(result.success).toBe(true)
    })
  })

  describe('processAction - validation', () => {
    it('fails for nonexistent instance', () => {
      const result = service.processAction({
        instanceId: 'nonexistent',
        action: 'approve',
        actorUserId: 'mgr-001',
        actorUsername: 'manager',
      })
      expect(result.success).toBe(false)
      expect(result.error).toContain('not found')
    })

    it('fails when instance is not pending', () => {
      const svc = service as unknown as { instanceRepo: { findById: ReturnType<typeof vi.fn> } }
      svc.instanceRepo.findById.mockReturnValue({ _id: 'wi-001', definitionId: 'wf-001', entityType: 'LeaveRequest', entityId: 'lr-001', currentStepOrder: 1, status: 'completed' })
      const result = service.processAction({
        instanceId: 'wi-001',
        action: 'approve',
        actorUserId: 'mgr-001',
        actorUsername: 'manager',
      })
      expect(result.success).toBe(false)
      expect(result.error).toContain('not in pending status')
    })
  })

  describe('getStats', () => {
    it('returns workflow statistics', () => {
      const stats = service.getStats()
      expect(stats).toHaveProperty('totalDefinitions')
      expect(stats).toHaveProperty('activeDefinitions')
      expect(stats).toHaveProperty('pendingInstances')
      expect(stats).toHaveProperty('completedInstances')
      expect(stats).toHaveProperty('rejectedInstances')
    })
  })

  describe('getInstance', () => {
    it('returns instance by id', () => {
      expect(service.getInstance('wi-001')).toBeDefined()
    })

    it('returns null for nonexistent', () => {
      expect(service.getInstance('nonexistent')).toBeNull()
    })
  })

  describe('getInstanceWithDetails', () => {
    it('returns instance with full details', () => {
      const result = service.getInstanceWithDetails('wi-001')
      expect(result).toBeDefined()
      expect(result?.definition).toBeDefined()
    })

    it('returns null for nonexistent', () => {
      expect(service.getInstanceWithDetails('nonexistent')).toBeNull()
    })
  })
})
