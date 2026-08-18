import {
  DepreciationSchedule,
  type DepreciationScheduleInput,
  type DepreciationScheduleStatusValue,
} from '../models/DepreciationSchedule'
import { required, validateFields, type ValidationIssue } from '../utils/validation'
import { BaseRepository, type FindOptions, type ModelConstructor } from './BaseRepository'

export class DepreciationScheduleRepository extends BaseRepository<
  DepreciationSchedule,
  DepreciationScheduleInput
> {
  protected get objectType(): string {
    return 'DepreciationSchedule'
  }

  protected get modelClass(): ModelConstructor<DepreciationSchedule> {
    return DepreciationSchedule
  }

  protected validateCreate(values: Record<string, unknown>): ValidationIssue[] {
    return validateFields(values, {
      assetId: required('Asset'),
      periodStart: required('Period start'),
      periodEnd: required('Period end'),
      depreciationAmount: required('Depreciation amount'),
    })
  }

  findByAsset(assetId: string, options: FindOptions = {}): DepreciationSchedule[] {
    return this.query('assetId == $0', [assetId], options)
  }

  findByStatus(
    status: DepreciationScheduleStatusValue,
    options: FindOptions = {},
  ): DepreciationSchedule[] {
    return this.query('status == $0', [status], options)
  }

  findByAssetAndPeriod(
    assetId: string,
    periodStart: Date,
    periodEnd: Date,
  ): DepreciationSchedule | null {
    return this.first(
      'assetId == $0 AND periodStart == $1 AND periodEnd == $2',
      [assetId, periodStart, periodEnd],
    )
  }

  findByJournalEntry(journalEntryId: string): DepreciationSchedule | null {
    return this.first('journalEntryId == $0', [journalEntryId])
  }
}
