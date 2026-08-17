import { LeaveRequest, type LeaveRequestInput } from '../models/LeaveRequest'
import { BaseRepository, type ModelConstructor } from './BaseRepository'

export class LeaveRequestRepository extends BaseRepository<LeaveRequest, LeaveRequestInput> {
  protected get objectType(): string {
    return 'LeaveRequest'
  }

  protected get modelClass(): ModelConstructor<LeaveRequest> {
    return LeaveRequest
  }

  findByEmployee(employeeId: string): LeaveRequest[] {
    return this.query('employeeId == $0', [employeeId])
  }

  findByStatus(status: string): LeaveRequest[] {
    return this.query('status == $0', [status])
  }

  findPending(): LeaveRequest[] {
    return this.query("status == 'pending_manager' OR status == 'pending_hr'", [])
  }

  findPendingManager(): LeaveRequest[] {
    return this.query("status == 'pending_manager'", [])
  }

  findPendingHr(): LeaveRequest[] {
    return this.query("status == 'pending_hr'", [])
  }

  findByDateRange(startDate: Date, endDate: Date): LeaveRequest[] {
    return this.query('startDate <= $0 AND endDate >= $1', [startDate, endDate])
  }
}
