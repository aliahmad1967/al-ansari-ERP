import { AuditAction, AuditOutcome } from '@/core/models/AuditLog'
import type { StockTransfer, StockTransferInput, StockTransferStatusValue } from '@/core/models/StockTransfer'
import { StockTransferStatus } from '@/core/models/StockTransfer'
import { StockTransferRepository } from '@/core/repositories/StockTransferRepository'
import { AuditRepository } from '@/core/repositories/AuditRepository'
import type { FindOptions } from '@/core/repositories/BaseRepository'

const VALID_TRANSITIONS: Record<StockTransferStatusValue, StockTransferStatusValue[]> = {
  [StockTransferStatus.Draft]: [StockTransferStatus.Pending, StockTransferStatus.Cancelled],
  [StockTransferStatus.Pending]: [StockTransferStatus.InTransit, StockTransferStatus.Cancelled],
  [StockTransferStatus.InTransit]: [StockTransferStatus.Received],
  [StockTransferStatus.Received]: [],
  [StockTransferStatus.Cancelled]: [],
}

export class InventoryTransferService {
  private readonly transferRepo = new StockTransferRepository()
  private readonly auditRepo = new AuditRepository()

  findAllTransfers(options: FindOptions = {}): StockTransfer[] {
    return this.transferRepo.findAll(options)
  }

  findTransferById(id: string): StockTransfer | null {
    return this.transferRepo.findById(id)
  }

  findTransfersByStatus(status: StockTransferStatusValue): StockTransfer[] {
    return this.transferRepo.findByStatus(status)
  }

  createTransfer(input: StockTransferInput, actorUserId?: string, actorUsername?: string): StockTransfer {
    if (input.fromWarehouseId === input.toWarehouseId) {
      throw new Error('Source and destination warehouses must be different')
    }

    const transfer = this.transferRepo.create({
      ...input,
      status: StockTransferStatus.Draft,
    })

    this.auditRepo.create({
      action: AuditAction.Create,
      module: 'inventory',
      resourceType: 'StockTransfer',
      resourceId: transfer._id,
      summary: `Stock transfer "${transfer.code}" created`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })

    return transfer
  }

  updateTransferStatus(
    id: string,
    status: StockTransferStatusValue,
    actorUserId?: string,
    actorUsername?: string,
  ): StockTransfer {
    const transfer = this.transferRepo.findById(id)
    if (!transfer) {
      throw new Error(`Stock transfer "${id}" not found`)
    }

    const allowed = VALID_TRANSITIONS[transfer.status]
    if (!allowed || !allowed.includes(status)) {
      throw new Error(
        `Invalid status transition from "${transfer.status}" to "${status}"`,
      )
    }

    const changes: { status: StockTransferStatusValue; actualArrivalDate?: Date } = { status }
    if (status === StockTransferStatus.Received) {
      changes.actualArrivalDate = new Date()
    }

    const updated = this.transferRepo.update(id, changes)

    this.auditRepo.create({
      action: AuditAction.Update,
      module: 'inventory',
      resourceType: 'StockTransfer',
      resourceId: updated._id,
      summary: `Stock transfer "${updated.code}" status changed to "${status}"`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })

    return updated
  }

  cancelTransfer(id: string, actorUserId?: string, actorUsername?: string): StockTransfer {
    return this.updateTransferStatus(id, StockTransferStatus.Cancelled, actorUserId, actorUsername)
  }
}
