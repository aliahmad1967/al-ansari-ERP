import { DeliveryItem, type DeliveryItemInput } from '../models/DeliveryItem'
import { BaseRepository, type FindOptions, type ModelConstructor } from './BaseRepository'

export class DeliveryItemRepository extends BaseRepository<DeliveryItem, DeliveryItemInput> {
  protected get objectType(): string {
    return 'DeliveryItem'
  }

  protected get modelClass(): ModelConstructor<DeliveryItem> {
    return DeliveryItem
  }

  findByDelivery(deliveryId: string, options: FindOptions = {}): DeliveryItem[] {
    return this.query('deliveryId == $0', [deliveryId], options)
  }
}
