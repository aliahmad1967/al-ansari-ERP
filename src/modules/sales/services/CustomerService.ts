import { AuditAction, AuditOutcome } from '@/core/models/AuditLog'
import type { Customer, CustomerInput } from '@/core/models/Customer'
import { CustomerRepository } from '@/core/repositories/CustomerRepository'
import { AuditRepository } from '@/core/repositories/AuditRepository'
import type { FindOptions } from '@/core/repositories/BaseRepository'

export class CustomerService {
  private readonly customerRepo = new CustomerRepository()
  private readonly auditRepo = new AuditRepository()

  findAllCustomers(options: FindOptions = {}): Customer[] {
    return this.customerRepo.findAll(options)
  }

  findCustomerById(id: string): Customer | null {
    return this.customerRepo.findById(id)
  }

  findActiveCustomers(): Customer[] {
    return this.customerRepo.findActive()
  }

  findCustomerByCode(code: string): Customer | null {
    return this.customerRepo.findByCode(code)
  }

  searchCustomers(query: string): Customer[] {
    return this.customerRepo.search(query)
  }

  createCustomer(
    input: CustomerInput,
    actorUserId?: string,
    actorUsername?: string,
  ): Customer {
    const customer = this.customerRepo.create(input)
    this.auditRepo.create({
      action: AuditAction.Create,
      module: 'sales',
      resourceType: 'Customer',
      resourceId: customer._id,
      summary: `Customer "${customer.name}" created`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })
    return customer
  }

  updateCustomer(
    id: string,
    changes: Partial<CustomerInput>,
    actorUserId?: string,
    actorUsername?: string,
  ): Customer {
    const customer = this.customerRepo.update(id, changes)
    this.auditRepo.create({
      action: AuditAction.Update,
      module: 'sales',
      resourceType: 'Customer',
      resourceId: customer._id,
      summary: `Customer "${customer.name}" updated`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })
    return customer
  }

  archiveCustomer(id: string, actorUserId?: string, actorUsername?: string): boolean {
    const customer = this.customerRepo.findById(id)
    const result = this.customerRepo.softDelete(id)
    if (result) {
      this.auditRepo.create({
        action: AuditAction.Delete,
        module: 'sales',
        resourceType: 'Customer',
        resourceId: id,
        summary: `Customer "${customer?.name ?? id}" archived`,
        outcome: AuditOutcome.Success,
        actorUserId,
        actorUsername,
      })
    }
    return result
  }

  restoreCustomer(id: string, actorUserId?: string, actorUsername?: string): boolean {
    const result = this.customerRepo.restore(id)
    if (result) {
      this.auditRepo.create({
        action: AuditAction.Update,
        module: 'sales',
        resourceType: 'Customer',
        resourceId: id,
        summary: 'Customer restored',
        outcome: AuditOutcome.Success,
        actorUserId,
        actorUsername,
      })
    }
    return result
  }

  adjustBalance(customerId: string, amount: number): void {
    this.customerRepo.updateBalance(customerId, amount)
  }
}
