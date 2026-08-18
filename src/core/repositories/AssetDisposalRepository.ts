import {
  AssetDisposal,
  type AssetDisposalInput,
  type AssetDisposalStatusValue,
} from '../models/AssetDisposal'
import { required, validateFields, type ValidationIssue } from '../utils/validation'
import { BaseRepository, type FindOptions, type ModelConstructor } from './BaseRepository'

export class AssetDisposalRepository extends BaseRepository<AssetDisposal, AssetDisposalInput> {
  protected get objectType(): string {
    return 'AssetDisposal'
  }

  protected get modelClass(): ModelConstructor<AssetDisposal> {
    return AssetDisposal
  }

  protected validateCreate(values: Record<string, unknown>): ValidationIssue[] {
    return validateFields(values, {
      assetId: required('Asset'),
      disposalDate: required('Disposal date'),
      disposalMethod: required('Disposal method'),
      reason: required('Disposal reason'),
    })
  }

  findByAsset(assetId: string, options: FindOptions = {}): AssetDisposal[] {
    return this.query('assetId == $0', [assetId], options)
  }

  findByStatus(status: AssetDisposalStatusValue, options: FindOptions = {}): AssetDisposal[] {
    return this.query('status == $0', [status], options)
  }

  findByJournalEntry(journalEntryId: string): AssetDisposal | null {
    return this.first('journalEntryId == $0', [journalEntryId])
  }

  search(query: string, options: FindOptions = {}): AssetDisposal[] {
    const byReason = this.query('reason CONTAINS[c] $0', [query], options)
    const ids = new Set<string>()
    const result: AssetDisposal[] = []
    for (const item of [...byReason]) {
      if (!ids.has(item._id)) {
        ids.add(item._id)
        result.push(item)
      }
    }
    return result
  }
}
