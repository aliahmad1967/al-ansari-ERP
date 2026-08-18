import {
  AssetTransfer,
  type AssetTransferInput,
  type AssetTransferStatusValue,
} from '../models/AssetTransfer'
import { required, validateFields, type ValidationIssue } from '../utils/validation'
import { BaseRepository, type FindOptions, type ModelConstructor } from './BaseRepository'

export class AssetTransferRepository extends BaseRepository<AssetTransfer, AssetTransferInput> {
  protected get objectType(): string {
    return 'AssetTransfer'
  }

  protected get modelClass(): ModelConstructor<AssetTransfer> {
    return AssetTransfer
  }

  protected validateCreate(values: Record<string, unknown>): ValidationIssue[] {
    return validateFields(values, {
      assetId: required('Asset'),
      transferDate: required('Transfer date'),
      reason: required('Transfer reason'),
    })
  }

  findByAsset(assetId: string, options: FindOptions = {}): AssetTransfer[] {
    return this.query('assetId == $0', [assetId], options)
  }

  findByStatus(status: AssetTransferStatusValue, options: FindOptions = {}): AssetTransfer[] {
    return this.query('status == $0', [status], options)
  }

  search(query: string, options: FindOptions = {}): AssetTransfer[] {
    const byReason = this.query('reason CONTAINS[c] $0', [query], options)
    const ids = new Set<string>()
    const result: AssetTransfer[] = []
    for (const item of [...byReason]) {
      if (!ids.has(item._id)) {
        ids.add(item._id)
        result.push(item)
      }
    }
    return result
  }
}
