import { AuditAction, AuditOutcome } from '@/core/models/AuditLog'
import { SalesReturnStatus, type SalesReturn, type SalesReturnInput } from '@/core/models/SalesReturn'
import type { SalesReturnItem, SalesReturnItemInput } from '@/core/models/SalesReturnItem'
import { StockMovementType, type StockMovementInput } from '@/core/models/StockMovement'
import { SalesReturnRepository } from '@/core/repositories/SalesReturnRepository'
import { SalesReturnItemRepository } from '@/core/repositories/SalesReturnItemRepository'
import { StockMovementRepository } from '@/core/repositories/StockMovementRepository'
import { AuditRepository } from '@/core/repositories/AuditRepository'
import type { FindOptions } from '@/core/repositories/BaseRepository'
import { moneyAdd, moneyMul, toNumber } from '@/core/utils/currency'
import { newDocumentNumber } from '@/core/utils/generators'

export class SalesReturnService {
  private readonly returnRepo = new SalesReturnRepository()
  private readonly returnItemRepo = new SalesReturnItemRepository()
  private readonly stockMovementRepo = new StockMovementRepository()
  private readonly auditRepo = new AuditRepository()

  findAllReturns(options: FindOptions = {}): SalesReturn[] {
    return this.returnRepo.findAll(options)
  }

  findReturnById(id: string): SalesReturn | null {
    return this.returnRepo.findById(id)
  }

  findReturnItems(salesReturnId: string): SalesReturnItem[] {
    return this.returnItemRepo.findByReturn(salesReturnId)
  }

  findByCustomer(customerId: string): SalesReturn[] {
    return this.returnRepo.findByCustomer(customerId)
  }

  searchReturns(query: string): SalesReturn[] {
    return this.returnRepo.search(query)
  }

  createReturn(
    input: SalesReturnInput,
    items: Omit<SalesReturnItemInput, 'salesReturnId'>[],
    sequence: number,
    actorUserId?: string,
    actorUsername?: string,
  ): SalesReturn {
    const code = newDocumentNumber('SR', sequence)
    const salesReturn = this.returnRepo.create({ ...input, code })

    let totalAmount = 0
    let totalTax = 0

    for (const item of items) {
      const lineTotal = toNumber(moneyMul(item.quantityReturned, item.unitPrice ?? 0))
      const lineTax = toNumber(moneyMul(lineTotal, (item.taxRate ?? 0) / 100))

      this.returnItemRepo.create({
        ...item,
        salesReturnId: salesReturn._id,
        taxAmount: lineTax,
        totalAmount: toNumber(moneyAdd(lineTotal, lineTax)),
      })

      totalAmount = toNumber(moneyAdd(totalAmount, lineTotal))
      totalTax = toNumber(moneyAdd(totalTax, lineTax))
    }

    const netAmount = toNumber(moneyAdd(totalAmount, totalTax))
    this.returnRepo.update(salesReturn._id, {
      totalAmount,
      taxAmount: totalTax,
      netAmount,
    } as Partial<SalesReturnInput>)

    this.auditRepo.create({
      action: AuditAction.Create,
      module: 'sales',
      resourceType: 'SalesReturn',
      resourceId: salesReturn._id,
      summary: `Sales return "${code}" created`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })

    return this.returnRepo.findById(salesReturn._id)!
  }

  approveReturn(id: string, actorUserId?: string, actorUsername?: string): SalesReturn {
    const salesReturn = this.returnRepo.findById(id)
    if (!salesReturn) throw new Error('Sales return not found')
    if (salesReturn.status !== SalesReturnStatus.Draft) {
      throw new Error('Only draft returns can be approved')
    }
    const updated = this.returnRepo.update(id, { status: SalesReturnStatus.Approved })
    this.auditRepo.create({
      action: AuditAction.Approve,
      module: 'sales',
      resourceType: 'SalesReturn',
      resourceId: id,
      summary: `Sales return "${updated.code}" approved`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })
    return updated
  }

  processReturnStockMovements(
    salesReturnId: string,
    actorUserId?: string,
    actorUsername?: string,
  ): void {
    const salesReturn = this.returnRepo.findById(salesReturnId)
    if (!salesReturn) throw new Error('Sales return not found')

    const items = this.returnItemRepo.findByReturn(salesReturnId)

    for (const item of items) {
      this.stockMovementRepo.create({
        type: StockMovementType.ReturnIn,
        productId: item.productId,
        warehouseId: salesReturn.warehouseId,
        quantity: item.quantityReturned,
        unitCost: item.unitPrice,
        referenceType: 'SalesReturn',
        referenceId: salesReturn._id,
        referenceNumber: salesReturn.code,
      } as StockMovementInput)
    }

    this.returnRepo.update(salesReturnId, {
      status: SalesReturnStatus.Completed,
    } as Partial<SalesReturnInput>)

    this.auditRepo.create({
      action: AuditAction.Post,
      module: 'sales',
      resourceType: 'SalesReturn',
      resourceId: salesReturnId,
      summary: `Stock movements created for return "${salesReturn.code}"`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })
  }

  rejectReturn(id: string, actorUserId?: string, actorUsername?: string): SalesReturn {
    const salesReturn = this.returnRepo.findById(id)
    if (!salesReturn) throw new Error('Sales return not found')
    if (salesReturn.status === SalesReturnStatus.Completed || salesReturn.status === SalesReturnStatus.Rejected) {
      throw new Error('Cannot reject a completed or already rejected return')
    }
    const updated = this.returnRepo.update(id, { status: SalesReturnStatus.Rejected })
    this.auditRepo.create({
      action: AuditAction.Reject,
      module: 'sales',
      resourceType: 'SalesReturn',
      resourceId: id,
      summary: `Sales return "${updated.code}" rejected`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })
    return updated
  }

  archiveReturn(id: string, actorUserId?: string, actorUsername?: string): boolean {
    const salesReturn = this.returnRepo.findById(id)
    const result = this.returnRepo.softDelete(id)
    if (result) {
      this.auditRepo.create({
        action: AuditAction.Delete,
        module: 'sales',
        resourceType: 'SalesReturn',
        resourceId: id,
        summary: `Sales return "${salesReturn?.code ?? id}" archived`,
        outcome: AuditOutcome.Success,
        actorUserId,
        actorUsername,
      })
    }
    return result
  }
}
