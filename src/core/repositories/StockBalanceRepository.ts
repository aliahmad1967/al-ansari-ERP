import { StockBalance, type StockBalanceInput } from '../models/StockBalance'
import { BaseRepository, type FindOptions, type ModelConstructor } from './BaseRepository'

export class StockBalanceRepository extends BaseRepository<StockBalance, StockBalanceInput> {
  protected get objectType(): string {
    return 'StockBalance'
  }

  protected get modelClass(): ModelConstructor<StockBalance> {
    return StockBalance
  }

  protected get supportsSoftDelete(): boolean {
    return false
  }

  findByProduct(productId: string, options: FindOptions = {}): StockBalance[] {
    return this.query('productId == $0', [productId], options)
  }

  findByWarehouse(warehouseId: string, options: FindOptions = {}): StockBalance[] {
    return this.query('warehouseId == $0', [warehouseId], options)
  }

  findByProductAndWarehouse(productId: string, warehouseId: string, options: FindOptions = {}): StockBalance[] {
    return this.query('productId == $0 && warehouseId == $1', [productId, warehouseId], options)
  }

  findByProductWarehouseLocation(
    productId: string,
    warehouseId: string,
    locationId: string,
  ): StockBalance | null {
    return this.first(
      'productId == $0 && warehouseId == $1 && locationId == $2',
      [productId, warehouseId, locationId],
    )
  }

  findWithMovements(options: FindOptions = {}): StockBalance[] {
    return this.query(null, [], options)
  }
}
