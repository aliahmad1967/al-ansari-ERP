import { AuditAction, AuditOutcome } from '@/core/models/AuditLog'
import type { Supplier, SupplierInput } from '@/core/models/Supplier'
import { SupplierRepository } from '@/core/repositories/SupplierRepository'
import { AuditRepository } from '@/core/repositories/AuditRepository'
import type { FindOptions } from '@/core/repositories/BaseRepository'

export class SupplierService {
  private readonly supplierRepo = new SupplierRepository()
  private readonly auditRepo = new AuditRepository()

  findAllSuppliers(options: FindOptions = {}): Supplier[] {
    return this.supplierRepo.findAll(options)
  }

  findSupplierById(id: string): Supplier | null {
    return this.supplierRepo.findById(id)
  }

  findActiveSuppliers(): Supplier[] {
    return this.supplierRepo.findActive()
  }

  searchSuppliers(query: string): Supplier[] {
    return this.supplierRepo.search(query)
  }

  createSupplier(input: SupplierInput, actorUserId?: string, actorUsername?: string): Supplier {
    const supplier = this.supplierRepo.create(input)
    this.auditRepo.create({
      action: AuditAction.Create,
      module: 'procurement',
      resourceType: 'Supplier',
      resourceId: supplier._id,
      summary: `Supplier "${supplier.name}" created`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })
    return supplier
  }

  updateSupplier(id: string, changes: Partial<SupplierInput>, actorUserId?: string, actorUsername?: string): Supplier {
    const supplier = this.supplierRepo.update(id, changes)
    this.auditRepo.create({
      action: AuditAction.Update,
      module: 'procurement',
      resourceType: 'Supplier',
      resourceId: supplier._id,
      summary: `Supplier "${supplier.name}" updated`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })
    return supplier
  }

  archiveSupplier(id: string, actorUserId?: string, actorUsername?: string): boolean {
    const supplier = this.supplierRepo.findById(id)
    const result = this.supplierRepo.softDelete(id)
    if (result) {
      this.auditRepo.create({
        action: AuditAction.Delete,
        module: 'procurement',
        resourceType: 'Supplier',
        resourceId: id,
        summary: `Supplier "${supplier?.name ?? id}" archived`,
        outcome: AuditOutcome.Success,
        actorUserId,
        actorUsername,
      })
    }
    return result
  }

  restoreSupplier(id: string, actorUserId?: string, actorUsername?: string): boolean {
    const result = this.supplierRepo.restore(id)
    if (result) {
      this.auditRepo.create({
        action: AuditAction.Update,
        module: 'procurement',
        resourceType: 'Supplier',
        resourceId: id,
        summary: 'Supplier restored',
        outcome: AuditOutcome.Success,
        actorUserId,
        actorUsername,
      })
    }
    return result
  }
}
