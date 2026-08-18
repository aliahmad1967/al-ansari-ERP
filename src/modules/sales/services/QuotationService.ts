import { AuditAction, AuditOutcome } from '@/core/models/AuditLog'
import { QuotationStatus, type Quotation, type QuotationInput } from '@/core/models/Quotation'
import type { QuotationItem, QuotationItemInput } from '@/core/models/QuotationItem'
import { SalesOrderStatus, type SalesOrderInput } from '@/core/models/SalesOrder'
import type { SalesOrderItemInput } from '@/core/models/SalesOrderItem'
import { QuotationRepository } from '@/core/repositories/QuotationRepository'
import { QuotationItemRepository } from '@/core/repositories/QuotationItemRepository'
import { AuditRepository } from '@/core/repositories/AuditRepository'
import type { FindOptions } from '@/core/repositories/BaseRepository'
import { moneyAdd, moneyMul, moneySub, toNumber } from '@/core/utils/currency'
import { newDocumentNumber } from '@/core/utils/generators'

export class QuotationService {
  private readonly quotationRepo = new QuotationRepository()
  private readonly quotationItemRepo = new QuotationItemRepository()
  private readonly auditRepo = new AuditRepository()

  findAllQuotations(options: FindOptions = {}): Quotation[] {
    return this.quotationRepo.findAll(options)
  }

  findQuotationById(id: string): Quotation | null {
    return this.quotationRepo.findById(id)
  }

  findQuotationItems(quotationId: string): QuotationItem[] {
    return this.quotationItemRepo.findByQuotation(quotationId)
  }

  findValidQuotations(): Quotation[] {
    return this.quotationRepo.findValid()
  }

  searchQuotations(query: string): Quotation[] {
    return this.quotationRepo.search(query)
  }

  createQuotation(
    input: QuotationInput,
    items: Omit<QuotationItemInput, 'quotationId'>[],
    sequence: number,
    actorUserId?: string,
    actorUsername?: string,
  ): Quotation {
    const code = newDocumentNumber('QT', sequence)
    const quotation = this.quotationRepo.create({ ...input, code })

    let totalAmount = 0
    let totalTax = 0
    let totalDiscount = 0

    for (const item of items) {
      const lineTotal = toNumber(
        moneyMul(item.quantity, item.unitPrice ?? 0),
      )
      const lineTax = toNumber(
        moneyMul(lineTotal, (item.taxRate ?? 0) / 100),
      )
      const lineDiscount = toNumber(
        moneyMul(lineTotal, (item.discountRate ?? 0) / 100),
      )

      this.quotationItemRepo.create({
        ...item,
        quotationId: quotation._id,
        taxAmount: lineTax,
        discountAmount: lineDiscount,
        totalAmount: toNumber(moneySub(moneyAdd(lineTotal, lineTax), lineDiscount)),
      })

      totalAmount = toNumber(moneyAdd(totalAmount, lineTotal))
      totalTax = toNumber(moneyAdd(totalTax, lineTax))
      totalDiscount = toNumber(moneyAdd(totalDiscount, lineDiscount))
    }

    const netAmount = toNumber(moneySub(moneyAdd(totalAmount, totalTax), totalDiscount))
    this.quotationRepo.update(quotation._id, {
      totalAmount,
      taxAmount: totalTax,
      discountAmount: totalDiscount,
      netAmount,
    } as Partial<QuotationInput>)

    this.auditRepo.create({
      action: AuditAction.Create,
      module: 'sales',
      resourceType: 'Quotation',
      resourceId: quotation._id,
      summary: `Quotation "${code}" created`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })

    return this.quotationRepo.findById(quotation._id)!
  }

  updateQuotation(
    id: string,
    changes: Partial<QuotationInput>,
    actorUserId?: string,
    actorUsername?: string,
  ): Quotation {
    const quotation = this.quotationRepo.findById(id)
    if (!quotation) throw new Error('Quotation not found')
    if (quotation.status !== QuotationStatus.Draft) {
      throw new Error('Only draft quotations can be edited')
    }
    const updated = this.quotationRepo.update(id, changes)
    this.auditRepo.create({
      action: AuditAction.Update,
      module: 'sales',
      resourceType: 'Quotation',
      resourceId: id,
      summary: `Quotation "${updated.code}" updated`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })
    return updated
  }

  sendQuotation(id: string, actorUserId?: string, actorUsername?: string): Quotation {
    const quotation = this.quotationRepo.findById(id)
    if (!quotation) throw new Error('Quotation not found')
    if (quotation.status !== QuotationStatus.Draft) {
      throw new Error('Only draft quotations can be sent')
    }
    const updated = this.quotationRepo.update(id, { status: QuotationStatus.Sent })
    this.auditRepo.create({
      action: AuditAction.Update,
      module: 'sales',
      resourceType: 'Quotation',
      resourceId: id,
      summary: `Quotation "${updated.code}" sent to customer`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })
    return updated
  }

  acceptQuotation(id: string, actorUserId?: string, actorUsername?: string): Quotation {
    const quotation = this.quotationRepo.findById(id)
    if (!quotation) throw new Error('Quotation not found')
    if (quotation.status !== QuotationStatus.Sent) {
      throw new Error('Only sent quotations can be accepted')
    }
    const updated = this.quotationRepo.update(id, { status: QuotationStatus.Accepted })
    this.auditRepo.create({
      action: AuditAction.Approve,
      module: 'sales',
      resourceType: 'Quotation',
      resourceId: id,
      summary: `Quotation "${updated.code}" accepted`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })
    return updated
  }

  rejectQuotation(id: string, actorUserId?: string, actorUsername?: string): Quotation {
    const quotation = this.quotationRepo.findById(id)
    if (!quotation) throw new Error('Quotation not found')
    if (quotation.status !== QuotationStatus.Sent) {
      throw new Error('Only sent quotations can be rejected')
    }
    const updated = this.quotationRepo.update(id, { status: QuotationStatus.Rejected })
    this.auditRepo.create({
      action: AuditAction.Reject,
      module: 'sales',
      resourceType: 'Quotation',
      resourceId: id,
      summary: `Quotation "${updated.code}" rejected`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })
    return updated
  }

  markConverted(id: string, salesOrderId: string): void {
    this.quotationRepo.update(id, {
      status: QuotationStatus.Converted,
      salesOrderId,
    } as Partial<QuotationInput>)
  }

  archiveQuotation(id: string, actorUserId?: string, actorUsername?: string): boolean {
    const quotation = this.quotationRepo.findById(id)
    const result = this.quotationRepo.softDelete(id)
    if (result) {
      this.auditRepo.create({
        action: AuditAction.Delete,
        module: 'sales',
        resourceType: 'Quotation',
        resourceId: id,
        summary: `Quotation "${quotation?.code ?? id}" archived`,
        outcome: AuditOutcome.Success,
        actorUserId,
        actorUsername,
      })
    }
    return result
  }
}
