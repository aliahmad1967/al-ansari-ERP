import { useCallback, useEffect, useState } from 'react'

interface DevContract {
  _id: string
  employeeId: string
  contractNumber: string
  type: string
  startDate: string
  endDate: string | null
  salary: number | null
  status: string
  notes: string | null
  isDeleted: boolean
  deletedAt: string | null
  createdAt: string
  updatedAt: string
}

type ContractInput = Record<string, unknown>

interface ContractProvider {
  getContracts(employeeId?: string): DevContract[]
  createContract(input: ContractInput): DevContract
  updateContract(id: string, changes: ContractInput): DevContract | undefined
  archiveContract(id: string): boolean
}

let providerPromise: Promise<ContractProvider> | null = null

function getProvider(): Promise<ContractProvider> {
  if (providerPromise) return providerPromise
  providerPromise = (async () => {
    try {
      const mod = await import('@/modules/hr/services/ContractService')
      const svc = new mod.ContractService()
      return {
        getContracts: (empId) => svc.findByEmployee(empId ?? '').map(r => r as unknown as DevContract),
        createContract: (input) => svc.create(input as never) as unknown as DevContract,
        updateContract: (id, changes) => svc.update(id, changes as never) as unknown as DevContract,
        archiveContract: (id) => svc.archive(id),
      }
    } catch {
      const { devEmployeeService } = await import('@/core/services/DevEmployeeService')
      return {
        getContracts: (empId) => devEmployeeService.getContracts(empId),
        createContract: (input) => devEmployeeService.createContract(input),
        updateContract: (id, changes) => devEmployeeService.updateContract(id, changes),
        archiveContract: (id) => devEmployeeService.archiveContract(id),
      }
    }
  })()
  return providerPromise
}

export interface UseContractsResult {
  items: DevContract[]
  loading: boolean
  error: string | null
  refresh: () => void
  create: (input: ContractInput) => void
  update: (id: string, changes: ContractInput) => void
  archive: (id: string) => void
}

export function useContracts(employeeId?: string): UseContractsResult {
  const [items, setItems] = useState<DevContract[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let active = true
    getProvider()
      .then((p) => {
        if (active) {
          setItems(p.getContracts(employeeId))
          setError(null)
        }
      })
      .catch((err) => { if (active) setError(err instanceof Error ? err.message : 'Unknown error') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [refreshKey, employeeId])

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), [])

  const create = useCallback((input: ContractInput) => {
    getProvider().then((svc) => { svc.createContract(input); refresh() })
  }, [refresh])

  const update = useCallback((id: string, changes: ContractInput) => {
    getProvider().then((svc) => { svc.updateContract(id, changes); refresh() })
  }, [refresh])

  const archive = useCallback((id: string) => {
    getProvider().then((svc) => { svc.archiveContract(id); refresh() })
  }, [refresh])

  return { items, loading, error, refresh, create, update, archive }
}
