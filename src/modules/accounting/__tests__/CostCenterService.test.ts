import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CostCenterService } from '@/modules/accounting/services/CostCenterService'

vi.mock('@/core/repositories/CostCenterRepository', () => ({
  CostCenterRepository: vi.fn().mockImplementation(function () {
    return {
      findAll: vi.fn().mockReturnValue([]),
      findById: vi.fn().mockReturnValue(null),
      findByCode: vi.fn().mockReturnValue(null),
      findActive: vi.fn().mockReturnValue([]),
      findByParent: vi.fn().mockReturnValue([]),
      search: vi.fn().mockReturnValue([]),
      create: vi.fn().mockImplementation(function (input: Record<string, unknown>) {
        return {
          _id: 'cc-001',
          code: input.code,
          name: input.name,
          nameAr: input.nameAr ?? null,
          description: input.description ?? null,
          descriptionAr: input.descriptionAr ?? null,
          parentCostCenterId: input.parentCostCenterId ?? null,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          isDeleted: false,
          deletedAt: null,
        }
      }),
      update: vi.fn().mockImplementation(function (id: string, changes: Record<string, unknown>) {
        return { _id: id, code: 'CC-001', name: changes.name ?? 'Test CC', isActive: true, createdAt: new Date(), updatedAt: new Date(), isDeleted: false, deletedAt: null }
      }),
      softDelete: vi.fn().mockReturnValue(true),
      restore: vi.fn().mockReturnValue(true),
    }
  }),
}))

vi.mock('@/core/repositories/AuditRepository', () => ({
  AuditRepository: vi.fn().mockImplementation(function () {
    return { create: vi.fn() }
  }),
}))

describe('CostCenterService', () => {
  let service: CostCenterService

  beforeEach(() => {
    vi.clearAllMocks()
    service = new CostCenterService()
  })

  describe('create', () => {
    it('creates a cost center', () => {
      const result = service.create(
        { code: 'CC-001', name: 'Marketing', isActive: true },
        'user-1',
        'admin',
      )
      expect(result._id).toBe('cc-001')
      expect(result.code).toBe('CC-001')
      expect(result.name).toBe('Marketing')
    })

    it('throws on duplicate code', () => {
      const repo = service['repo']
      repo.findByCode = vi.fn().mockReturnValue({ _id: 'existing' })
      expect(() =>
        service.create({ code: 'CC-001', name: 'Marketing', isActive: true }),
      ).toThrow('already exists')
    })
  })

  describe('update', () => {
    it('updates a cost center', () => {
      const result = service.update('cc-001', { name: 'Updated CC' })
      expect(result.name).toBe('Updated CC')
    })
  })

  describe('archive', () => {
    it('archives a cost center', () => {
      const repo = service['repo']
      repo.findById = vi.fn().mockReturnValue({ _id: 'cc-001', code: 'CC-001', name: 'Marketing' })
      expect(service.archive('cc-001')).toBe(true)
    })

    it('throws when cost center has children', () => {
      const repo = service['repo']
      repo.findById = vi.fn().mockReturnValue({ _id: 'cc-001' })
      repo.findByParent = vi.fn().mockReturnValue([{ _id: 'child-1' }])
      expect(() => service.archive('cc-001')).toThrow('child cost centers')
    })
  })

  describe('restore', () => {
    it('restores an archived cost center', () => {
      expect(service.restore('cc-001')).toBe(true)
    })
  })
})
