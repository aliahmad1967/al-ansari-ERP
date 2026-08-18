import { JournalEntryReferenceType } from '@/core/models/JournalEntry'
import { JournalEntryService, type JournalEntryLineInput } from './JournalEntryService'
import { AccountRepository } from '@/core/repositories/AccountRepository'
import { FiscalYearService } from './FiscalYearService'
export class PostingService {
  private readonly journalService = new JournalEntryService()
  private readonly accountRepo = new AccountRepository()
  private readonly fiscalYearService = new FiscalYearService()

  postSalesInvoice(invoice: {
    _id: string
    invoiceNumber: string
    invoiceDate: Date
    customerId: string
    totalAmount: number
    taxAmount: number
    grandTotal: number
    items: Array<{ accountId?: string; amount: number; taxAmount: number }>
  }, actorUserId?: string, actorUsername?: string) {
    const existing = this.journalService.findEntryByCode(`INV-${invoice.invoiceNumber}`)
    if (existing) {
      throw new Error(`Journal entry already exists for invoice ${invoice.invoiceNumber}`)
    }

    const arAccount = this.findAccountByCode('1200')
    const revenueAccount = this.findAccountByCode('4100')
    const taxPayableAccount = this.findAccountByCode('2310')

    if (!arAccount || !revenueAccount) {
      throw new Error('Required accounts not found. Ensure Accounts Receivable (1200) and Sales Revenue (4100) exist.')
    }

    const period = this.fiscalYearService.findPeriodForDate(invoice.invoiceDate)
    const year = this.fiscalYearService.findYearForDate(invoice.invoiceDate)
    if (!period || !year) {
      throw new Error('No open fiscal period for invoice date')
    }

    const lines: JournalEntryLineInput[] = [
      {
        accountId: arAccount._id,
        debit: invoice.grandTotal,
        credit: 0,
        description: `A/R - ${invoice.invoiceNumber}`,
        customerId: invoice.customerId,
      },
      {
        accountId: revenueAccount._id,
        debit: 0,
        credit: invoice.totalAmount,
        description: `Revenue - ${invoice.invoiceNumber}`,
        customerId: invoice.customerId,
      },
    ]

    if (invoice.taxAmount > 0 && taxPayableAccount) {
      lines.push({
        accountId: taxPayableAccount._id,
        debit: 0,
        credit: invoice.taxAmount,
        description: `VAT Payable - ${invoice.invoiceNumber}`,
        customerId: invoice.customerId,
      })
    }

    return this.journalService.createDraftEntry(
      {
        entryDate: invoice.invoiceDate,
        fiscalYearId: year._id,
        fiscalPeriodId: period._id,
        description: `Sales Invoice ${invoice.invoiceNumber}`,
        referenceType: JournalEntryReferenceType.SalesInvoice,
        referenceId: invoice._id,
        referenceNumber: invoice.invoiceNumber,
        lines,
      },
      actorUserId,
      actorUsername,
    )
  }

  postCustomerPayment(payment: {
    _id: string
    paymentNumber: string
    paymentDate: Date
    customerId: string
    amount: number
    bankAccountId?: string
  }, actorUserId?: string, actorUsername?: string) {
    const existing = this.journalService.findEntryByCode(`CPMT-${payment.paymentNumber}`)
    if (existing) {
      throw new Error(`Journal entry already exists for payment ${payment.paymentNumber}`)
    }

    const bankAccount = payment.bankAccountId
      ? this.accountRepo.findById(payment.bankAccountId)
      : this.findAccountByCode('1020')
    const arAccount = this.findAccountByCode('1200')

    if (!bankAccount || !arAccount) {
      throw new Error('Required accounts not found')
    }

    const period = this.fiscalYearService.findPeriodForDate(payment.paymentDate)
    const year = this.fiscalYearService.findYearForDate(payment.paymentDate)
    if (!period || !year) {
      throw new Error('No open fiscal period for payment date')
    }

    return this.journalService.createDraftEntry(
      {
        entryDate: payment.paymentDate,
        fiscalYearId: year._id,
        fiscalPeriodId: period._id,
        description: `Customer Payment ${payment.paymentNumber}`,
        referenceType: JournalEntryReferenceType.CustomerPayment,
        referenceId: payment._id,
        referenceNumber: payment.paymentNumber,
        lines: [
          {
            accountId: bankAccount._id,
            debit: payment.amount,
            credit: 0,
            description: `Bank - ${payment.paymentNumber}`,
            customerId: payment.customerId,
          },
          {
            accountId: arAccount._id,
            debit: 0,
            credit: payment.amount,
            description: `A/R - ${payment.paymentNumber}`,
            customerId: payment.customerId,
          },
        ],
      },
      actorUserId,
      actorUsername,
    )
  }

  postSupplierInvoice(invoice: {
    _id: string
    invoiceNumber: string
    invoiceDate: Date
    supplierId: string
    totalAmount: number
    taxAmount: number
    grandTotal: number
  }, actorUserId?: string, actorUsername?: string) {
    const existing = this.journalService.findEntryByCode(`SINV-${invoice.invoiceNumber}`)
    if (existing) {
      throw new Error(`Journal entry already exists for supplier invoice ${invoice.invoiceNumber}`)
    }

    const expenseAccount = this.findAccountByCode('5100')
    const apAccount = this.findAccountByCode('2100')
    const taxReceivableAccount = this.findAccountByCode('1300')

    if (!expenseAccount || !apAccount) {
      throw new Error('Required accounts not found')
    }

    const period = this.fiscalYearService.findPeriodForDate(invoice.invoiceDate)
    const year = this.fiscalYearService.findYearForDate(invoice.invoiceDate)
    if (!period || !year) {
      throw new Error('No open fiscal period for invoice date')
    }

    const lines: JournalEntryLineInput[] = [
      {
        accountId: expenseAccount._id,
        debit: invoice.totalAmount,
        credit: 0,
        description: `Expense - ${invoice.invoiceNumber}`,
        supplierId: invoice.supplierId,
      },
      {
        accountId: apAccount._id,
        debit: 0,
        credit: invoice.grandTotal,
        description: `A/P - ${invoice.invoiceNumber}`,
        supplierId: invoice.supplierId,
      },
    ]

    if (invoice.taxAmount > 0 && taxReceivableAccount) {
      lines.splice(1, 0, {
        accountId: taxReceivableAccount._id,
        debit: invoice.taxAmount,
        credit: 0,
        description: `VAT Receivable - ${invoice.invoiceNumber}`,
        supplierId: invoice.supplierId,
      })
    }

    return this.journalService.createDraftEntry(
      {
        entryDate: invoice.invoiceDate,
        fiscalYearId: year._id,
        fiscalPeriodId: period._id,
        description: `Supplier Invoice ${invoice.invoiceNumber}`,
        referenceType: JournalEntryReferenceType.SupplierInvoice,
        referenceId: invoice._id,
        referenceNumber: invoice.invoiceNumber,
        lines,
      },
      actorUserId,
      actorUsername,
    )
  }

  postSupplierPayment(payment: {
    _id: string
    paymentNumber: string
    paymentDate: Date
    supplierId: string
    amount: number
    bankAccountId?: string
  }, actorUserId?: string, actorUsername?: string) {
    const existing = this.journalService.findEntryByCode(`SPMT-${payment.paymentNumber}`)
    if (existing) {
      throw new Error(`Journal entry already exists for payment ${payment.paymentNumber}`)
    }

    const bankAccount = payment.bankAccountId
      ? this.accountRepo.findById(payment.bankAccountId)
      : this.findAccountByCode('1020')
    const apAccount = this.findAccountByCode('2100')

    if (!bankAccount || !apAccount) {
      throw new Error('Required accounts not found')
    }

    const period = this.fiscalYearService.findPeriodForDate(payment.paymentDate)
    const year = this.fiscalYearService.findYearForDate(payment.paymentDate)
    if (!period || !year) {
      throw new Error('No open fiscal period for payment date')
    }

    return this.journalService.createDraftEntry(
      {
        entryDate: payment.paymentDate,
        fiscalYearId: year._id,
        fiscalPeriodId: period._id,
        description: `Supplier Payment ${payment.paymentNumber}`,
        referenceType: JournalEntryReferenceType.SupplierPayment,
        referenceId: payment._id,
        referenceNumber: payment.paymentNumber,
        lines: [
          {
            accountId: apAccount._id,
            debit: payment.amount,
            credit: 0,
            description: `A/P - ${payment.paymentNumber}`,
            supplierId: payment.supplierId,
          },
          {
            accountId: bankAccount._id,
            debit: 0,
            credit: payment.amount,
            description: `Bank - ${payment.paymentNumber}`,
            supplierId: payment.supplierId,
          },
        ],
      },
      actorUserId,
      actorUsername,
    )
  }

  postPayroll(run: {
    _id: string
    runNumber: string
    runDate: Date
    totalGross: number
    totalDeductions: number
    totalNet: number
    lines: Array<{
      employeeId: string
      employeeName: string
      grossSalary: number
      deductions: number
      netSalary: number
    }>
  }, actorUserId?: string, actorUsername?: string) {
    const existing = this.journalService.findEntryByCode(`PAY-${run.runNumber}`)
    if (existing) {
      throw new Error(`Journal entry already exists for payroll ${run.runNumber}`)
    }

    const salaryExpenseAccount = this.findAccountByCode('5200')
    const salaryPayableAccount = this.findAccountByCode('2400')

    if (!salaryExpenseAccount || !salaryPayableAccount) {
      throw new Error('Required payroll accounts not found')
    }

    const period = this.fiscalYearService.findPeriodForDate(run.runDate)
    const year = this.fiscalYearService.findYearForDate(run.runDate)
    if (!period || !year) {
      throw new Error('No open fiscal period for payroll date')
    }

    return this.journalService.createDraftEntry(
      {
        entryDate: run.runDate,
        fiscalYearId: year._id,
        fiscalPeriodId: period._id,
        description: `Payroll ${run.runNumber}`,
        referenceType: JournalEntryReferenceType.Payroll,
        referenceId: run._id,
        referenceNumber: run.runNumber,
        lines: [
          {
            accountId: salaryExpenseAccount._id,
            debit: run.totalGross,
            credit: 0,
            description: `Salary Expense - ${run.runNumber}`,
          },
          {
            accountId: salaryPayableAccount._id,
            debit: 0,
            credit: run.totalNet,
            description: `Salary Payable - ${run.runNumber}`,
          },
        ],
      },
      actorUserId,
      actorUsername,
    )
  }

  postInventoryAdjustment(adjustment: {
    _id: string
    adjustmentNumber: string
    adjustmentDate: Date
    inventoryAccountId: string
    cogsAccountId: string
    totalValueChange: number
    isIncrease: boolean
  }, actorUserId?: string, actorUsername?: string) {
    const existing = this.journalService.findEntryByCode(`INVADJ-${adjustment.adjustmentNumber}`)
    if (existing) {
      throw new Error(`Journal entry already exists for adjustment ${adjustment.adjustmentNumber}`)
    }

    const inventoryAccount = this.accountRepo.findById(adjustment.inventoryAccountId)
    const cogsAccount = this.accountRepo.findById(adjustment.cogsAccountId)

    if (!inventoryAccount || !cogsAccount) {
      throw new Error('Inventory or COGS account not found')
    }

    const period = this.fiscalYearService.findPeriodForDate(adjustment.adjustmentDate)
    const year = this.fiscalYearService.findYearForDate(adjustment.adjustmentDate)
    if (!period || !year) {
      throw new Error('No open fiscal period for adjustment date')
    }

    const debitAccount = adjustment.isIncrease ? adjustment.inventoryAccountId : adjustment.cogsAccountId
    const creditAccount = adjustment.isIncrease ? adjustment.cogsAccountId : adjustment.inventoryAccountId

    return this.journalService.createDraftEntry(
      {
        entryDate: adjustment.adjustmentDate,
        fiscalYearId: year._id,
        fiscalPeriodId: period._id,
        description: `Inventory Adjustment ${adjustment.adjustmentNumber}`,
        referenceType: JournalEntryReferenceType.InventoryAdjustment,
        referenceId: adjustment._id,
        referenceNumber: adjustment.adjustmentNumber,
        lines: [
          {
            accountId: debitAccount,
            debit: adjustment.totalValueChange,
            credit: 0,
            description: `Adjustment - ${adjustment.adjustmentNumber}`,
          },
          {
            accountId: creditAccount,
            debit: 0,
            credit: adjustment.totalValueChange,
            description: `Adjustment - ${adjustment.adjustmentNumber}`,
          },
        ],
      },
      actorUserId,
      actorUsername,
    )
  }

  private findAccountByCode(code: string) {
    return this.accountRepo.findByCode(code)
  }
}
