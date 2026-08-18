import {
  Asset,
  type AssetInput,
  type AssetStatusValue,
} from '../models/Asset'
import { required, validateFields, type ValidationIssue } from '../utils/validation'
import { BaseRepository, type FindOptions, type ModelConstructor } from './BaseRepository'

export class AssetRepository extends BaseRepository<Asset, AssetInput> {
  protected get objectType(): string {
    return 'Asset'
  }

  protected get modelClass(): ModelConstructor<Asset> {
    return Asset
  }

  protected validateCreate(values: Record<string, unknown>): ValidationIssue[] {
    return validateFields(values, {
      code: required('Asset code'),
      name: required('Asset name'),
      nameAr: required('Asset name (Arabic)'),
      categoryId: required('Asset category'),
      purchaseValue: required('Purchase value'),
      usefulLifeMonths: required('Useful life (months)'),
      acquisitionDate: required('Acquisition date'),
    })
  }

  findByCode(code: string): Asset | null {
    return this.first('code == $0', [code])
  }

  findByCategory(categoryId: string, options: FindOptions = {}): Asset[] {
    return this.query('categoryId == $0', [categoryId], options)
  }

  findByLocation(locationId: string, options: FindOptions = {}): Asset[] {
    return this.query('locationId == $0', [locationId], options)
  }

  findByCustodian(custodianId: string, options: FindOptions = {}): Asset[] {
    return this.query('custodianId == $0', [custodianId], options)
  }

  findByStatus(status: AssetStatusValue, options: FindOptions = {}): Asset[] {
    return this.query('status == $0', [status], options)
  }

  findByAcquisitionDateRange(
    startDate: Date,
    endDate: Date,
    options: FindOptions = {},
  ): Asset[] {
    return this.query('acquisitionDate >= $0 AND acquisitionDate <= $1', [startDate, endDate], options)
  }

  search(query: string, options: FindOptions = {}): Asset[] {
    const byName = this.query('name CONTAINS[c] $0', [query], options)
    const byNameAr = this.query('nameAr CONTAINS[c] $0', [query], options)
    const byCode = this.query('code CONTAINS[c] $0', [query], options)
    const bySerialNumber = this.query('serialNumber CONTAINS[c] $0', [query], options)
    const ids = new Set<string>()
    const result: Asset[] = []
    for (const item of [...byCode, ...byName, ...byNameAr, ...bySerialNumber]) {
      if (!ids.has(item._id)) {
        ids.add(item._id)
        result.push(item)
      }
    }
    return result
  }
}
