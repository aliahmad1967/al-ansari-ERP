import { AuditAction, AuditOutcome } from '@/core/models/AuditLog'
import { SalesInvoiceStatus, type SalesInvoice, type SalesInvoiceInput } from '@/core/models/SalesInvoice'
import type { SalesInvoiceItem, SalesInvoiceItemInput } from '@/core/models/SalesInvoiceItem'
import { SalesOrderStatus, type SalesOrderInput } from '@/core/models/SalesOrder'
import { SalesInvoiceRepository } from '@/core/repositories/SalesInvoiceRepository'
import { SalesInvoiceItemRepository } from '@/core/repositories/SalesInvoiceItemRepository'
import { SalesOrderRepository } from '@/core/repositories/SalesOrderRepository'
import { SalesOrderItemRepository } from '@/core/repositories/SalesOrderItemRepository'
import { AuditRepository } from '@/core/repositories/AuditRepository'
import type { FindOptions } from '@/core/repositories/BaseRepository'
import { moneyAdd, moneyMul, moneySub, toNumber } from '@/core/utils/currency'
import { newDocumentNumber } from '@/core/utils/generators'

export class SalesInvoiceService {
  private readonly invoiceRepo = new SalesInvoiceRepository()
  private readonly invoiceItemRepo = new SalesInvoiceItemRepository()
  private readonly salesOrderRepo = new SalesOrderRepository()
  private readonly salesOrderItemRepo = new SalesOrderItemRepository()
  private readonly auditRepo = new AuditRepository()

  findAllInvoices(options: FindOptions = {}): SalesInvoice[] {
    return this.invoiceRepo.findAll(options)
  }

  findInvoiceById(id: string): SalesInvoice | null {
    return this.invoiceRepo.findById(id)
  }

  findInvoiceItems(salesInvoiceId: string): SalesInvoiceItem[] {
    return this.invoiceItemRepo.findByInvoice(salesInvoiceId)
  }

  findOverdueInvoices(): SalesInvoice[] {
    return this.invoiceRepo.findOverdue()
  }

  findByCustomer(customerId: string): SalesInvoice[] {
    return this.invoiceRepo.findByCustomer(customerId)
  }

  searchInvoices(query: string): SalesInvoice[] {
    return this.invoiceRepo.search(query)
  }

  createInvoice(
    input: SalesInvoiceInput,
    items: Omit<SalesInvoiceItemInput, 'salesInvoiceId'>[],
    sequence: number,
    actorUserId?: string,
    actorUsername?: string,
  ): SalesInvoice {
    const code = newDocumentNumber('SINV', sequence)
    const invoice = this.invoiceRepo.create({ ...input, code })

    let totalAmount = 0
    let totalTax = 0
    let totalDiscount = 0

    for (const item of items) {
      const lineTotal = toNumber(moneyMul(item.quantity, item.unitPrice ?? 0))
      const lineTax = toNumber(moneyMul(lineTotal, (item.taxRate ?? 0) / 100))
      const lineDiscount = toNumber(moneyMul(lineTotal, (item.discountRate ?? 0) / 100))

      this.invoiceItemRepo.create({
        ...item,
        salesInvoiceId: invoice._id,
        taxAmount: lineTax,
        discountAmount: lineDiscount,
        totalAmount: toNumber(moneySub(moneyAdd(lineTotal, lineTax), lineDiscount)),
      })

      totalAmount = toNumber(moneyAdd(totalAmount, lineTotal))
      totalTax = toNumber(moneyAdd(totalTax, lineTax))
      totalDiscount = toNumber(moneyAdd(totalDiscount, lineDiscount))
    }

    const netAmount = toNumber(moneySub(moneyAdd(totalAmount, totalTax), totalDiscount))
    this.invoiceRepo.update(invoice._id, {
      totalAmount,
      taxAmount: totalTax,
      discountAmount: totalDiscount,
      netAmount,
    } as Partial<SalesInvoiceInput>)

    this.auditRepo.create({
      action: AuditAction.Create,
      module: 'sales',
      resourceType: 'SalesInvoice',
      resourceId: invoice._id,
      summary: `Sales invoice "${code}" created`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })

    return this.invoiceRepo.findById(invoice._id)!
  }

  updateInvoice(
    id: string,
    changes: Partial<SalesInvoiceInput>,
    actorUserId?: string,
    actorUsername?: string,
  ): SalesInvoice {
    const invoice = this.invoiceRepo.findById(id)
    if (!invoice) throw new Error('Invoice not found')
    if (invoice.status !== SalesInvoiceStatus.Draft) {
      throw new Error('Only draft invoices can be edited')
    }
    const updated = this.invoiceRepo.update(id, changes)
    this.auditRepo.create({
      action: AuditAction.Update,
      module: 'sales',
      resourceType: 'SalesInvoice',
      resourceId: id,
      summary: `Sales invoice "${updated.code}" updated`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })
    return updated
  }

  finalizeInvoice(id: string, actorUserId?: string, actorUsername?: string): SalesInvoice {
    const invoice = this.invoiceRepo.findById(id)
    if (!invoice) throw new Error('Invoice not found')
    if (invoice.status !== SalesInvoiceStatus.Draft) {
      throw new Error('Only draft invoices can be finalized')
    }
    const updated = this.invoiceRepo.update(id, { status: SalesInvoiceStatus.Finalized })
    this.auditRepo.create({
      action: AuditAction.Post,
      module: 'sales',
      resourceType: 'SalesInvoice',
      resourceId: id,
      summary: `Sales invoice "${updated.code}" finalized`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })
    return updated
  }

  cancelInvoice(id: string, actorUserId?: string, actorUsername?: string): SalesInvoice {
    const invoice = this.invoiceRepo.findById(id)
    if (!invoice) throw new Error('Invoice not found')
    if (invoice.status === SalesInvoiceStatus.Paid || invoice.status === SalesInvoiceStatus.Cancelled) {
      throw new Error('Cannot cancel a paid or already cancelled invoice')
    }
    const updated = this.invoiceRepo.update(id, { status: SalesInvoiceStatus.Cancelled })
    this.auditRepo.create({
      action: AuditAction.Cancel,
      module: 'sales',
      resourceType: 'SalesInvoice',
      resourceId: id,
      summary: `Sales invoice "${updated.code}" cancelled`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })
    return updated
  }

  updatePaidAmount(id: string, paidAmount: number): void {
    this.invoiceRepo.update(id, { paidAmount } as Partial<SalesInvoiceInput>)
  }

  archiveInvoice(id: string, actorUserId?: string, actorUsername?: string): boolean {
    const invoice = this.invoiceRepo.findById(id)
    const result = this.invoiceRepo.softDelete(id)
    if (result) {
      this.auditRepo.create({
        action: AuditAction.Delete,
        module: 'sales',
        resourceType: 'SalesInvoice',
        resourceId: id,
        summary: `Sales invoice "${invoice?.code ?? id}" archived`,
        outcome: AuditOutcome.Success,
        actorUserId,
        actorUsername,
      })
    }
    return result
  }
}
