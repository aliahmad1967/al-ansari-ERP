import type { Product } from '@/core/models/Product'
import type { Warehouse } from '@/core/models/Warehouse'
import type { StockMovement } from '@/core/models/StockMovement'
import { ProductRepository } from '@/core/repositories/ProductRepository'
import { WarehouseRepository } from '@/core/repositories/WarehouseRepository'
import { StockBalanceRepository } from '@/core/repositories/StockBalanceRepository'
import { WarehouseLocationRepository } from '@/core/repositories/WarehouseLocationRepository'
import { StockMovementRepository } from '@/core/repositories/StockMovementRepository'

interface StockBalanceReportRow {
  product: Product
  warehouse: Warehouse
  quantity: number
  unitCost: number
  totalValue: number
}

interface LowStockReportRow {
  product: Product
  currentStock: number
  minimumStock: number
  warehouse: string
}

interface InventoryValuationRow {
  product: Product
  totalQuantity: number
  totalValue: number
  averageCost: number
}

interface WarehouseReportSummary {
  totalProducts: number
  totalValue: number
  locations: number
}

export class InventoryReportService {
  private readonly productRepo = new ProductRepository()
  private readonly warehouseRepo = new WarehouseRepository()
  private readonly balanceRepo = new StockBalanceRepository()
  private readonly locationRepo = new WarehouseLocationRepository()
  private readonly movementRepo = new StockMovementRepository()

  getStockBalanceReport(): StockBalanceReportRow[] {
    const balances = this.balanceRepo.findAll()
    const result: StockBalanceReportRow[] = []

    for (const balance of balances) {
      const product = this.productRepo.findById(balance.productId)
      const warehouse = this.warehouseRepo.findById(balance.warehouseId)
      if (product && warehouse) {
        result.push({
          product,
          warehouse,
          quantity: balance.quantity,
          unitCost: balance.unitCost,
          totalValue: balance.totalCost,
        })
      }
    }

    return result
  }

  getLowStockReport(): LowStockReportRow[] {
    const balances = this.balanceRepo.findAll()
    const result: LowStockReportRow[] = []

    for (const balance of balances) {
      const product = this.productRepo.findById(balance.productId)
      if (product && balance.quantity <= product.minimumStock) {
        result.push({
          product,
          currentStock: balance.quantity,
          minimumStock: product.minimumStock,
          warehouse: balance.warehouseId,
        })
      }
    }

    return result
  }

  getInventoryValuationReport(): InventoryValuationRow[] {
    const balances = this.balanceRepo.findAll()
    const productMap = new Map<string, { product: Product; totalQuantity: number; totalValue: number }>()

    for (const balance of balances) {
      const existing = productMap.get(balance.productId)
      if (existing) {
        existing.totalQuantity += balance.quantity
        existing.totalValue += balance.totalCost
      } else {
        const product = this.productRepo.findById(balance.productId)
        if (product) {
          productMap.set(balance.productId, {
            product,
            totalQuantity: balance.quantity,
            totalValue: balance.totalCost,
          })
        }
      }
    }

    return Array.from(productMap.values()).map(entry => ({
      ...entry,
      averageCost: entry.totalQuantity > 0 ? entry.totalValue / entry.totalQuantity : 0,
    }))
  }

  getWarehouseReport(warehouseId: string): WarehouseReportSummary {
    const balances = this.balanceRepo.findByWarehouse(warehouseId)
    const locations = this.locationRepo.findByWarehouse(warehouseId)
    const totalProducts = new Set(balances.map(b => b.productId)).size
    const totalValue = balances.reduce((sum, b) => sum + b.totalCost, 0)

    return {
      totalProducts,
      totalValue,
      locations: locations.length,
    }
  }

  getProductMovementReport(productId: string, startDate: Date, endDate: Date): StockMovement[] {
    return this.movementRepo.findByDateRange(startDate, endDate).filter(m => m.productId === productId)
  }

  getTotalStockValue(): number {
    return this.balanceRepo.findAll().reduce((sum, b) => sum + b.totalCost, 0)
  }

  getTotalProductCount(): number {
    return this.productRepo.findAll().length
  }

  getLowStockCount(): number {
    const balances = this.balanceRepo.findAll()
    let count = 0
    for (const balance of balances) {
      const product = this.productRepo.findById(balance.productId)
      if (product && balance.quantity <= product.minimumStock) {
        count++
      }
    }
    return count
  }
}
