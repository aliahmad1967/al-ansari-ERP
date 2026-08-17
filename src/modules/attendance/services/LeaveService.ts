import { AuditAction, AuditOutcome } from '@/core/models/AuditLog'
import { AuditRepository } from '@/core/repositories/AuditRepository'
import { LeaveTypeRepository } from '@/core/repositories/LeaveTypeRepository'
import { LeaveBalanceRepository } from '@/core/repositories/LeaveBalanceRepository'
import { LeaveRequestRepository } from '@/core/repositories/LeaveRequestRepository'
import { LeaveApprovalRepository } from '@/core/repositories/LeaveApprovalRepository'
import type { LeaveTypeInput } from '@/core/models/LeaveType'
import type { LeaveRequestInput, LeaveRequestStatusValue } from '@/core/models/LeaveRequest'
import type { ApprovalLevelValue } from '@/core/models/ApprovalLevel'
import type { FindOptions } from '@/core/repositories/BaseRepository'

export class LeaveService {
  private readonly typeRepo = new LeaveTypeRepository()
  private readonly balanceRepo = new LeaveBalanceRepository()
  private readonly requestRepo = new LeaveRequestRepository()
  private readonly approvalRepo = new LeaveApprovalRepository()
  private readonly auditRepo = new AuditRepository()

  findAllTypes() { return this.typeRepo.findAll() }
  findActiveTypes() { return this.typeRepo.findActive() }
  findBalances(employeeId: string) { return this.balanceRepo.findByEmployee(employeeId) }
  findAllRequests(options: FindOptions = {}) { return this.requestRepo.findAll(options) }
  findRequestsByEmployee(employeeId: string) { return this.requestRepo.findByEmployee(employeeId) }
  findPendingRequests() { return this.requestRepo.findPending() }
  findApprovals(requestId: string) { return this.approvalRepo.findByLeaveRequest(requestId) }

  createType(input: LeaveTypeInput, actorUserId?: string, actorUsername?: string) {
    const lt = this.typeRepo.create(input)
    this.auditRepo.create({
      action: AuditAction.Create, module: 'hr', resourceType: 'LeaveType',
      resourceId: lt._id, summary: `Leave type "${input.name}" created`,
      outcome: AuditOutcome.Success, actorUserId, actorUsername,
    })
    return lt
  }

  createRequest(input: LeaveRequestInput, actorUserId?: string, actorUsername?: string) {
    const req = this.requestRepo.create({ ...input, status: 'pending_manager' as LeaveRequestStatusValue })
    this.auditRepo.create({
      action: AuditAction.Create, module: 'hr', resourceType: 'LeaveRequest',
      resourceId: req._id, summary: `Leave request created for employee ${input.employeeId}`,
      outcome: AuditOutcome.Success, actorUserId, actorUsername,
    })
    return req
  }

  approveRequest(requestId: string, level: ApprovalLevelValue, approverUserId: string, approverUsername: string, comment?: string) {
    const req = this.requestRepo.findById(requestId)
    if (!req) throw new Error('Leave request not found')

    this.approvalRepo.create({
      leaveRequestId: requestId, level, action: 'approve', approverUserId,
      approverUsername, comment,
    } as never)

    const newStatus: LeaveRequestStatusValue = level === 'manager' ? 'pending_hr' : 'approved'
    const updated = this.requestRepo.update(requestId, { status: newStatus } as Partial<LeaveRequestInput>)

    if (level === 'hr') {
      const balance = this.balanceRepo.findByEmployeeAndType(req.employeeId, req.leaveTypeId)
      if (balance) {
        this.balanceRepo.update(balance._id, { usedDays: balance.usedDays + req.totalDays } as never)
      }
    }

    this.auditRepo.create({
      action: AuditAction.Approve, module: 'hr', resourceType: 'LeaveRequest',
      resourceId: requestId, summary: `Leave request ${level}-approved by ${approverUsername}`,
      outcome: AuditOutcome.Success, actorUserId: approverUserId, actorUsername: approverUsername,
    })
    return updated
  }

  rejectRequest(requestId: string, level: ApprovalLevelValue, approverUserId: string, approverUsername: string, reason: string) {
    this.approvalRepo.create({
      leaveRequestId: requestId, level, action: 'reject', approverUserId,
      approverUsername, comment: reason,
    } as never)

    const updated = this.requestRepo.update(requestId, { status: 'rejected' as LeaveRequestStatusValue, rejectionReason: reason } as Partial<LeaveRequestInput>)

    this.auditRepo.create({
      action: AuditAction.Reject, module: 'hr', resourceType: 'LeaveRequest',
      resourceId: requestId, summary: `Leave request ${level}-rejected by ${approverUsername}: ${reason}`,
      outcome: AuditOutcome.Success, actorUserId: approverUserId, actorUsername: approverUsername,
    })
    return updated
  }

  cancelRequest(requestId: string, actorUserId?: string, actorUsername?: string) {
    const updated = this.requestRepo.update(requestId, { status: 'cancelled' as LeaveRequestStatusValue } as Partial<LeaveRequestInput>)
    this.auditRepo.create({
      action: AuditAction.Cancel, module: 'hr', resourceType: 'LeaveRequest',
      resourceId: requestId, summary: `Leave request cancelled`,
      outcome: AuditOutcome.Success, actorUserId, actorUsername,
    })
    return updated
  }
}
