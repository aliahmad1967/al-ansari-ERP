import { LeaveApproval, type LeaveApprovalInput } from '../models/LeaveApproval'
import { BaseRepository, type ModelConstructor } from './BaseRepository'

export class LeaveApprovalRepository extends BaseRepository<LeaveApproval, LeaveApprovalInput> {
  protected get objectType(): string {
    return 'LeaveApproval'
  }

  protected get modelClass(): ModelConstructor<LeaveApproval> {
    return LeaveApproval
  }

  findByLeaveRequest(leaveRequestId: string): LeaveApproval[] {
    return this.query('leaveRequestId == $0', [leaveRequestId])
  }

  findLatestByLeaveRequest(leaveRequestId: string): LeaveApproval | null {
    const realm = this.getRealm()
    const results = realm.objects(this.modelClass)
      .filtered('leaveRequestId == $0', leaveRequestId)
      .sorted('createdAt', true)
    return results[0] ?? null
  }
}
