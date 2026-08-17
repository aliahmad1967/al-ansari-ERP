import { AuditAction, AuditOutcome } from '@/core/models/AuditLog'
import type { Warehouse, WarehouseInput } from '@/core/models/Warehouse'
import type { WarehouseLocation, WarehouseLocationInput } from '@/core/models/WarehouseLocation'
import { WarehouseRepository } from '@/core/repositories/WarehouseRepository'
import { WarehouseLocationRepository } from '@/core/repositories/WarehouseLocationRepository'
import { AuditRepository } from '@/core/repositories/AuditRepository'
import type { FindOptions } from '@/core/repositories/BaseRepository'

export class WarehouseService {
  private readonly warehouseRepo = new WarehouseRepository()
  private readonly locationRepo = new WarehouseLocationRepository()
  private readonly auditRepo = new AuditRepository()

  // ---- Warehouses ----

  findAllWarehouses(options: FindOptions = {}): Warehouse[] {
    return this.warehouseRepo.findAll(options)
  }

  findWarehouseById(id: string): Warehouse | null {
    return this.warehouseRepo.findById(id)
  }

  findActiveWarehouses(): Warehouse[] {
    return this.warehouseRepo.findActive()
  }

  createWarehouse(input: WarehouseInput, actorUserId?: string, actorUsername?: string): Warehouse {
    const warehouse = this.warehouseRepo.create(input)
    this.auditRepo.create({
      action: AuditAction.Create,
      module: 'inventory',
      resourceType: 'Warehouse',
      resourceId: warehouse._id,
      summary: `Warehouse "${warehouse.name}" created`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })
    return warehouse
  }

  updateWarehouse(id: string, changes: Partial<WarehouseInput>, actorUserId?: string, actorUsername?: string): Warehouse {
    const warehouse = this.warehouseRepo.update(id, changes)
    this.auditRepo.create({
      action: AuditAction.Update,
      module: 'inventory',
      resourceType: 'Warehouse',
      resourceId: warehouse._id,
      summary: `Warehouse "${warehouse.name}" updated`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })
    return warehouse
  }

  archiveWarehouse(id: string, actorUserId?: string, actorUsername?: string): boolean {
    const warehouse = this.warehouseRepo.findById(id)
    const result = this.warehouseRepo.softDelete(id)
    if (result) {
      this.auditRepo.create({
        action: AuditAction.Delete,
        module: 'inventory',
        resourceType: 'Warehouse',
        resourceId: id,
        summary: `Warehouse "${warehouse?.name ?? id}" archived`,
        outcome: AuditOutcome.Success,
        actorUserId,
        actorUsername,
      })
    }
    return result
  }

  restoreWarehouse(id: string, actorUserId?: string, actorUsername?: string): boolean {
    const result = this.warehouseRepo.restore(id)
    if (result) {
      this.auditRepo.create({
        action: AuditAction.Update,
        module: 'inventory',
        resourceType: 'Warehouse',
        resourceId: id,
        summary: 'Warehouse restored',
        outcome: AuditOutcome.Success,
        actorUserId,
        actorUsername,
      })
    }
    return result
  }

  // ---- Locations ----

  findAllLocations(warehouseId: string): WarehouseLocation[] {
    return this.locationRepo.findByWarehouse(warehouseId)
  }

  createLocation(input: WarehouseLocationInput, actorUserId?: string, actorUsername?: string): WarehouseLocation {
    const location = this.locationRepo.create(input)
    this.auditRepo.create({
      action: AuditAction.Create,
      module: 'inventory',
      resourceType: 'WarehouseLocation',
      resourceId: location._id,
      summary: `Warehouse location "${location.name}" created`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })
    return location
  }

  updateLocation(id: string, changes: Partial<WarehouseLocationInput>, actorUserId?: string, actorUsername?: string): WarehouseLocation {
    const location = this.locationRepo.update(id, changes)
    this.auditRepo.create({
      action: AuditAction.Update,
      module: 'inventory',
      resourceType: 'WarehouseLocation',
      resourceId: location._id,
      summary: `Warehouse location "${location.name}" updated`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })
    return location
  }

  archiveLocation(id: string, actorUserId?: string, actorUsername?: string): boolean {
    const location = this.locationRepo.findById(id)
    const result = this.locationRepo.softDelete(id)
    if (result) {
      this.auditRepo.create({
        action: AuditAction.Delete,
        module: 'inventory',
        resourceType: 'WarehouseLocation',
        resourceId: id,
        summary: `Warehouse location "${location?.name ?? id}" archived`,
        outcome: AuditOutcome.Success,
        actorUserId,
        actorUsername,
      })
    }
    return result
  }
}
