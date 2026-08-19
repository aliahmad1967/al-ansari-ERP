/**
 * useWorkflowDefinitions — React hook for workflow definition management.
 *
 * Provides CRUD operations for workflow definitions and their steps.
 * Delegates all business logic to WorkflowService.
 */

import { useCallback, useEffect, useState } from 'react'

import type {
  WorkflowStats,
} from '@/types/workflow'

interface WorkflowDefinitionData {
  _id: string
  name: string
  nameAr: string | null
  description: string | null
  descriptionAr: string | null
  entityType: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  isDeleted: boolean
  deletedAt: string | null
  steps: Array<{
    _id: string
    definitionId: string
    orderNumber: number
    name: string
    nameAr: string | null
    approverType: string
    approverRoleId: string | null
    approverUserId: string | null
    actionType: string
    createdAt: string
    updatedAt: string
  }>
}

type DefinitionInput = Record<string, unknown>

interface WorkflowDefinitionProvider {
  getAll(): WorkflowDefinitionData[]
  getById(id: string): WorkflowDefinitionData | undefined
  getWithSteps(id: string): WorkflowDefinitionData | undefined
  create(input: DefinitionInput): WorkflowDefinitionData
  update(id: string, changes: Record<string, unknown>): WorkflowDefinitionData | undefined
  delete(id: string): boolean
  addStep(definitionId: string, input: DefinitionInput): WorkflowDefinitionData['steps'][0]
  deleteStep(stepId: string): boolean
  getStats(): WorkflowStats
}

let providerPromise: Promise<WorkflowDefinitionProvider> | null = null

function getProvider(): Promise<WorkflowDefinitionProvider> {
  if (providerPromise) return providerPromise
  providerPromise = (async () => {
    try {
      const mod = await import('@/modules/workflow/services/WorkflowService')
      const svc = new mod.WorkflowService()
      return {
        getAll: () => svc.findAllDefinitions().map((d) => ({
          ...serializeObj(d),
          steps: svc.getStepsForDefinition(d._id).map(serializeObj),
        })) as WorkflowDefinitionData[],
        getById: (id) => {
          const d = svc.getDefinition(id)
          return d ? { ...serializeObj(d), steps: [] } as WorkflowDefinitionData : undefined
        },
        getWithSteps: (id) => {
          const data = svc.getDefinitionWithSteps(id)
          return data ? serializeObj(data) as WorkflowDefinitionData : undefined
        },
        create: (input) => {
          const d = svc.createDefinition(input as never)
          return { ...serializeObj(d), steps: [] } as WorkflowDefinitionData
        },
        update: (id, changes) => {
          const d = svc.updateDefinition(id, changes as never)
          return serializeObj(d) as WorkflowDefinitionData
        },
        delete: (id) => svc.deleteDefinition(id),
        addStep: (definitionId, input) => {
          const step = svc.addStep({ ...input, definitionId } as never)
          return serializeObj(step) as WorkflowDefinitionData['steps'][0]
        },
        deleteStep: (stepId) => svc.deleteStep(stepId),
        getStats: () => svc.getStats(),
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

function getLocalStorageProvider(): WorkflowDefinitionProvider {
  const KEY_DEF = 'erp_dev_workflow_definitions'
  const KEY_STEP = 'erp_dev_workflow_steps'
  const loadDefs = (): WorkflowDefinitionData[] => {
    try { return JSON.parse(localStorage.getItem(KEY_DEF) ?? '[]') } catch { return [] }
  }
  const loadSteps = (): WorkflowDefinitionData['steps'] => {
    try { return JSON.parse(localStorage.getItem(KEY_STEP) ?? '[]') } catch { return [] }
  }
  const saveDefs = (data: WorkflowDefinitionData[]) => localStorage.setItem(KEY_DEF, JSON.stringify(data))
  const saveSteps = (data: WorkflowDefinitionData['steps']) => localStorage.setItem(KEY_STEP, JSON.stringify(data))
  const genId = () => Math.random().toString(36).substring(2, 15)
  const now = () => new Date().toISOString()

  return {
    getAll: () => loadDefs().filter((d) => !d.isDeleted),
    getById: (id) => loadDefs().find((d) => d._id === id && !d.isDeleted),
    getWithSteps: (id) => {
      const def = loadDefs().find((d) => d._id === id && !d.isDeleted)
      if (!def) return undefined
      const steps = loadSteps().filter((s) => s.definitionId === id).sort((a, b) => a.orderNumber - b.orderNumber)
      return { ...def, steps }
    },
    create: (input) => {
      const defs = loadDefs()
      const def: WorkflowDefinitionData = {
        _id: genId(),
        name: (input.name as string) || '',
        nameAr: (input.nameAr as string) || null,
        description: (input.description as string) || null,
        descriptionAr: (input.descriptionAr as string) || null,
        entityType: (input.entityType as string) || '',
        isActive: (input.isActive as boolean) ?? true,
        createdAt: now(),
        updatedAt: now(),
        isDeleted: false,
        deletedAt: null,
        steps: [],
      }
      defs.push(def); saveDefs(defs); return def
    },
    update: (id, changes) => {
      const defs = loadDefs(); const idx = defs.findIndex((d) => d._id === id)
      if (idx === -1) return undefined
      defs[idx] = { ...defs[idx], ...changes, updatedAt: now() }
      saveDefs(defs); return defs[idx]
    },
    delete: (id) => {
      const defs = loadDefs(); const idx = defs.findIndex((d) => d._id === id)
      if (idx === -1) return false
      defs[idx].isDeleted = true; defs[idx].deletedAt = now()
      saveDefs(defs); return true
    },
    addStep: (definitionId, input) => {
      const steps = loadSteps()
      const step: WorkflowDefinitionData['steps'][0] = {
        _id: genId(),
        definitionId,
        orderNumber: (input.orderNumber as number) || steps.filter((s) => s.definitionId === definitionId).length + 1,
        name: (input.name as string) || '',
        nameAr: (input.nameAr as string) || null,
        approverType: (input.approverType as string) || 'role',
        approverRoleId: (input.approverRoleId as string) || null,
        approverUserId: (input.approverUserId as string) || null,
        actionType: (input.actionType as string) || 'approve',
        createdAt: now(),
        updatedAt: now(),
      }
      steps.push(step); saveSteps(steps); return step
    },
    deleteStep: (stepId) => {
      const steps = loadSteps(); const idx = steps.findIndex((s) => s._id === stepId)
      if (idx === -1) return false
      steps.splice(idx, 1); saveSteps(steps); return true
    },
    getStats: () => {
      const defs = loadDefs()
      const instances: WorkflowDefinitionData[] = []
      try { instances.push(...JSON.parse(localStorage.getItem('erp_dev_workflow_instances') ?? '[]')) } catch { /* noop */ }
      return {
        totalDefinitions: defs.filter((d) => !d.isDeleted).length,
        activeDefinitions: defs.filter((d) => !d.isDeleted && d.isActive).length,
        pendingInstances: instances.filter((i: WorkflowDefinitionData) => (i as unknown as { status: string }).status === 'pending').length,
        completedInstances: instances.filter((i: WorkflowDefinitionData) => (i as unknown as { status: string }).status === 'completed').length,
        rejectedInstances: instances.filter((i: WorkflowDefinitionData) => (i as unknown as { status: string }).status === 'rejected').length,
      }
    },
  }
}

export interface UseWorkflowDefinitionsResult {
  definitions: WorkflowDefinitionData[]
  loading: boolean
  error: string | null
  stats: WorkflowStats | null
  refresh: () => void
  createDefinition: (input: DefinitionInput) => void
  updateDefinition: (id: string, changes: Record<string, unknown>) => void
  deleteDefinition: (id: string) => void
  getDefinitionWithSteps: (id: string) => WorkflowDefinitionData | undefined
  addStep: (definitionId: string, input: DefinitionInput) => void
  deleteStep: (stepId: string) => void
}

export function useWorkflowDefinitions(): UseWorkflowDefinitionsResult {
  const [definitions, setDefinitions] = useState<WorkflowDefinitionData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<WorkflowStats | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let active = true
    getProvider()
      .then((p) => {
        if (active) {
          setDefinitions(p.getAll())
          setStats(p.getStats())
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
  }, [refreshKey])

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), [])

  const createDefinition = useCallback((input: DefinitionInput) => {
    getProvider().then((svc) => { svc.create(input); refresh() })
  }, [refresh])

  const updateDefinition = useCallback((id: string, changes: Record<string, unknown>) => {
    getProvider().then((svc) => { svc.update(id, changes); refresh() })
  }, [refresh])

  const deleteDefinition = useCallback((id: string) => {
    getProvider().then((svc) => { svc.delete(id); refresh() })
  }, [refresh])

  const getDefinitionWithSteps = useCallback((id: string) => {
    let result: WorkflowDefinitionData | undefined
    getProvider().then((svc) => { result = svc.getWithSteps(id) })
    return result
  }, [])

  const addStep = useCallback((definitionId: string, input: DefinitionInput) => {
    getProvider().then((svc) => { svc.addStep(definitionId, input); refresh() })
  }, [refresh])

  const deleteStep = useCallback((stepId: string) => {
    getProvider().then((svc) => { svc.deleteStep(stepId); refresh() })
  }, [refresh])

  return {
    definitions,
    loading,
    error,
    stats,
    refresh,
    createDefinition,
    updateDefinition,
    deleteDefinition,
    getDefinitionWithSteps,
    addStep,
    deleteStep,
  }
}
