import { AuditAction, AuditOutcome } from '@/core/models/AuditLog'
import type { SalaryStructure, SalaryStructureInput } from '@/core/models/SalaryStructure'
import type { SalaryComponent, SalaryComponentInput } from '@/core/models/SalaryComponent'
import type { EmployeeSalary, EmployeeSalaryInput } from '@/core/models/EmployeeSalary'
import type { EmployeeSalaryItem } from '@/core/models/EmployeeSalaryItem'
import { AuditRepository } from '@/core/repositories/AuditRepository'
import { SalaryStructureRepository } from '@/core/repositories/SalaryStructureRepository'
import { SalaryComponentRepository } from '@/core/repositories/SalaryComponentRepository'
import { EmployeeSalaryRepository } from '@/core/repositories/EmployeeSalaryRepository'
import { EmployeeSalaryItemRepository } from '@/core/repositories/EmployeeSalaryItemRepository'
import type { FindOptions } from '@/core/repositories/BaseRepository'

export class SalaryStructureService {
  private readonly structureRepo = new SalaryStructureRepository()
  private readonly componentRepo = new SalaryComponentRepository()
  private readonly employeeSalaryRepo = new EmployeeSalaryRepository()
  private readonly salaryItemRepo = new EmployeeSalaryItemRepository()
  private readonly auditRepo = new AuditRepository()

  // ---- Structures ----

  findAllStructures(options: FindOptions = {}): SalaryStructure[] {
    return this.structureRepo.findAll(options)
  }

  findActiveStructures(): SalaryStructure[] {
    return this.structureRepo.findActive()
  }

  findDefaultStructure(): SalaryStructure | null {
    return this.structureRepo.findDefault()
  }

  findStructureById(id: string): SalaryStructure | null {
    return this.structureRepo.findById(id)
  }

  createStructure(input: SalaryStructureInput, actorUserId?: string, actorUsername?: string): SalaryStructure {
    const structure = this.structureRepo.create(input)
    this.auditRepo.create({
      action: AuditAction.Create,
      module: 'hr',
      resourceType: 'SalaryStructure',
      resourceId: structure._id,
      summary: `Salary structure "${structure.name}" created`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })
    return structure
  }

  updateStructure(id: string, changes: Partial<SalaryStructureInput>, actorUserId?: string, actorUsername?: string): SalaryStructure {
    const structure = this.structureRepo.update(id, changes)
    this.auditRepo.create({
      action: AuditAction.Update,
      module: 'hr',
      resourceType: 'SalaryStructure',
      resourceId: structure._id,
      summary: `Salary structure "${structure.name}" updated`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })
    return structure
  }

  archiveStructure(id: string, actorUserId?: string, actorUsername?: string): boolean {
    const structure = this.structureRepo.findById(id)
    const result = this.structureRepo.softDelete(id)
    if (result) {
      this.auditRepo.create({
        action: AuditAction.Delete,
        module: 'hr',
        resourceType: 'SalaryStructure',
        resourceId: id,
        summary: `Salary structure "${structure?.name ?? id}" archived`,
        outcome: AuditOutcome.Success,
        actorUserId,
        actorUsername,
      })
    }
    return result
  }

  restoreStructure(id: string, actorUserId?: string, actorUsername?: string): boolean {
    const result = this.structureRepo.restore(id)
    if (result) {
      this.auditRepo.create({
        action: AuditAction.Update,
        module: 'hr',
        resourceType: 'SalaryStructure',
        resourceId: id,
        summary: 'Salary structure restored',
        outcome: AuditOutcome.Success,
        actorUserId,
        actorUsername,
      })
    }
    return result
  }

  // ---- Components ----

  findComponentsByStructure(structureId: string): SalaryComponent[] {
    return this.componentRepo.findActiveByStructure(structureId)
  }

  findComponentById(id: string): SalaryComponent | null {
    return this.componentRepo.findById(id)
  }

  createComponent(input: SalaryComponentInput, actorUserId?: string, actorUsername?: string): SalaryComponent {
    const component = this.componentRepo.create(input)
    this.auditRepo.create({
      action: AuditAction.Create,
      module: 'hr',
      resourceType: 'SalaryComponent',
      resourceId: component._id,
      summary: `Salary component "${component.name}" created`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })
    return component
  }

  updateComponent(id: string, changes: Partial<SalaryComponentInput>, actorUserId?: string, actorUsername?: string): SalaryComponent {
    const component = this.componentRepo.update(id, changes)
    this.auditRepo.create({
      action: AuditAction.Update,
      module: 'hr',
      resourceType: 'SalaryComponent',
      resourceId: component._id,
      summary: `Salary component "${component.name}" updated`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })
    return component
  }

  archiveComponent(id: string, actorUserId?: string, actorUsername?: string): boolean {
    const component = this.componentRepo.findById(id)
    const result = this.componentRepo.softDelete(id)
    if (result) {
      this.auditRepo.create({
        action: AuditAction.Delete,
        module: 'hr',
        resourceType: 'SalaryComponent',
        resourceId: id,
        summary: `Salary component "${component?.name ?? id}" archived`,
        outcome: AuditOutcome.Success,
        actorUserId,
        actorUsername,
      })
    }
    return result
  }

  // ---- Employee Salaries ----

  findEmployeeSalary(employeeId: string): EmployeeSalary | null {
    return this.employeeSalaryRepo.findActiveByEmployee(employeeId)
  }

  findAllEmployeeSalaries(options: FindOptions = {}): EmployeeSalary[] {
    return this.employeeSalaryRepo.findAll(options)
  }

  createEmployeeSalary(
    input: EmployeeSalaryInput,
    componentAmounts: Array<{ componentId: string; amount: number }>,
    actorUserId?: string,
    actorUsername?: string,
  ): EmployeeSalary {
    const salary = this.employeeSalaryRepo.create(input)
    for (const ca of componentAmounts) {
      this.salaryItemRepo.create({
        employeeSalaryId: salary._id,
        componentId: ca.componentId,
        amount: ca.amount,
      })
    }
    this.auditRepo.create({
      action: AuditAction.Create,
      module: 'hr',
      resourceType: 'EmployeeSalary',
      resourceId: salary._id,
      summary: `Employee salary created for employee ${input.employeeId}`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })
    return salary
  }

  updateEmployeeSalary(
    id: string,
    changes: Partial<EmployeeSalaryInput>,
    componentAmounts: Array<{ componentId: string; amount: number }> | undefined,
    actorUserId?: string,
    actorUsername?: string,
  ): EmployeeSalary {
    const salary = this.employeeSalaryRepo.update(id, changes)
    if (componentAmounts) {
      this.salaryItemRepo.deleteByEmployeeSalary(id)
      for (const ca of componentAmounts) {
        this.salaryItemRepo.create({
          employeeSalaryId: id,
          componentId: ca.componentId,
          amount: ca.amount,
        })
      }
    }
    this.auditRepo.create({
      action: AuditAction.Update,
      module: 'hr',
      resourceType: 'EmployeeSalary',
      resourceId: salary._id,
      summary: `Employee salary ${id} updated`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })
    return salary
  }

  getSalaryItems(employeeSalaryId: string): EmployeeSalaryItem[] {
    return this.salaryItemRepo.findByEmployeeSalary(employeeSalaryId)
  }
}
