import { AuditAction, AuditOutcome } from '@/core/models/AuditLog'
import type { EmploymentContract, EmploymentContractInput } from '@/core/models/EmploymentContract'
import { AuditRepository } from '@/core/repositories/AuditRepository'
import { EmploymentContractRepository } from '@/core/repositories/EmploymentContractRepository'
import type { FindOptions } from '@/core/repositories/BaseRepository'

export class ContractService {
  private readonly repo = new EmploymentContractRepository()
  private readonly auditRepo = new AuditRepository()

  findAll(options: FindOptions = {}): EmploymentContract[] {
    return this.repo.findAll(options)
  }

  findById(id: string): EmploymentContract | null {
    return this.repo.findById(id)
  }

  findByEmployee(employeeId: string): EmploymentContract[] {
    return this.repo.findByEmployee(employeeId)
  }

  count(): number {
    return this.repo.count()
  }

  create(input: EmploymentContractInput, actorUserId?: string, actorUsername?: string): EmploymentContract {
    const contract = this.repo.create(input)
    this.auditRepo.create({
      action: AuditAction.Create,
      module: 'hr',
      resourceType: 'EmploymentContract',
      resourceId: contract._id,
      summary: `Contract "${contract.contractNumber}" created`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })
    return contract
  }

  update(id: string, changes: Partial<EmploymentContractInput>, actorUserId?: string, actorUsername?: string): EmploymentContract {
    const contract = this.repo.update(id, changes)
    this.auditRepo.create({
      action: AuditAction.Update,
      module: 'hr',
      resourceType: 'EmploymentContract',
      resourceId: contract._id,
      summary: `Contract "${contract.contractNumber}" updated`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })
    return contract
  }

  archive(id: string, actorUserId?: string, actorUsername?: string): boolean {
    const contract = this.repo.findById(id)
    const result = this.repo.softDelete(id)
    if (result) {
      this.auditRepo.create({
        action: AuditAction.Delete,
        module: 'hr',
        resourceType: 'EmploymentContract',
        resourceId: id,
        summary: `Contract "${contract?.contractNumber ?? id}" archived`,
        outcome: AuditOutcome.Success,
        actorUserId,
        actorUsername,
      })
    }
    return result
  }

  restore(id: string, actorUserId?: string, actorUsername?: string): boolean {
    const result = this.repo.restore(id)
    if (result) {
      this.auditRepo.create({
        action: AuditAction.Update,
        module: 'hr',
        resourceType: 'EmploymentContract',
        resourceId: id,
        summary: 'Contract restored',
        outcome: AuditOutcome.Success,
        actorUserId,
        actorUsername,
      })
    }
    return result
  }
}
