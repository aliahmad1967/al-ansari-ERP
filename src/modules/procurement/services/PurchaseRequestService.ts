import { AuditAction, AuditOutcome } from '@/core/models/AuditLog'
import type { PurchaseRequest, PurchaseRequestInput, PurchaseRequestStatusValue } from '@/core/models/PurchaseRequest'
import { PurchaseRequestStatus } from '@/core/models/PurchaseRequest'
import { PurchaseRequestRepository } from '@/core/repositories/PurchaseRequestRepository'
import { PurchaseRequestItemRepository } from '@/core/repositories/PurchaseRequestItemRepository'
import { AuditRepository } from '@/core/repositories/AuditRepository'
import type { FindOptions } from '@/core/repositories/BaseRepository'

export class PurchaseRequestService {
  private readonly requestRepo = new PurchaseRequestRepository()
  private readonly itemRepo = new PurchaseRequestItemRepository()
  private readonly auditRepo = new AuditRepository()

  findAllRequests(options: FindOptions = {}): PurchaseRequest[] {
    return this.requestRepo.findAll(options)
  }

  findRequestById(id: string): PurchaseRequest | null {
    return this.requestRepo.findById(id)
  }

  findRequestsByStatus(status: PurchaseRequestStatusValue): PurchaseRequest[] {
    return this.requestRepo.findByStatus(status)
  }

  findPendingRequests(): PurchaseRequest[] {
    return this.requestRepo.findByStatus(PurchaseRequestStatus.PendingApproval)
  }

  createRequest(
    input: PurchaseRequestInput,
    items: Array<{ productId: string; quantity: number; unitPrice: number }>,
    actorUserId?: string,
    actorUsername?: string,
  ): PurchaseRequest {
    const request = this.requestRepo.create(input)

    let totalEstimatedCost = 0
    for (const item of items) {
      const itemCost = item.quantity * item.unitPrice
      totalEstimatedCost += itemCost
      this.itemRepo.create({
        purchaseRequestId: request._id,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalEstimatedCost: itemCost,
      })
    }

    this.requestRepo.update(request._id, { totalEstimatedCost })

    this.auditRepo.create({
      action: AuditAction.Create,
      module: 'procurement',
      resourceType: 'PurchaseRequest',
      resourceId: request._id,
      summary: `Purchase request "${request.code}" created with ${items.length} items`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })

    return this.requestRepo.findById(request._id)!
  }

  approveRequest(id: string, approverUserId: string, approverUsername: string): PurchaseRequest {
    const request = this.requestRepo.findById(id)
    if (!request) {
      throw new Error(`Purchase request ${id} not found`)
    }
    if (request.status !== PurchaseRequestStatus.PendingApproval) {
      throw new Error(`Cannot approve request in status "${request.status}"`)
    }

    const updated = this.requestRepo.update(id, {
      status: PurchaseRequestStatus.Approved,
      approvedByUserId: approverUserId,
      approvedAt: new Date(),
    })

    this.auditRepo.create({
      action: AuditAction.Approve,
      module: 'procurement',
      resourceType: 'PurchaseRequest',
      resourceId: id,
      summary: `Purchase request "${request.code}" approved`,
      outcome: AuditOutcome.Success,
      actorUserId: approverUserId,
      actorUsername: approverUsername,
    })

    return updated
  }

  rejectRequest(id: string, reason: string, userId: string, username: string): PurchaseRequest {
    const request = this.requestRepo.findById(id)
    if (!request) {
      throw new Error(`Purchase request ${id} not found`)
    }
    if (request.status !== PurchaseRequestStatus.PendingApproval) {
      throw new Error(`Cannot reject request in status "${request.status}"`)
    }

    const updated = this.requestRepo.update(id, {
      status: PurchaseRequestStatus.Rejected,
      rejectionReason: reason,
    })

    this.auditRepo.create({
      action: AuditAction.Reject,
      module: 'procurement',
      resourceType: 'PurchaseRequest',
      resourceId: id,
      summary: `Purchase request "${request.code}" rejected: ${reason}`,
      outcome: AuditOutcome.Success,
      actorUserId: userId,
      actorUsername: username,
    })

    return updated
  }

  cancelRequest(id: string, actorUserId?: string, actorUsername?: string): PurchaseRequest {
    const request = this.requestRepo.findById(id)
    if (!request) {
      throw new Error(`Purchase request ${id} not found`)
    }

    const updated = this.requestRepo.update(id, {
      status: PurchaseRequestStatus.Cancelled,
    })

    this.auditRepo.create({
      action: AuditAction.Update,
      module: 'procurement',
      resourceType: 'PurchaseRequest',
      resourceId: id,
      summary: `Purchase request "${request.code}" cancelled`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })

    return updated
  }
}
