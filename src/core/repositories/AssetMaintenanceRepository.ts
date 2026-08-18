import {
  AssetMaintenance,
  type AssetMaintenanceInput,
  type AssetMaintenanceStatusValue,
  type AssetMaintenanceTypeValue,
} from '../models/AssetMaintenance'
import { required, validateFields, type ValidationIssue } from '../utils/validation'
import { BaseRepository, type FindOptions, type ModelConstructor } from './BaseRepository'

export class AssetMaintenanceRepository extends BaseRepository<
  AssetMaintenance,
  AssetMaintenanceInput
> {
  protected get objectType(): string {
    return 'AssetMaintenance'
  }

  protected get modelClass(): ModelConstructor<AssetMaintenance> {
    return AssetMaintenance
  }

  protected validateCreate(values: Record<string, unknown>): ValidationIssue[] {
    return validateFields(values, {
      assetId: required('Asset'),
      description: required('Description'),
      scheduledDate: required('Scheduled date'),
    })
  }

  findByAsset(assetId: string, options: FindOptions = {}): AssetMaintenance[] {
    return this.query('assetId == $0', [assetId], options)
  }

  findByStatus(
    status: AssetMaintenanceStatusValue,
    options: FindOptions = {},
  ): AssetMaintenance[] {
    return this.query('status == $0', [status], options)
  }

  findByType(type: AssetMaintenanceTypeValue, options: FindOptions = {}): AssetMaintenance[] {
    return this.query('type == $0', [type], options)
  }

  search(query: string, options: FindOptions = {}): AssetMaintenance[] {
    const byDescription = this.query('description CONTAINS[c] $0', [query], options)
    const byVendor = this.query('vendor CONTAINS[c] $0', [query], options)
    const ids = new Set<string>()
    const result: AssetMaintenance[] = []
    for (const item of [...byDescription, ...byVendor]) {
      if (!ids.has(item._id)) {
        ids.add(item._id)
        result.push(item)
      }
    }
    return result
  }
}
