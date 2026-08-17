import {
  GoodsReceiptItem,
  type GoodsReceiptItemInput,
} from '../models/GoodsReceiptItem'
import { BaseRepository, type FindOptions, type ModelConstructor } from './BaseRepository'

export class GoodsReceiptItemRepository extends BaseRepository<GoodsReceiptItem, GoodsReceiptItemInput> {
  protected get objectType(): string {
    return 'GoodsReceiptItem'
  }

  protected get modelClass(): ModelConstructor<GoodsReceiptItem> {
    return GoodsReceiptItem
  }

  findByReceipt(goodsReceiptId: string, options: FindOptions = {}): GoodsReceiptItem[] {
    return this.query('goodsReceiptId == $0', [goodsReceiptId], options)
  }

  findByProduct(productId: string, options: FindOptions = {}): GoodsReceiptItem[] {
    return this.query('productId == $0', [productId], options)
  }
}
