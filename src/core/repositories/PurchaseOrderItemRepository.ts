import {
  PurchaseOrderItem,
  type PurchaseOrderItemInput,
} from '../models/PurchaseOrderItem'
import { BaseRepository, type FindOptions, type ModelConstructor } from './BaseRepository'

export class PurchaseOrderItemRepository extends BaseRepository<PurchaseOrderItem, PurchaseOrderItemInput> {
  protected get objectType(): string {
    return 'PurchaseOrderItem'
  }

  protected get modelClass(): ModelConstructor<PurchaseOrderItem> {
    return PurchaseOrderItem
  }

  findByOrder(purchaseOrderId: string, options: FindOptions = {}): PurchaseOrderItem[] {
    return this.query('purchaseOrderId == $0', [purchaseOrderId], options)
  }

  findByProduct(productId: string, options: FindOptions = {}): PurchaseOrderItem[] {
    return this.query('productId == $0', [productId], options)
  }
}
