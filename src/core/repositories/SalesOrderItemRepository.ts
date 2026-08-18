import { SalesOrderItem, type SalesOrderItemInput } from '../models/SalesOrderItem'
import { BaseRepository, type FindOptions, type ModelConstructor } from './BaseRepository'

export class SalesOrderItemRepository extends BaseRepository<SalesOrderItem, SalesOrderItemInput> {
  protected get objectType(): string {
    return 'SalesOrderItem'
  }

  protected get modelClass(): ModelConstructor<SalesOrderItem> {
    return SalesOrderItem
  }

  findBySalesOrder(salesOrderId: string, options: FindOptions = {}): SalesOrderItem[] {
    return this.query('salesOrderId == $0', [salesOrderId], options)
  }
}
