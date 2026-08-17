import { AuditAction, AuditOutcome } from '@/core/models/AuditLog'
import type { PurchaseOrder, PurchaseOrderInput, PurchaseOrderStatusValue } from '@/core/models/PurchaseOrder'
import { PurchaseOrderStatus } from '@/core/models/PurchaseOrder'
import { PurchaseOrderRepository } from '@/core/repositories/PurchaseOrderRepository'
import { PurchaseOrderItemRepository } from '@/core/repositories/PurchaseOrderItemRepository'
import { AuditRepository } from '@/core/repositories/AuditRepository'
import type { FindOptions } from '@/core/repositories/BaseRepository'

export class PurchaseOrderService {
  private readonly orderRepo = new PurchaseOrderRepository()
  private readonly itemRepo = new PurchaseOrderItemRepository()
  private readonly auditRepo = new AuditRepository()

  findAllOrders(options: FindOptions = {}): PurchaseOrder[] {
    return this.orderRepo.findAll(options)
  }

  findOrderById(id: string): PurchaseOrder | null {
    return this.orderRepo.findById(id)
  }

  findOrdersByStatus(status: PurchaseOrderStatusValue): PurchaseOrder[] {
    return this.orderRepo.findByStatus(status)
  }

  findOrdersBySupplier(supplierId: string): PurchaseOrder[] {
    return this.orderRepo.findBySupplier(supplierId)
  }

  createOrder(
    input: PurchaseOrderInput,
    items: Array<{ productId: string; quantity: number; unitPrice: number; taxRate?: number; discountRate?: number }>,
    actorUserId?: string,
    actorUsername?: string,
  ): PurchaseOrder {
    const order = this.orderRepo.create(input)

    let totalAmount = 0
    let totalTax = 0
    let totalDiscount = 0

    for (const item of items) {
      const lineTotal = item.quantity * item.unitPrice
      const taxAmount = item.taxRate ? lineTotal * (item.taxRate / 100) : 0
      const discountAmount = item.discountRate ? lineTotal * (item.discountRate / 100) : 0
      const netLine = lineTotal + taxAmount - discountAmount

      totalAmount += lineTotal
      totalTax += taxAmount
      totalDiscount += discountAmount

      this.itemRepo.create({
        purchaseOrderId: order._id,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        taxRate: item.taxRate ?? 0,
        taxAmount,
        discountRate: item.discountRate ?? 0,
        discountAmount,
        totalAmount: netLine,
      })
    }

    const netAmount = totalAmount + totalTax - totalDiscount
    this.orderRepo.update(order._id, {
      totalAmount,
      taxAmount: totalTax,
      discountAmount: totalDiscount,
      netAmount,
    })

    this.auditRepo.create({
      action: AuditAction.Create,
      module: 'procurement',
      resourceType: 'PurchaseOrder',
      resourceId: order._id,
      summary: `Purchase order "${order.code}" created with ${items.length} items`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })

    return this.orderRepo.findById(order._id)!
  }

  submitOrder(id: string, actorUserId?: string, actorUsername?: string): PurchaseOrder {
    const order = this.orderRepo.findById(id)
    if (!order) {
      throw new Error(`Purchase order ${id} not found`)
    }
    if (order.status !== PurchaseOrderStatus.Draft) {
      throw new Error(`Cannot submit order in status "${order.status}"`)
    }

    const updated = this.orderRepo.update(id, { status: PurchaseOrderStatus.Submitted })

    this.auditRepo.create({
      action: AuditAction.Update,
      module: 'procurement',
      resourceType: 'PurchaseOrder',
      resourceId: id,
      summary: `Purchase order "${order.code}" submitted`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })

    return updated
  }

  confirmOrder(id: string, actorUserId?: string, actorUsername?: string): PurchaseOrder {
    const order = this.orderRepo.findById(id)
    if (!order) {
      throw new Error(`Purchase order ${id} not found`)
    }
    if (order.status !== PurchaseOrderStatus.Submitted) {
      throw new Error(`Cannot confirm order in status "${order.status}"`)
    }

    const updated = this.orderRepo.update(id, { status: PurchaseOrderStatus.Confirmed })

    this.auditRepo.create({
      action: AuditAction.Update,
      module: 'procurement',
      resourceType: 'PurchaseOrder',
      resourceId: id,
      summary: `Purchase order "${order.code}" confirmed`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })

    return updated
  }

  cancelOrder(id: string, actorUserId?: string, actorUsername?: string): PurchaseOrder {
    const order = this.orderRepo.findById(id)
    if (!order) {
      throw new Error(`Purchase order ${id} not found`)
    }
    if (
      order.status !== PurchaseOrderStatus.Draft &&
      order.status !== PurchaseOrderStatus.Submitted
    ) {
      throw new Error(`Cannot cancel order in status "${order.status}"`)
    }

    const updated = this.orderRepo.update(id, { status: PurchaseOrderStatus.Cancelled })

    this.auditRepo.create({
      action: AuditAction.Update,
      module: 'procurement',
      resourceType: 'PurchaseOrder',
      resourceId: id,
      summary: `Purchase order "${order.code}" cancelled`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })

    return updated
  }
}
