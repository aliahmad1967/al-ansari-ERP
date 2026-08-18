import { Delivery, type DeliveryInput, type DeliveryStatusValue } from '../models/Delivery'
import { required, validateFields, type ValidationIssue } from '../utils/validation'
import { BaseRepository, type FindOptions, type ModelConstructor } from './BaseRepository'

export class DeliveryRepository extends BaseRepository<Delivery, DeliveryInput> {
  protected get objectType(): string {
    return 'Delivery'
  }

  protected get modelClass(): ModelConstructor<Delivery> {
    return Delivery
  }

  protected validateCreate(values: Record<string, unknown>): ValidationIssue[] {
    return validateFields(values, {
      code: required('Delivery code'),
      salesOrderId: required('Sales order'),
      customerId: required('Customer'),
      warehouseId: required('Warehouse'),
    })
  }

  findByStatus(status: DeliveryStatusValue, options: FindOptions = {}): Delivery[] {
    return this.query('status == $0', [status], options)
  }

  findBySalesOrder(salesOrderId: string, options: FindOptions = {}): Delivery[] {
    return this.query('salesOrderId == $0', [salesOrderId], options)
  }

  findByCustomer(customerId: string, options: FindOptions = {}): Delivery[] {
    return this.query('customerId == $0', [customerId], options)
  }

  search(query: string, options: FindOptions = {}): Delivery[] {
    return this.query(
      'code CONTAINS[c] $0 OR trackingNumber CONTAINS[c] $0',
      [query],
      options,
    )
  }
}
