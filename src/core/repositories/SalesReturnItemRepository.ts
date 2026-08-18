import { SalesReturnItem, type SalesReturnItemInput } from '../models/SalesReturnItem'
import { BaseRepository, type FindOptions, type ModelConstructor } from './BaseRepository'

export class SalesReturnItemRepository extends BaseRepository<SalesReturnItem, SalesReturnItemInput> {
  protected get objectType(): string {
    return 'SalesReturnItem'
  }

  protected get modelClass(): ModelConstructor<SalesReturnItem> {
    return SalesReturnItem
  }

  findByReturn(salesReturnId: string, options: FindOptions = {}): SalesReturnItem[] {
    return this.query('salesReturnId == $0', [salesReturnId], options)
  }
}
