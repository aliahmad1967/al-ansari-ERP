import { AuditAction, AuditOutcome } from '@/core/models/AuditLog'
import type { InventoryCount, InventoryCountInput, InventoryCountStatusValue } from '@/core/models/InventoryCount'
import { InventoryCountRepository } from '@/core/repositories/InventoryCountRepository'
import { AuditRepository } from '@/core/repositories/AuditRepository'
import type { FindOptions } from '@/core/repositories/BaseRepository'

export class InventoryCountService {
  private readonly countRepo = new InventoryCountRepository()
  private readonly auditRepo = new AuditRepository()

  findAllCounts(options: FindOptions = {}): InventoryCount[] {
    return this.countRepo.findAll(options)
  }

  findCountById(id: string): InventoryCount | null {
    return this.countRepo.findById(id)
  }

  findCountsByStatus(status: InventoryCountStatusValue): InventoryCount[] {
    return this.countRepo.findByStatus(status)
  }

  findCountsByWarehouse(warehouseId: string): InventoryCount[] {
    return this.countRepo.findByWarehouse(warehouseId)
  }

  findLatestByWarehouse(warehouseId: string): InventoryCount | null {
    return this.countRepo.findLatestByWarehouse(warehouseId)
  }

  createCount(input: InventoryCountInput, actorUserId?: string, actorUsername?: string): InventoryCount {
    const count = this.countRepo.create(input)
    this.auditRepo.create({
      action: AuditAction.Create,
      module: 'inventory',
      resourceType: 'InventoryCount',
      resourceId: count._id,
      summary: `Inventory count "${count.code}" created`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })
    return count
  }

  updateCount(id: string, changes: Partial<InventoryCountInput>, actorUserId?: string, actorUsername?: string): InventoryCount {
    const count = this.countRepo.update(id, changes)
    this.auditRepo.create({
      action: AuditAction.Update,
      module: 'inventory',
      resourceType: 'InventoryCount',
      resourceId: count._id,
      summary: `Inventory count "${count.code}" updated`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })
    return count
  }

  updateCountStatus(id: string, status: InventoryCountStatusValue, actorUserId?: string, actorUsername?: string): InventoryCount {
    const count = this.countRepo.update(id, { status })
    this.auditRepo.create({
      action: AuditAction.Update,
      module: 'inventory',
      resourceType: 'InventoryCount',
      resourceId: count._id,
      summary: `Inventory count "${count.code}" status changed to ${status}`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })
    return count
  }

  archiveCount(id: string, actorUserId?: string, actorUsername?: string): boolean {
    const count = this.countRepo.findById(id)
    const result = this.countRepo.softDelete(id)
    if (result) {
      this.auditRepo.create({
        action: AuditAction.Delete,
        module: 'inventory',
        resourceType: 'InventoryCount',
        resourceId: id,
        summary: `Inventory count "${count?.code ?? id}" archived`,
        outcome: AuditOutcome.Success,
        actorUserId,
        actorUsername,
      })
    }
    return result
  }
}
