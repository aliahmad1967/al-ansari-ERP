import { AuditAction, AuditOutcome } from '@/core/models/AuditLog'
import type { StockMovementInput } from '@/core/models/StockMovement'
import type { StockBalance } from '@/core/models/StockBalance'
import { StockBalanceRepository } from '@/core/repositories/StockBalanceRepository'
import { StockMovementRepository } from '@/core/repositories/StockMovementRepository'
import { ProductRepository } from '@/core/repositories/ProductRepository'
import { AuditRepository } from '@/core/repositories/AuditRepository'
import { calculateStockMovement, calculateAverageCost } from '@/modules/inventory/services/StockMovementEngine'
import type { FindOptions } from '@/core/repositories/BaseRepository'

export class StockService {
  private readonly balanceRepo = new StockBalanceRepository()
  private readonly movementRepo = new StockMovementRepository()
  private readonly productRepo = new ProductRepository()
  private readonly auditRepo = new AuditRepository()

  // ---- Stock Balances ----

  findStockBalances(options: FindOptions = {}): StockBalance[] {
    return this.balanceRepo.findAll(options)
  }

  findStockByProduct(productId: string): StockBalance[] {
    return this.balanceRepo.findByProduct(productId)
  }

  findStockByWarehouse(warehouseId: string): StockBalance[] {
    return this.balanceRepo.findByWarehouse(warehouseId)
  }

  findStockByProductAndWarehouse(productId: string, warehouseId: string): StockBalance | null {
    return this.balanceRepo.findByProductAndWarehouse(productId, warehouseId)[0] ?? null
  }

  findLowStockProducts(): Array<{ productName: string; minimumStock: number; productId: string; warehouseId: string; quantity: number }> {
    const allBalances = this.balanceRepo.findAll()
    const result: Array<{ productName: string; minimumStock: number; productId: string; warehouseId: string; quantity: number }> = []

    for (const balance of allBalances) {
      const product = this.productRepo.findById(balance.productId)
      if (product && balance.quantity <= product.minimumStock) {
        result.push({
          productName: product.name,
          minimumStock: product.minimumStock,
          productId: balance.productId,
          warehouseId: balance.warehouseId,
          quantity: balance.quantity,
        })
      }
    }

    return result
  }

  // ---- Stock Movements ----

  findMovements(options: FindOptions = {}): ReturnType<StockMovementRepository['findAll']> {
    return this.movementRepo.findAll(options)
  }

  findMovementsByProduct(productId: string, options: FindOptions = {}): ReturnType<StockMovementRepository['findByProduct']> {
    return this.movementRepo.findByProduct(productId, options)
  }

  findMovementsByWarehouse(warehouseId: string, options: FindOptions = {}): ReturnType<StockMovementRepository['findByWarehouse']> {
    return this.movementRepo.findByWarehouse(warehouseId, options)
  }

  findRecentMovements(limit: number = 20): ReturnType<StockMovementRepository['findRecent']> {
    return this.movementRepo.findRecent(limit)
  }

  // ---- Core Stock Operation ----

  recordMovement(input: StockMovementInput, actorUserId?: string, actorUsername?: string) {
    const movement = calculateStockMovement(input)

    const entity = this.movementRepo.create({
      ...input,
      quantity: movement.quantity,
      unitCost: movement.unitCost,
    })

    this.updateStockBalance(
      input.productId,
      input.warehouseId,
      input.locationId,
      movement.quantity,
      movement.unitCost,
    )

    this.auditRepo.create({
      action: AuditAction.Create,
      module: 'inventory',
      resourceType: 'StockMovement',
      resourceId: entity._id,
      summary: `Stock ${input.type}: ${input.quantity} units of product ${input.productId}`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })

    return entity
  }

  private updateStockBalance(
    productId: string,
    warehouseId: string,
    locationId: string | null | undefined,
    quantityChange: number,
    unitCost: number,
  ): void {
    const existing = locationId
      ? this.balanceRepo.findByProductWarehouseLocation(productId, warehouseId, locationId)
      : this.balanceRepo.findByProductAndWarehouse(productId, warehouseId)[0]

    const now = new Date()

    if (existing) {
      const newQty = existing.quantity + quantityChange
      const newUnitCost =
        quantityChange > 0
          ? calculateAverageCost(existing.quantity, existing.unitCost, quantityChange, unitCost)
          : existing.unitCost
      const newTotalCost = newQty * newUnitCost
      this.balanceRepo.update(existing._id, {
        quantity: Math.max(0, newQty),
        unitCost: newUnitCost,
        totalCost: Math.max(0, newTotalCost),
        lastMovementAt: now,
      })
    } else if (quantityChange > 0) {
      this.balanceRepo.create({
        productId,
        warehouseId,
        locationId: locationId ?? undefined,
        quantity: quantityChange,
        unitCost,
        totalCost: quantityChange * unitCost,
        lastMovementAt: now,
      })
    }
  }

  // ---- Stock Value ----

  getStockValue(warehouseId?: string): number {
    const balances = warehouseId
      ? this.balanceRepo.findByWarehouse(warehouseId)
      : this.balanceRepo.findAll()
    return balances.reduce((sum, b) => sum + b.totalCost, 0)
  }
}
