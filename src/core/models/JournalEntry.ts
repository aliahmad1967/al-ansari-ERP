import Realm from 'realm'

import { BASE_PROPERTIES, SOFT_DELETE_PROPERTIES, type SoftDeletableEntityFields } from './base'

export const JournalEntryStatus = {
  Draft: 'draft',
  Reviewed: 'reviewed',
  Approved: 'approved',
  Posted: 'posted',
  Reversed: 'reversed',
} as const

export type JournalEntryStatusValue = (typeof JournalEntryStatus)[keyof typeof JournalEntryStatus]

export const JournalEntryReferenceType = {
  Manual: 'manual',
  SalesInvoice: 'sales_invoice',
  CustomerPayment: 'customer_payment',
  SupplierInvoice: 'supplier_invoice',
  SupplierPayment: 'supplier_payment',
  Payroll: 'payroll',
  InventoryAdjustment: 'inventory_adjustment',
  OpeningBalance: 'opening_balance',
  Reversal: 'reversal',
  AssetAcquisition: 'asset_acquisition',
  AssetDepreciation: 'asset_depreciation',
  AssetDisposal: 'asset_disposal',
} as const

export type JournalEntryReferenceTypeValue = (typeof JournalEntryReferenceType)[keyof typeof JournalEntryReferenceType]

export interface JournalEntryInput {
  code: string
  entryDate: Date
  fiscalYearId: string
  fiscalPeriodId: string
  referenceType?: JournalEntryReferenceTypeValue
  referenceId?: string | null
  referenceNumber?: string | null
  description: string
  notes?: string | null
  totalDebit: number
  totalCredit: number
  currency?: string
  reversalOfId?: string | null
  status?: JournalEntryStatusValue
  reviewedAt?: Date
  reviewedByUserId?: string | null
  approvedAt?: Date
  approvedByUserId?: string | null
  postedAt?: Date
  postedByUserId?: string | null
  createdByUserId?: string | null
}

export class JournalEntry extends Realm.Object<JournalEntry> {
  declare _id: string
  declare code: string
  declare entryDate: Date
  declare fiscalYearId: string
  declare fiscalPeriodId: string
  declare referenceType: JournalEntryReferenceTypeValue
  declare referenceId: string | null
  declare referenceNumber: string | null
  declare description: string
  declare notes: string | null
  declare status: JournalEntryStatusValue
  declare reversalOfId: string | null
  declare postedAt: Date | null
  declare postedByUserId: string | null
  declare reviewedAt: Date | null
  declare reviewedByUserId: string | null
  declare approvedAt: Date | null
  declare approvedByUserId: string | null
  declare totalDebit: number
  declare totalCredit: number
  declare currency: string
  declare createdByUserId: string | null
  declare createdAt: Date
  declare updatedAt: Date
  declare isDeleted: boolean
  declare deletedAt: Date | null

  static schema: Realm.ObjectSchema = {
    name: 'JournalEntry',
    primaryKey: '_id',
    properties: {
      ...BASE_PROPERTIES,
      ...SOFT_DELETE_PROPERTIES,
      code: { type: 'string', indexed: true },
      entryDate: { type: 'date', indexed: true },
      fiscalYearId: { type: 'string', indexed: true },
      fiscalPeriodId: { type: 'string', indexed: true },
      referenceType: { type: 'string', default: JournalEntryReferenceType.Manual },
      referenceId: { type: 'string', optional: true, indexed: true },
      referenceNumber: { type: 'string', optional: true },
      description: { type: 'string' },
      notes: { type: 'string', optional: true },
      status: { type: 'string', default: JournalEntryStatus.Draft },
      reversalOfId: { type: 'string', optional: true, indexed: true },
      postedAt: { type: 'date', optional: true },
      postedByUserId: { type: 'string', optional: true },
      reviewedAt: { type: 'date', optional: true },
      reviewedByUserId: { type: 'string', optional: true },
      approvedAt: { type: 'date', optional: true },
      approvedByUserId: { type: 'string', optional: true },
      totalDebit: { type: 'double', default: 0 },
      totalCredit: { type: 'double', default: 0 },
      currency: { type: 'string', default: 'SAR' },
      createdByUserId: { type: 'string', optional: true },
    },
  }
}

export type JournalEntryEntity = JournalEntry & SoftDeletableEntityFields
