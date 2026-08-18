import { SalesInvoiceItem, type SalesInvoiceItemInput } from '../models/SalesInvoiceItem'
import { BaseRepository, type FindOptions, type ModelConstructor } from './BaseRepository'

export class SalesInvoiceItemRepository extends BaseRepository<SalesInvoiceItem, SalesInvoiceItemInput> {
  protected get objectType(): string {
    return 'SalesInvoiceItem'
  }

  protected get modelClass(): ModelConstructor<SalesInvoiceItem> {
    return SalesInvoiceItem
  }

  findByInvoice(salesInvoiceId: string, options: FindOptions = {}): SalesInvoiceItem[] {
    return this.query('salesInvoiceId == $0', [salesInvoiceId], options)
  }
}
