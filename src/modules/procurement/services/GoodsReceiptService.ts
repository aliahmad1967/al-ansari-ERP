import { AuditAction, AuditOutcome } from '@/core/models/AuditLog'
import type { GoodsReceipt, GoodsReceiptInput } from '@/core/models/GoodsReceipt'
import { GoodsReceiptStatus } from '@/core/models/GoodsReceipt'
import { StockMovementType } from '@/core/models/StockMovement'
import { GoodsReceiptRepository } from '@/core/repositories/GoodsReceiptRepository'
import { GoodsReceiptItemRepository } from '@/core/repositories/GoodsReceiptItemRepository'
import { PurchaseOrderItemRepository } from '@/core/repositories/PurchaseOrderItemRepository'
import { StockMovementRepository } from '@/core/repositories/StockMovementRepository'
import { StockBalanceRepository } from '@/core/repositories/StockBalanceRepository'
import { AuditRepository } from '@/core/repositories/AuditRepository'
import { calculateStockMovement, calculateAverageCost } from '@/modules/inventory/services/StockMovementEngine'
import type { FindOptions } from '@/core/repositories/BaseRepository'

export class GoodsReceiptService {
  private readonly receiptRepo = new GoodsReceiptRepository()
  private readonly itemRepo = new GoodsReceiptItemRepository()
  private readonly orderItemRepo = new PurchaseOrderItemRepository()
  private readonly movementRepo = new StockMovementRepository()
  private readonly balanceRepo = new StockBalanceRepository()
  private readonly auditRepo = new AuditRepository()

  findAllReceipts(options: FindOptions = {}): GoodsReceipt[] {
    return this.receiptRepo.findAll(options)
  }

  findReceiptById(id: string): GoodsReceipt | null {
    return this.receiptRepo.findById(id)
  }

  findReceiptsByOrder(purchaseOrderId: string): GoodsReceipt[] {
    return this.receiptRepo.findByOrder(purchaseOrderId)
  }

  createReceipt(
    input: GoodsReceiptInput,
    items: Array<{
      purchaseOrderItemId: string
      productId: string
      quantityReceived: number
      batchNumber?: string
      expiryDate?: Date
    }>,
    actorUserId?: string,
    actorUsername?: string,
  ): GoodsReceipt {
    const receipt = this.receiptRepo.create(input)

    for (const item of items) {
      this.itemRepo.create({
        goodsReceiptId: receipt._id,
        purchaseOrderItemId: item.purchaseOrderItemId,
        productId: item.productId,
        quantityReceived: item.quantityReceived,
        batchNumber: item.batchNumber,
        expiryDate: item.expiryDate,
      })
    }

    this.auditRepo.create({
      action: AuditAction.Create,
      module: 'procurement',
      resourceType: 'GoodsReceipt',
      resourceId: receipt._id,
      summary: `Goods receipt "${receipt.code}" created with ${items.length} items`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })

    return this.receiptRepo.findById(receipt._id)!
  }

  markReceived(id: string, actorUserId?: string, actorUsername?: string): GoodsReceipt {
    const receipt = this.receiptRepo.findById(id)
    if (!receipt) {
      throw new Error(`Goods receipt ${id} not found`)
    }
    if (receipt.status !== GoodsReceiptStatus.Draft) {
      throw new Error(`Cannot mark as received in status "${receipt.status}"`)
    }

    const updated = this.receiptRepo.update(id, { status: GoodsReceiptStatus.Received })

    this.auditRepo.create({
      action: AuditAction.Update,
      module: 'procurement',
      resourceType: 'GoodsReceipt',
      resourceId: id,
      summary: `Goods receipt "${receipt.code}" marked as received`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })

    return updated
  }

  markAccepted(id: string, actorUserId?: string, actorUsername?: string): GoodsReceipt {
    const receipt = this.receiptRepo.findById(id)
    if (!receipt) {
      throw new Error(`Goods receipt ${id} not found`)
    }
    if (
      receipt.status !== GoodsReceiptStatus.Received &&
      receipt.status !== GoodsReceiptStatus.Inspected
    ) {
      throw new Error(`Cannot accept receipt in status "${receipt.status}"`)
    }

    const items = this.itemRepo.findByReceipt(id)

    for (const item of items) {
      if (item.quantityAccepted <= 0) continue

      const poItem = this.orderItemRepo.findById(item.purchaseOrderItemId)
      const unitCost = poItem?.unitPrice ?? 0

      const movementInput = {
        type: StockMovementType.Purchase,
        productId: item.productId,
        warehouseId: receipt.warehouseId,
        quantity: item.quantityAccepted,
        unitCost,
        referenceType: 'GoodsReceipt',
        referenceId: receipt._id,
        referenceNumber: receipt.code,
        batchNumber: item.batchNumber ?? undefined,
        expiryDate: item.expiryDate ?? undefined,
      }

      const movement = calculateStockMovement(movementInput)
      this.movementRepo.create({
        ...movementInput,
        quantity: movement.quantity,
        unitCost: movement.unitCost,
      })

      const existing = this.balanceRepo.findByProductAndWarehouse(
        item.productId,
        receipt.warehouseId,
      )[0]

      const now = new Date()

      if (existing) {
        const newQty = existing.quantity + movement.quantity
        const newUnitCost =
          movement.quantity > 0
            ? calculateAverageCost(existing.quantity, existing.unitCost, movement.quantity, movement.unitCost)
            : existing.unitCost
        const newTotalCost = newQty * newUnitCost
        this.balanceRepo.update(existing._id, {
          quantity: Math.max(0, newQty),
          unitCost: newUnitCost,
          totalCost: Math.max(0, newTotalCost),
          lastMovementAt: now,
        })
      } else if (movement.quantity > 0) {
        this.balanceRepo.create({
          productId: item.productId,
          warehouseId: receipt.warehouseId,
          quantity: movement.quantity,
          unitCost: movement.unitCost,
          totalCost: movement.quantity * movement.unitCost,
          lastMovementAt: now,
        })
      }
    }

    const updated = this.receiptRepo.update(id, { status: GoodsReceiptStatus.Accepted })

    this.auditRepo.create({
      action: AuditAction.Update,
      module: 'procurement',
      resourceType: 'GoodsReceipt',
      resourceId: id,
      summary: `Goods receipt "${receipt.code}" accepted — ${items.length} items posted to inventory`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })

    return updated
  }

  markRejected(id: string, actorUserId?: string, actorUsername?: string): GoodsReceipt {
    const receipt = this.receiptRepo.findById(id)
    if (!receipt) {
      throw new Error(`Goods receipt ${id} not found`)
    }
    if (
      receipt.status !== GoodsReceiptStatus.Received &&
      receipt.status !== GoodsReceiptStatus.Inspected
    ) {
      throw new Error(`Cannot reject receipt in status "${receipt.status}"`)
    }

    const updated = this.receiptRepo.update(id, { status: GoodsReceiptStatus.Rejected })

    this.auditRepo.create({
      action: AuditAction.Update,
      module: 'procurement',
      resourceType: 'GoodsReceipt',
      resourceId: id,
      summary: `Goods receipt "${receipt.code}" rejected`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })

    return updated
  }
}
