import { AuditAction, AuditOutcome } from '@/core/models/AuditLog'
import { SalesOrderStatus, type SalesOrder, type SalesOrderInput } from '@/core/models/SalesOrder'
import type { SalesOrderItem, SalesOrderItemInput } from '@/core/models/SalesOrderItem'
import { SalesOrderRepository } from '@/core/repositories/SalesOrderRepository'
import { SalesOrderItemRepository } from '@/core/repositories/SalesOrderItemRepository'
import { AuditRepository } from '@/core/repositories/AuditRepository'
import type { FindOptions } from '@/core/repositories/BaseRepository'
import { moneyAdd, moneyMul, moneySub, toNumber } from '@/core/utils/currency'
import { newDocumentNumber } from '@/core/utils/generators'

export class SalesOrderService {
  private readonly salesOrderRepo = new SalesOrderRepository()
  private readonly salesOrderItemRepo = new SalesOrderItemRepository()
  private readonly auditRepo = new AuditRepository()

  findAllSalesOrders(options: FindOptions = {}): SalesOrder[] {
    return this.salesOrderRepo.findAll(options)
  }

  findSalesOrderById(id: string): SalesOrder | null {
    return this.salesOrderRepo.findById(id)
  }

  findSalesOrderItems(salesOrderId: string): SalesOrderItem[] {
    return this.salesOrderItemRepo.findBySalesOrder(salesOrderId)
  }

  findByCustomer(customerId: string): SalesOrder[] {
    return this.salesOrderRepo.findByCustomer(customerId)
  }

  searchSalesOrders(query: string): SalesOrder[] {
    return this.salesOrderRepo.search(query)
  }

  createSalesOrder(
    input: SalesOrderInput,
    items: Omit<SalesOrderItemInput, 'salesOrderId'>[],
    sequence: number,
    actorUserId?: string,
    actorUsername?: string,
  ): SalesOrder {
    const code = newDocumentNumber('SO', sequence)
    const salesOrder = this.salesOrderRepo.create({ ...input, code })

    let totalAmount = 0
    let totalTax = 0
    let totalDiscount = 0

    for (const item of items) {
      const lineTotal = toNumber(moneyMul(item.quantity, item.unitPrice ?? 0))
      const lineTax = toNumber(moneyMul(lineTotal, (item.taxRate ?? 0) / 100))
      const lineDiscount = toNumber(moneyMul(lineTotal, (item.discountRate ?? 0) / 100))

      this.salesOrderItemRepo.create({
        ...item,
        salesOrderId: salesOrder._id,
        taxAmount: lineTax,
        discountAmount: lineDiscount,
        totalAmount: toNumber(moneySub(moneyAdd(lineTotal, lineTax), lineDiscount)),
      })

      totalAmount = toNumber(moneyAdd(totalAmount, lineTotal))
      totalTax = toNumber(moneyAdd(totalTax, lineTax))
      totalDiscount = toNumber(moneyAdd(totalDiscount, lineDiscount))
    }

    const netAmount = toNumber(moneySub(moneyAdd(totalAmount, totalTax), totalDiscount))
    this.salesOrderRepo.update(salesOrder._id, {
      totalAmount,
      taxAmount: totalTax,
      discountAmount: totalDiscount,
      netAmount,
    } as Partial<SalesOrderInput>)

    this.auditRepo.create({
      action: AuditAction.Create,
      module: 'sales',
      resourceType: 'SalesOrder',
      resourceId: salesOrder._id,
      summary: `Sales order "${code}" created`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })

    return this.salesOrderRepo.findById(salesOrder._id)!
  }

  updateSalesOrder(
    id: string,
    changes: Partial<SalesOrderInput>,
    actorUserId?: string,
    actorUsername?: string,
  ): SalesOrder {
    const order = this.salesOrderRepo.findById(id)
    if (!order) throw new Error('Sales order not found')
    if (order.status !== SalesOrderStatus.Draft) {
      throw new Error('Only draft orders can be edited')
    }
    const updated = this.salesOrderRepo.update(id, changes)
    this.auditRepo.create({
      action: AuditAction.Update,
      module: 'sales',
      resourceType: 'SalesOrder',
      resourceId: id,
      summary: `Sales order "${updated.code}" updated`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })
    return updated
  }

  confirmSalesOrder(id: string, actorUserId?: string, actorUsername?: string): SalesOrder {
    const order = this.salesOrderRepo.findById(id)
    if (!order) throw new Error('Sales order not found')
    if (order.status !== SalesOrderStatus.Draft) {
      throw new Error('Only draft orders can be confirmed')
    }
    const updated = this.salesOrderRepo.update(id, { status: SalesOrderStatus.Confirmed })
    this.auditRepo.create({
      action: AuditAction.Approve,
      module: 'sales',
      resourceType: 'SalesOrder',
      resourceId: id,
      summary: `Sales order "${updated.code}" confirmed`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })
    return updated
  }

  cancelSalesOrder(id: string, actorUserId?: string, actorUsername?: string): SalesOrder {
    const order = this.salesOrderRepo.findById(id)
    if (!order) throw new Error('Sales order not found')
    if (order.status === SalesOrderStatus.Completed || order.status === SalesOrderStatus.Cancelled) {
      throw new Error('Cannot cancel a completed or already cancelled order')
    }
    const updated = this.salesOrderRepo.update(id, { status: SalesOrderStatus.Cancelled })
    this.auditRepo.create({
      action: AuditAction.Cancel,
      module: 'sales',
      resourceType: 'SalesOrder',
      resourceId: id,
      summary: `Sales order "${updated.code}" cancelled`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })
    return updated
  }

  archiveSalesOrder(id: string, actorUserId?: string, actorUsername?: string): boolean {
    const order = this.salesOrderRepo.findById(id)
    const result = this.salesOrderRepo.softDelete(id)
    if (result) {
      this.auditRepo.create({
        action: AuditAction.Delete,
        module: 'sales',
        resourceType: 'SalesOrder',
        resourceId: id,
        summary: `Sales order "${order?.code ?? id}" archived`,
        outcome: AuditOutcome.Success,
        actorUserId,
        actorUsername,
      })
    }
    return result
  }
}
