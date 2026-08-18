import { AuditAction, AuditOutcome } from '@/core/models/AuditLog'
import { DeliveryStatus, type Delivery, type DeliveryInput } from '@/core/models/Delivery'
import type { DeliveryItem, DeliveryItemInput } from '@/core/models/DeliveryItem'
import { StockMovementType, type StockMovementInput } from '@/core/models/StockMovement'
import { SalesOrderStatus, type SalesOrderInput } from '@/core/models/SalesOrder'
import { DeliveryRepository } from '@/core/repositories/DeliveryRepository'
import { DeliveryItemRepository } from '@/core/repositories/DeliveryItemRepository'
import { SalesOrderRepository } from '@/core/repositories/SalesOrderRepository'
import { SalesOrderItemRepository } from '@/core/repositories/SalesOrderItemRepository'
import { StockMovementRepository } from '@/core/repositories/StockMovementRepository'
import { AuditRepository } from '@/core/repositories/AuditRepository'
import type { FindOptions } from '@/core/repositories/BaseRepository'
import { newDocumentNumber } from '@/core/utils/generators'

export class DeliveryService {
  private readonly deliveryRepo = new DeliveryRepository()
  private readonly deliveryItemRepo = new DeliveryItemRepository()
  private readonly salesOrderRepo = new SalesOrderRepository()
  private readonly salesOrderItemRepo = new SalesOrderItemRepository()
  private readonly stockMovementRepo = new StockMovementRepository()
  private readonly auditRepo = new AuditRepository()

  findAllDeliveries(options: FindOptions = {}): Delivery[] {
    return this.deliveryRepo.findAll(options)
  }

  findDeliveryById(id: string): Delivery | null {
    return this.deliveryRepo.findById(id)
  }

  findDeliveryItems(deliveryId: string): DeliveryItem[] {
    return this.deliveryItemRepo.findByDelivery(deliveryId)
  }

  findBySalesOrder(salesOrderId: string): Delivery[] {
    return this.deliveryRepo.findBySalesOrder(salesOrderId)
  }

  searchDeliveries(query: string): Delivery[] {
    return this.deliveryRepo.search(query)
  }

  createDelivery(
    input: DeliveryInput,
    items: Omit<DeliveryItemInput, 'deliveryId'>[],
    sequence: number,
    actorUserId?: string,
    actorUsername?: string,
  ): Delivery {
    const code = newDocumentNumber('DEL', sequence)
    const delivery = this.deliveryRepo.create({ ...input, code })

    for (const item of items) {
      this.deliveryItemRepo.create({
        ...item,
        deliveryId: delivery._id,
      })
    }

    this.auditRepo.create({
      action: AuditAction.Create,
      module: 'sales',
      resourceType: 'Delivery',
      resourceId: delivery._id,
      summary: `Delivery "${code}" created`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })

    return this.deliveryRepo.findById(delivery._id)!
  }

  confirmDelivery(id: string, actorUserId?: string, actorUsername?: string): Delivery {
    const delivery = this.deliveryRepo.findById(id)
    if (!delivery) throw new Error('Delivery not found')
    if (delivery.status !== DeliveryStatus.Draft) {
      throw new Error('Only draft deliveries can be confirmed')
    }
    const updated = this.deliveryRepo.update(id, { status: DeliveryStatus.Delivered })
    this.auditRepo.create({
      action: AuditAction.Approve,
      module: 'sales',
      resourceType: 'Delivery',
      resourceId: id,
      summary: `Delivery "${updated.code}" confirmed as delivered`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })
    return updated
  }

  processStockMovements(
    deliveryId: string,
    actorUserId?: string,
    actorUsername?: string,
  ): void {
    const delivery = this.deliveryRepo.findById(deliveryId)
    if (!delivery) throw new Error('Delivery not found')

    const items = this.deliveryItemRepo.findByDelivery(deliveryId)

    for (const item of items) {
      this.stockMovementRepo.create({
        type: StockMovementType.Sale,
        productId: item.productId,
        warehouseId: delivery.warehouseId,
        quantity: -item.quantityShipped,
        referenceType: 'Delivery',
        referenceId: delivery._id,
        referenceNumber: delivery.code,
        batchNumber: item.batchNumber,
        expiryDate: item.expiryDate,
      } as StockMovementInput)
    }

    this.updateSalesOrderDeliveryStatus(delivery.salesOrderId)

    this.auditRepo.create({
      action: AuditAction.Post,
      module: 'sales',
      resourceType: 'Delivery',
      resourceId: deliveryId,
      summary: `Stock movements created for delivery "${delivery.code}"`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })
  }

  private updateSalesOrderDeliveryStatus(salesOrderId: string): void {
    const order = this.salesOrderRepo.findById(salesOrderId)
    if (!order) return

    const orderItems = this.salesOrderItemRepo.findBySalesOrder(salesOrderId)
    const allDelivered = orderItems.every(
      (item) => item.deliveredQuantity >= item.quantity,
    )
    const anyDelivered = orderItems.some(
      (item) => item.deliveredQuantity > 0,
    )

    let newStatus: SalesOrderInput['status']
    if (allDelivered) {
      newStatus = SalesOrderStatus.Delivered
    } else if (anyDelivered) {
      newStatus = SalesOrderStatus.PartiallyDelivered
    } else {
      return
    }

    this.salesOrderRepo.update(salesOrderId, { status: newStatus } as Partial<SalesOrderInput>)
  }

  cancelDelivery(id: string, actorUserId?: string, actorUsername?: string): Delivery {
    const delivery = this.deliveryRepo.findById(id)
    if (!delivery) throw new Error('Delivery not found')
    if (delivery.status === DeliveryStatus.Delivered || delivery.status === DeliveryStatus.Cancelled) {
      throw new Error('Cannot cancel a delivered or already cancelled delivery')
    }
    const updated = this.deliveryRepo.update(id, { status: DeliveryStatus.Cancelled })
    this.auditRepo.create({
      action: AuditAction.Cancel,
      module: 'sales',
      resourceType: 'Delivery',
      resourceId: id,
      summary: `Delivery "${updated.code}" cancelled`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })
    return updated
  }

  archiveDelivery(id: string, actorUserId?: string, actorUsername?: string): boolean {
    const delivery = this.deliveryRepo.findById(id)
    const result = this.deliveryRepo.softDelete(id)
    if (result) {
      this.auditRepo.create({
        action: AuditAction.Delete,
        module: 'sales',
        resourceType: 'Delivery',
        resourceId: id,
        summary: `Delivery "${delivery?.code ?? id}" archived`,
        outcome: AuditOutcome.Success,
        actorUserId,
        actorUsername,
      })
    }
    return result
  }
}
