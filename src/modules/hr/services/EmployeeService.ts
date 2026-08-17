import { AuditAction, AuditOutcome } from '@/core/models/AuditLog'
import type { Employee, EmployeeInput, EmployeeStatusValue } from '@/core/models/Employee'
import { AuditRepository } from '@/core/repositories/AuditRepository'
import { EmployeeRepository } from '@/core/repositories/EmployeeRepository'
import type { FindOptions } from '@/core/repositories/BaseRepository'

export class EmployeeService {
  private readonly repo = new EmployeeRepository()
  private readonly auditRepo = new AuditRepository()

  findAll(options: FindOptions = {}): Employee[] {
    return this.repo.findAll(options)
  }

  findById(id: string): Employee | null {
    return this.repo.findById(id)
  }

  count(): number {
    return this.repo.count()
  }

  search(query: string): Employee[] {
    return this.repo.search(query)
  }

  findByDepartment(departmentId: string): Employee[] {
    return this.repo.findByDepartment(departmentId)
  }

  create(input: EmployeeInput, actorUserId?: string, actorUsername?: string): Employee {
    const employee = this.repo.create(input)
    this.auditRepo.create({
      action: AuditAction.Create,
      module: 'hr',
      resourceType: 'Employee',
      resourceId: employee._id,
      summary: `Employee "${employee.firstName} ${employee.lastName}" created`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })
    return employee
  }

  update(id: string, changes: Partial<EmployeeInput>, actorUserId?: string, actorUsername?: string): Employee {
    const employee = this.repo.update(id, changes)
    this.auditRepo.create({
      action: AuditAction.Update,
      module: 'hr',
      resourceType: 'Employee',
      resourceId: employee._id,
      summary: `Employee "${employee.firstName} ${employee.lastName}" updated`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })
    return employee
  }

  archive(id: string, actorUserId?: string, actorUsername?: string): boolean {
    const employee = this.repo.findById(id)
    const result = this.repo.softDelete(id)
    if (result) {
      this.auditRepo.create({
        action: AuditAction.Delete,
        module: 'hr',
        resourceType: 'Employee',
        resourceId: id,
        summary: `Employee "${employee?.firstName ?? id} ${employee?.lastName ?? ''}" archived`,
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
        resourceType: 'Employee',
        resourceId: id,
        summary: 'Employee restored',
        outcome: AuditOutcome.Success,
        actorUserId,
        actorUsername,
      })
    }
    return result
  }

  updateStatus(id: string, status: EmployeeStatusValue, actorUserId?: string, actorUsername?: string): Employee {
    const employee = this.repo.update(id, { status })
    this.auditRepo.create({
      action: AuditAction.Update,
      module: 'hr',
      resourceType: 'Employee',
      resourceId: employee._id,
      summary: `Employee "${employee.firstName} ${employee.lastName}" status changed to ${status}`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })
    return employee
  }
}
