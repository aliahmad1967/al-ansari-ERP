import { AuditAction, AuditOutcome } from '@/core/models/AuditLog'
import {
  CustomerPaymentStatus,
  type CustomerPayment,
  type CustomerPaymentInput,
} from '@/core/models/CustomerPayment'
import { SalesInvoiceStatus, type SalesInvoiceInput } from '@/core/models/SalesInvoice'
import { CustomerPaymentRepository } from '@/core/repositories/CustomerPaymentRepository'
import { SalesInvoiceRepository } from '@/core/repositories/SalesInvoiceRepository'
import { AuditRepository } from '@/core/repositories/AuditRepository'
import type { FindOptions } from '@/core/repositories/BaseRepository'
import { moneyAdd, toNumber } from '@/core/utils/currency'
import { newDocumentNumber } from '@/core/utils/generators'

export class CustomerPaymentService {
  private readonly paymentRepo = new CustomerPaymentRepository()
  private readonly invoiceRepo = new SalesInvoiceRepository()
  private readonly auditRepo = new AuditRepository()

  findAllPayments(options: FindOptions = {}): CustomerPayment[] {
    return this.paymentRepo.findAll(options)
  }

  findPaymentById(id: string): CustomerPayment | null {
    return this.paymentRepo.findById(id)
  }

  findByInvoice(salesInvoiceId: string): CustomerPayment[] {
    return this.paymentRepo.findByInvoice(salesInvoiceId)
  }

  findByCustomer(customerId: string): CustomerPayment[] {
    return this.paymentRepo.findByCustomer(customerId)
  }

  searchPayments(query: string): CustomerPayment[] {
    return this.paymentRepo.search(query)
  }

  createPayment(
    input: CustomerPaymentInput,
    sequence: number,
    actorUserId?: string,
    actorUsername?: string,
  ): CustomerPayment {
    const code = newDocumentNumber('CPAY', sequence)
    const payment = this.paymentRepo.create({ ...input, code })

    this.auditRepo.create({
      action: AuditAction.Create,
      module: 'sales',
      resourceType: 'CustomerPayment',
      resourceId: payment._id,
      summary: `Customer payment "${code}" created`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })

    return this.paymentRepo.findById(payment._id)!
  }

  completePayment(id: string, actorUserId?: string, actorUsername?: string): CustomerPayment {
    const payment = this.paymentRepo.findById(id)
    if (!payment) throw new Error('Payment not found')
    if (payment.status !== CustomerPaymentStatus.Draft) {
      throw new Error('Only draft payments can be completed')
    }

    const updated = this.paymentRepo.update(id, { status: CustomerPaymentStatus.Completed })

    const invoice = this.invoiceRepo.findById(payment.salesInvoiceId)
    if (invoice) {
      const newPaidAmount = toNumber(moneyAdd(invoice.paidAmount, payment.amount))
      const invoiceUpdate: Partial<SalesInvoiceInput> = { paidAmount: newPaidAmount }

      if (newPaidAmount >= invoice.netAmount) {
        invoiceUpdate.status = SalesInvoiceStatus.Paid
      } else if (newPaidAmount > 0) {
        invoiceUpdate.status = SalesInvoiceStatus.PartiallyPaid
      }

      this.invoiceRepo.update(invoice._id, invoiceUpdate)
    }

    this.auditRepo.create({
      action: AuditAction.Post,
      module: 'sales',
      resourceType: 'CustomerPayment',
      resourceId: id,
      summary: `Customer payment "${updated.code}" completed`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })

    return updated
  }

  cancelPayment(id: string, actorUserId?: string, actorUsername?: string): CustomerPayment {
    const payment = this.paymentRepo.findById(id)
    if (!payment) throw new Error('Payment not found')
    if (payment.status === CustomerPaymentStatus.Cancelled) {
      throw new Error('Payment is already cancelled')
    }

    const updated = this.paymentRepo.update(id, { status: CustomerPaymentStatus.Cancelled })

    if (payment.status === CustomerPaymentStatus.Completed) {
      const invoice = this.invoiceRepo.findById(payment.salesInvoiceId)
      if (invoice) {
        const newPaidAmount = Math.max(0, invoice.paidAmount - payment.amount)
        const invoiceUpdate: Partial<SalesInvoiceInput> = { paidAmount: newPaidAmount }

        if (newPaidAmount === 0) {
          invoiceUpdate.status = SalesInvoiceStatus.Finalized
        } else if (newPaidAmount < invoice.netAmount) {
          invoiceUpdate.status = SalesInvoiceStatus.PartiallyPaid
        }

        this.invoiceRepo.update(invoice._id, invoiceUpdate)
      }
    }

    this.auditRepo.create({
      action: AuditAction.Cancel,
      module: 'sales',
      resourceType: 'CustomerPayment',
      resourceId: id,
      summary: `Customer payment "${updated.code}" cancelled`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })

    return updated
  }

  archivePayment(id: string, actorUserId?: string, actorUsername?: string): boolean {
    const payment = this.paymentRepo.findById(id)
    const result = this.paymentRepo.softDelete(id)
    if (result) {
      this.auditRepo.create({
        action: AuditAction.Delete,
        module: 'sales',
        resourceType: 'CustomerPayment',
        resourceId: id,
        summary: `Customer payment "${payment?.code ?? id}" archived`,
        outcome: AuditOutcome.Success,
        actorUserId,
        actorUsername,
      })
    }
    return result
  }
}
