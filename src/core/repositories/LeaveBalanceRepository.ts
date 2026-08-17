import { LeaveBalance, type LeaveBalanceInput } from '../models/LeaveBalance'
import { BaseRepository, type ModelConstructor } from './BaseRepository'

export class LeaveBalanceRepository extends BaseRepository<LeaveBalance, LeaveBalanceInput> {
  protected get objectType(): string {
    return 'LeaveBalance'
  }

  protected get modelClass(): ModelConstructor<LeaveBalance> {
    return LeaveBalance
  }

  findByEmployee(employeeId: string, year?: number): LeaveBalance[] {
    const y = year ?? new Date().getFullYear()
    return this.query('employeeId == $0 AND year == $1', [employeeId, y])
  }

  findByEmployeeAndType(employeeId: string, leaveTypeId: string, year?: number): LeaveBalance | null {
    const y = year ?? new Date().getFullYear()
    return this.first('employeeId == $0 AND leaveTypeId == $1 AND year == $2', [employeeId, leaveTypeId, y])
  }
}
