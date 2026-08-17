import {
  PurchaseRequestItem,
  type PurchaseRequestItemInput,
} from '../models/PurchaseRequestItem'
import { BaseRepository, type FindOptions, type ModelConstructor } from './BaseRepository'

export class PurchaseRequestItemRepository extends BaseRepository<PurchaseRequestItem, PurchaseRequestItemInput> {
  protected get objectType(): string {
    return 'PurchaseRequestItem'
  }

  protected get modelClass(): ModelConstructor<PurchaseRequestItem> {
    return PurchaseRequestItem
  }

  findByRequest(purchaseRequestId: string, options: FindOptions = {}): PurchaseRequestItem[] {
    return this.query('purchaseRequestId == $0', [purchaseRequestId], options)
  }

  findByProduct(productId: string, options: FindOptions = {}): PurchaseRequestItem[] {
    return this.query('productId == $0', [productId], options)
  }
}
