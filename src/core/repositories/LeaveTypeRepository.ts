import { LeaveType, type LeaveTypeInput } from '../models/LeaveType'
import { BaseRepository, type ModelConstructor } from './BaseRepository'

export class LeaveTypeRepository extends BaseRepository<LeaveType, LeaveTypeInput> {
  protected get objectType(): string {
    return 'LeaveType'
  }

  protected get modelClass(): ModelConstructor<LeaveType> {
    return LeaveType
  }

  findActive(): LeaveType[] {
    return this.query('isActive == true', [])
  }

  findByName(name: string): LeaveType | null {
    return this.first('name == $0', [name])
  }
}
