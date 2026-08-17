import { useCallback, useEffect, useState } from 'react'

interface DevEmployee {
  _id: string
  employeeNumber: string
  firstName: string
  lastName: string
  firstNameAr: string | null
  lastNameAr: string | null
  email: string
  phone: string | null
  dateOfBirth: string | null
  gender: string | null
  nationality: string | null
  nationalId: string | null
  maritalStatus: string | null
  address: string | null
  city: string | null
  country: string | null
  photoUrl: string | null
  organizationId: string | null
  branchId: string | null
  departmentId: string | null
  positionId: string | null
  managerId: string | null
  employmentDate: string
  terminationDate: string | null
  status: string
  notes: string | null
  isDeleted: boolean
  deletedAt: string | null
  createdAt: string
  updatedAt: string
}

type EmployeeInput = Record<string, unknown>

interface EmployeeProvider {
  getEmployees(): DevEmployee[]
  getEmployee(id: string): DevEmployee | undefined
  createEmployee(input: EmployeeInput): DevEmployee
  updateEmployee(id: string, changes: EmployeeInput): DevEmployee | undefined
  archiveEmployee(id: string): boolean
  restoreEmployee(id: string): boolean
  getEmployeeCount(): number
  getActiveEmployeeCount(): number
}

let providerPromise: Promise<EmployeeProvider> | null = null

function getProvider(): Promise<EmployeeProvider> {
  if (providerPromise) return providerPromise
  providerPromise = (async () => {
    try {
      const mod = await import('@/modules/hr/services/EmployeeService')
      const svc = new mod.EmployeeService()
      return {
        getEmployees: () => svc.findAll().map(r => r as unknown as DevEmployee),
        getEmployee: (id) => svc.findById(id) as unknown as DevEmployee | null ?? undefined,
        createEmployee: (input) => svc.create(input as never) as unknown as DevEmployee,
        updateEmployee: (id, changes) => svc.update(id, changes as never) as unknown as DevEmployee,
        archiveEmployee: (id) => svc.archive(id),
        restoreEmployee: (id) => svc.restore(id),
        getEmployeeCount: () => svc.count(),
        getActiveEmployeeCount: () => svc.count(),
      }
    } catch {
      const { devEmployeeService } = await import('@/core/services/DevEmployeeService')
      return {
        getEmployees: () => devEmployeeService.getEmployees(),
        getEmployee: (id) => devEmployeeService.getEmployee(id),
        createEmployee: (input) => devEmployeeService.createEmployee(input),
        updateEmployee: (id, changes) => devEmployeeService.updateEmployee(id, changes),
        archiveEmployee: (id) => devEmployeeService.archiveEmployee(id),
        restoreEmployee: (id) => devEmployeeService.restoreEmployee(id),
        getEmployeeCount: () => devEmployeeService.getEmployeeCount(),
        getActiveEmployeeCount: () => devEmployeeService.getActiveEmployeeCount(),
      }
    }
  })()
  return providerPromise
}

export interface UseEmployeesResult {
  items: DevEmployee[]
  loading: boolean
  error: string | null
  refresh: () => void
  create: (input: EmployeeInput) => void
  update: (id: string, changes: EmployeeInput) => void
  archive: (id: string) => void
  restore: (id: string) => void
  totalCount: number
  activeCount: number
}

export function useEmployees(): UseEmployeesResult {
  const [items, setItems] = useState<DevEmployee[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)
  const [activeCount, setActiveCount] = useState(0)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let active = true
    getProvider()
      .then((p) => {
        if (active) {
          setItems(p.getEmployees())
          setTotalCount(p.getEmployeeCount())
          setActiveCount(p.getActiveEmployeeCount())
          setError(null)
        }
      })
      .catch((err) => { if (active) setError(err instanceof Error ? err.message : 'Unknown error') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [refreshKey])

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), [])

  const create = useCallback((input: EmployeeInput) => {
    getProvider().then((svc) => { svc.createEmployee(input); refresh() })
  }, [refresh])

  const update = useCallback((id: string, changes: EmployeeInput) => {
    getProvider().then((svc) => { svc.updateEmployee(id, changes); refresh() })
  }, [refresh])

  const archive = useCallback((id: string) => {
    getProvider().then((svc) => { svc.archiveEmployee(id); refresh() })
  }, [refresh])

  const restore = useCallback((id: string) => {
    getProvider().then((svc) => { svc.restoreEmployee(id); refresh() })
  }, [refresh])

  return { items, loading, error, refresh, create, update, archive, restore, totalCount, activeCount }
}
