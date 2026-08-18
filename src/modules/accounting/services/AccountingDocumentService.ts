import { AuditAction, AuditOutcome } from '@/core/models/AuditLog'
import {
  AccountingPaymentStatus,
  type AccountingPaymentInput,
} from '@/core/models/AccountingPayment'
import {
  AccountingReceiptStatus,
  type AccountingReceiptInput,
} from '@/core/models/AccountingReceipt'
import { AccountingPaymentRepository } from '@/core/repositories/AccountingPaymentRepository'
import { AccountingReceiptRepository } from '@/core/repositories/AccountingReceiptRepository'
import { AuditRepository } from '@/core/repositories/AuditRepository'
import type { FindOptions } from '@/core/repositories/BaseRepository'

export class AccountingDocumentService {
  private readonly paymentRepo = new AccountingPaymentRepository()
  private readonly receiptRepo = new AccountingReceiptRepository()
  private readonly auditRepo = new AuditRepository()

  findAllPayments(options: FindOptions = {}) {
    return this.paymentRepo.findAll(options)
  }

  findPaymentById(id: string) {
    return this.paymentRepo.findById(id)
  }

  findPaymentByCode(code: string) {
    return this.paymentRepo.findByCode(code)
  }

  searchPayments(query: string, options: FindOptions = {}) {
    return this.paymentRepo.search(query, options)
  }

  createPayment(
    input: AccountingPaymentInput,
    actorUserId?: string,
    actorUsername?: string,
  ) {
    const existing = this.paymentRepo.findByCode(input.code)
    if (existing) {
      throw new Error(`Payment with code "${input.code}" already exists`)
    }

    const payment = this.paymentRepo.create({
      ...input,
      status: AccountingPaymentStatus.Draft,
    })

    this.auditRepo.create({
      action: AuditAction.Create,
      module: 'accounting',
      resourceType: 'AccountingPayment',
      resourceId: payment._id,
      summary: `Payment "${payment.code}" created`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })

    return payment
  }

  approvePayment(id: string, actorUserId?: string, actorUsername?: string) {
    const payment = this.paymentRepo.findById(id)
    if (!payment) throw new Error('Payment not found')
    if (payment.status !== AccountingPaymentStatus.Draft) {
      throw new Error('Only draft payments can be approved')
    }

    const updated = this.paymentRepo.update(id, {
      status: AccountingPaymentStatus.Approved,
      approvedAt: new Date(),
      approvedByUserId: actorUserId ?? null,
    })

    this.auditRepo.create({
      action: AuditAction.Update,
      module: 'accounting',
      resourceType: 'AccountingPayment',
      resourceId: id,
      summary: `Payment "${payment.code}" approved`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })

    return updated
  }

  cancelPayment(id: string, _actorUserId?: string, _actorUsername?: string) {
    const payment = this.paymentRepo.findById(id)
    if (!payment) throw new Error('Payment not found')
    if (payment.status === AccountingPaymentStatus.Cancelled) {
      throw new Error('Payment is already cancelled')
    }
    if (payment.status === AccountingPaymentStatus.Posted) {
      throw new Error('Cannot cancel posted payment')
    }

    return this.paymentRepo.update(id, { status: AccountingPaymentStatus.Cancelled })
  }

  findAllReceipts(options: FindOptions = {}) {
    return this.receiptRepo.findAll(options)
  }

  findReceiptById(id: string) {
    return this.receiptRepo.findById(id)
  }

  findReceiptByCode(code: string) {
    return this.receiptRepo.findByCode(code)
  }

  searchReceipts(query: string, options: FindOptions = {}) {
    return this.receiptRepo.search(query, options)
  }

  createReceipt(
    input: AccountingReceiptInput,
    actorUserId?: string,
    actorUsername?: string,
  ) {
    const existing = this.receiptRepo.findByCode(input.code)
    if (existing) {
      throw new Error(`Receipt with code "${input.code}" already exists`)
    }

    const receipt = this.receiptRepo.create({
      ...input,
      status: AccountingReceiptStatus.Draft,
    })

    this.auditRepo.create({
      action: AuditAction.Create,
      module: 'accounting',
      resourceType: 'AccountingReceipt',
      resourceId: receipt._id,
      summary: `Receipt "${receipt.code}" created`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })

    return receipt
  }

  approveReceipt(id: string, actorUserId?: string, actorUsername?: string) {
    const receipt = this.receiptRepo.findById(id)
    if (!receipt) throw new Error('Receipt not found')
    if (receipt.status !== AccountingReceiptStatus.Draft) {
      throw new Error('Only draft receipts can be approved')
    }

    const updated = this.receiptRepo.update(id, {
      status: AccountingReceiptStatus.Approved,
      approvedAt: new Date(),
      approvedByUserId: actorUserId ?? null,
    })

    this.auditRepo.create({
      action: AuditAction.Update,
      module: 'accounting',
      resourceType: 'AccountingReceipt',
      resourceId: id,
      summary: `Receipt "${receipt.code}" approved`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })

    return updated
  }

  cancelReceipt(id: string, _actorUserId?: string, _actorUsername?: string) {
    const receipt = this.receiptRepo.findById(id)
    if (!receipt) throw new Error('Receipt not found')
    if (receipt.status === AccountingReceiptStatus.Cancelled) {
      throw new Error('Receipt is already cancelled')
    }
    if (receipt.status === AccountingReceiptStatus.Posted) {
      throw new Error('Cannot cancel posted receipt')
    }

    return this.receiptRepo.update(id, { status: AccountingReceiptStatus.Cancelled })
  }
}
