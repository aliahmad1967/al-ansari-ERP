import { AuditAction, AuditOutcome } from '@/core/models/AuditLog'
import type { SupplierInvoice, SupplierInvoiceInput, SupplierInvoiceStatusValue } from '@/core/models/SupplierInvoice'
import { SupplierInvoiceStatus } from '@/core/models/SupplierInvoice'
import type { SupplierPayment, SupplierPaymentMethodValue } from '@/core/models/SupplierPayment'
import { SupplierPaymentStatus } from '@/core/models/SupplierPayment'
import { SupplierInvoiceRepository } from '@/core/repositories/SupplierInvoiceRepository'
import { SupplierPaymentRepository } from '@/core/repositories/SupplierPaymentRepository'
import { AuditRepository } from '@/core/repositories/AuditRepository'
import type { FindOptions } from '@/core/repositories/BaseRepository'

export class SupplierInvoiceService {
  private readonly invoiceRepo = new SupplierInvoiceRepository()
  private readonly paymentRepo = new SupplierPaymentRepository()
  private readonly auditRepo = new AuditRepository()

  findAllInvoices(options: FindOptions = {}): SupplierInvoice[] {
    return this.invoiceRepo.findAll(options)
  }

  findInvoiceById(id: string): SupplierInvoice | null {
    return this.invoiceRepo.findById(id)
  }

  findInvoicesBySupplier(supplierId: string): SupplierInvoice[] {
    return this.invoiceRepo.findBySupplier(supplierId)
  }

  findOverdueInvoices(): SupplierInvoice[] {
    return this.invoiceRepo.findOverdue()
  }

  createInvoice(input: SupplierInvoiceInput, actorUserId?: string, actorUsername?: string): SupplierInvoice {
    const invoice = this.invoiceRepo.create(input)

    this.auditRepo.create({
      action: AuditAction.Create,
      module: 'procurement',
      resourceType: 'SupplierInvoice',
      resourceId: invoice._id,
      summary: `Supplier invoice "${invoice.code}" created`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })

    return invoice
  }

  registerInvoice(id: string, actorUserId?: string, actorUsername?: string): SupplierInvoice {
    const invoice = this.invoiceRepo.findById(id)
    if (!invoice) {
      throw new Error(`Supplier invoice ${id} not found`)
    }
    if (invoice.status !== SupplierInvoiceStatus.Draft) {
      throw new Error(`Cannot register invoice in status "${invoice.status}"`)
    }

    const updated = this.invoiceRepo.update(id, { status: SupplierInvoiceStatus.Registered })

    this.auditRepo.create({
      action: AuditAction.Update,
      module: 'procurement',
      resourceType: 'SupplierInvoice',
      resourceId: id,
      summary: `Supplier invoice "${invoice.code}" registered`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })

    return updated
  }

  validateInvoice(id: string, actorUserId?: string, actorUsername?: string): SupplierInvoice {
    const invoice = this.invoiceRepo.findById(id)
    if (!invoice) {
      throw new Error(`Supplier invoice ${id} not found`)
    }
    if (invoice.status !== SupplierInvoiceStatus.Registered) {
      throw new Error(`Cannot validate invoice in status "${invoice.status}"`)
    }

    const updated = this.invoiceRepo.update(id, { status: SupplierInvoiceStatus.Validated })

    this.auditRepo.create({
      action: AuditAction.Update,
      module: 'procurement',
      resourceType: 'SupplierInvoice',
      resourceId: id,
      summary: `Supplier invoice "${invoice.code}" validated`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })

    return updated
  }

  recordPayment(
    invoiceId: string,
    amount: number,
    paymentMethod: SupplierPaymentMethodValue,
    referenceNumber: string | undefined,
    paymentDate: Date,
    actorUserId?: string,
    actorUsername?: string,
  ): SupplierPayment {
    const invoice = this.invoiceRepo.findById(invoiceId)
    if (!invoice) {
      throw new Error(`Supplier invoice ${invoiceId} not found`)
    }

    const paymentCode = `PAY-${Date.now()}`
    const payment = this.paymentRepo.create({
      code: paymentCode,
      paymentDate,
      supplierInvoiceId: invoiceId,
      supplierId: invoice.supplierId,
      amount,
      paymentMethod,
      referenceNumber,
      status: SupplierPaymentStatus.Completed,
    })

    const newPaidAmount = invoice.paidAmount + amount
    let newStatus: SupplierInvoiceStatusValue
    if (newPaidAmount >= invoice.netAmount) {
      newStatus = SupplierInvoiceStatus.Paid
    } else {
      newStatus = SupplierInvoiceStatus.PartiallyPaid
    }

    this.invoiceRepo.update(invoiceId, {
      paidAmount: newPaidAmount,
      status: newStatus,
    })

    this.auditRepo.create({
      action: AuditAction.Create,
      module: 'procurement',
      resourceType: 'SupplierPayment',
      resourceId: payment._id,
      summary: `Payment of ${amount} recorded for invoice "${invoice.code}"`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })

    return payment
  }

  findPaymentsByInvoice(invoiceId: string): SupplierPayment[] {
    return this.paymentRepo.findByInvoice(invoiceId)
  }

  findPaymentsBySupplier(supplierId: string): SupplierPayment[] {
    return this.paymentRepo.findBySupplier(supplierId)
  }
}
