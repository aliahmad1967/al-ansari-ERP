import { QuotationItem, type QuotationItemInput } from '../models/QuotationItem'
import { BaseRepository, type FindOptions, type ModelConstructor } from './BaseRepository'

export class QuotationItemRepository extends BaseRepository<QuotationItem, QuotationItemInput> {
  protected get objectType(): string {
    return 'QuotationItem'
  }

  protected get modelClass(): ModelConstructor<QuotationItem> {
    return QuotationItem
  }

  findByQuotation(quotationId: string, options: FindOptions = {}): QuotationItem[] {
    return this.query('quotationId == $0', [quotationId], options)
  }
}
