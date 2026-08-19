/**
 * useWorkflowInstances — React hook for workflow instance operations.
 *
 * Provides actions for initiating workflows, processing approvals/rejections,
 * and querying pending approvals for the current user.
 */

import { useCallback, useEffect, useState } from 'react'

import type {
  WorkflowPendingApproval,
  WorkflowActionRequest,
  WorkflowInitiationRequest,
} from '@/types/workflow'

type InstanceData = Record<string, unknown>

interface WorkflowInstanceProvider {
  initiate(request: WorkflowInitiationRequest): { success: boolean; instance?: InstanceData; error?: string }
  processAction(request: WorkflowActionRequest): { success: boolean; instance?: InstanceData; error?: string }
  getInstance(id: string): InstanceData | undefined
  getInstanceWithDetails(id: string): InstanceData | undefined
  findPendingForUser(userId: string): WorkflowPendingApproval[]
  findByInitiator(userId: string): InstanceData[]
}

let providerPromise: Promise<WorkflowInstanceProvider> | null = null

function getProvider(): Promise<WorkflowInstanceProvider> {
  if (providerPromise) return providerPromise
  providerPromise = (async () => {
    try {
      const mod = await import('@/modules/workflow/services/WorkflowService')
      const svc = new mod.WorkflowService()
      return {
        initiate: (request) => {
          const result = svc.initiateWorkflow(request)
          return { ...result, instance: result.instance ? serializeObj(result.instance) : undefined }
        },
        processAction: (request) => {
          const result = svc.processAction(request)
          return { ...result, instance: result.instance ? serializeObj(result.instance) : undefined }
        },
        getInstance: (id) => {
          const inst = svc.getInstance(id)
          return inst ? serializeObj(inst) : undefined
        },
        getInstanceWithDetails: (id) => {
          const details = svc.getInstanceWithDetails(id)
          return details ? serializeObj(details) : undefined
        },
        findPendingForUser: (userId) => svc.findPendingForUser(userId),
        findByInitiator: (userId) => svc.findByInitiator(userId).map(serializeObj),
      }
    } catch {
      return getLocalStorageProvider()
    }
  })()
  return providerPromise
}

function serializeObj(obj: unknown): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  const input = obj as Record<string, unknown>
  for (const [key, value] of Object.entries(input)) {
    if (value instanceof Date) {
      result[key] = value.toISOString()
    } else if (Array.isArray(value)) {
      result[key] = value.map((item) =>
        typeof item === 'object' && item !== null ? serializeObj(item) : item,
      )
    } else if (typeof value === 'object' && value !== null && key !== 'schema') {
      result[key] = serializeObj(value)
    } else if (key !== 'schema') {
      result[key] = value
    }
  }
  return result
}

function getLocalStorageProvider(): WorkflowInstanceProvider {
  const KEY = 'erp_dev_workflow_instances'
  const load = (): InstanceData[] => {
    try { return JSON.parse(localStorage.getItem(KEY) ?? '[]') } catch { return [] }
  }
  const save = (data: InstanceData[]) => localStorage.setItem(KEY, JSON.stringify(data))
  const genId = () => Math.random().toString(36).substring(2, 15)
  const now = () => new Date().toISOString()

  return {
    initiate: (request) => {
      const instances = load()
      const existing = instances.find(
        (i) => i.entityType === request.entityType && i.entityId === request.entityId && i.status === 'pending',
      )
      if (existing) {
        return { success: false, error: 'A workflow is already in progress for this entity.' }
      }
      const instance: InstanceData = {
        _id: genId(),
        definitionId: 'local-def',
        entityType: request.entityType,
        entityId: request.entityId,
        currentStepOrder: 1,
        status: 'pending',
        initiatedByUserId: request.initiatedByUserId,
        initiatedAt: now(),
        completedAt: null,
        createdAt: now(),
        updatedAt: now(),
        isDeleted: false,
        deletedAt: null,
      }
      instances.push(instance); save(instances)
      return { success: true, instance }
    },
    processAction: (request) => {
      const instances = load()
      const idx = instances.findIndex((i) => i._id === request.instanceId)
      if (idx === -1) return { success: false, error: 'Instance not found.' }
      const inst = instances[idx]
      if (inst.status !== 'pending') return { success: false, error: 'Instance is not pending.' }
      if (request.action === 'approve') {
        inst.status = 'approved'; inst.completedAt = now()
      } else if (request.action === 'reject') {
        inst.status = 'rejected'; inst.completedAt = now()
      } else if (request.action === 'cancel') {
        inst.status = 'cancelled'; inst.completedAt = now()
      }
      inst.updatedAt = now()
      save(instances)
      return { success: true, instance: inst }
    },
    getInstance: (id) => load().find((i) => i._id === id),
    getInstanceWithDetails: (id) => load().find((i) => i._id === id),
    findPendingForUser: () => {
      return load()
        .filter((i) => i.status === 'pending')
        .map((i) => ({
          instanceId: i._id as string,
          entityType: i.entityType as string,
          entityId: i.entityId as string,
          definitionName: 'Local Workflow',
          definitionNameAr: null,
          currentStepName: 'Approval',
          currentStepNameAr: null,
          initiatedByUserId: i.initiatedByUserId as string,
          initiatedAt: new Date(i.initiatedAt as string),
          createdAt: new Date(i.createdAt as string),
        }))
    },
    findByInitiator: (userId) => load().filter((i) => i.initiatedByUserId === userId),
  }
}

export interface UseWorkflowInstancesResult {
  pendingApprovals: WorkflowPendingApproval[]
  myInstances: InstanceData[]
  loading: boolean
  error: string | null
  refresh: () => void
  initiateWorkflow: (request: WorkflowInitiationRequest) => Promise<{ success: boolean; error?: string }>
  processAction: (request: WorkflowActionRequest) => Promise<{ success: boolean; error?: string }>
  getInstance: (id: string) => InstanceData | undefined
}

export function useWorkflowInstances(userId?: string): UseWorkflowInstancesResult {
  const [pendingApprovals, setPendingApprovals] = useState<WorkflowPendingApproval[]>([])
  const [myInstances, setMyInstances] = useState<InstanceData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let active = true
    getProvider()
      .then((p) => {
        if (active) {
          if (userId) {
            setPendingApprovals(p.findPendingForUser(userId))
            setMyInstances(p.findByInitiator(userId))
          }
          setError(null)
        }
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : 'Unknown error')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [refreshKey, userId])

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), [])

  const initiateWorkflow = useCallback(async (request: WorkflowInitiationRequest) => {
    const p = await getProvider()
    const result = p.initiate(request)
    if (result.success) refresh()
    return { success: result.success, error: result.error }
  }, [refresh])

  const processAction = useCallback(async (request: WorkflowActionRequest) => {
    const p = await getProvider()
    const result = p.processAction(request)
    if (result.success) refresh()
    return { success: result.success, error: result.error }
  }, [refresh])

  const getInstance = useCallback((id: string) => {
    let result: InstanceData | undefined
    getProvider().then((p) => { result = p.getInstance(id) })
    return result
  }, [])

  return {
    pendingApprovals,
    myInstances,
    loading,
    error,
    refresh,
    initiateWorkflow,
    processAction,
    getInstance,
  }
}
