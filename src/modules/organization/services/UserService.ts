/**
 * UserService — business-layer facade for user management.
 */

import { AuditAction, AuditOutcome } from '@/core/models/AuditLog'
import type { User, UserInput, UserStatusValue } from '@/core/models/User'
import { AuditRepository } from '@/core/repositories/AuditRepository'
import { UserRepository } from '@/core/repositories/UserRepository'
import type { FindOptions } from '@/core/repositories/BaseRepository'
import { hashPassword } from '@/core/security/encryption'

export class UserService {
  private readonly repo = new UserRepository()
  private readonly auditRepo = new AuditRepository()

  findAll(options: FindOptions = {}): User[] {
    return this.repo.findAll(options)
  }

  findById(id: string): User | null {
    return this.repo.findById(id)
  }

  findByUsername(username: string): User | null {
    return this.repo.findByUsername(username)
  }

  count(): number {
    return this.repo.count()
  }

  countActive(): number {
    return this.repo.countActive()
  }

  create(
    input: UserInput & { password?: string },
    actorUserId?: string,
    actorUsername?: string,
  ): User {
    const passwordHash = input.password
      ? hashPassword(input.password)
      : input.passwordHash
    const user = this.repo.create({ ...input, passwordHash })
    this.auditRepo.create({
      action: AuditAction.Create,
      module: 'organization',
      resourceType: 'User',
      resourceId: user._id,
      summary: `User "${user.username}" created`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })
    return user
  }

  update(id: string, changes: Partial<UserInput>, actorUserId?: string, actorUsername?: string): User {
    const user = this.repo.update(id, changes)
    this.auditRepo.create({
      action: AuditAction.Update,
      module: 'organization',
      resourceType: 'User',
      resourceId: user._id,
      summary: `User "${user.username}" updated`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })
    return user
  }

  archive(id: string, actorUserId?: string, actorUsername?: string): boolean {
    const user = this.repo.findById(id)
    const result = this.repo.softDelete(id)
    if (result) {
      this.auditRepo.create({
        action: AuditAction.Delete,
        module: 'organization',
        resourceType: 'User',
        resourceId: id,
        summary: `User "${user?.username ?? id}" deactivated`,
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
        module: 'organization',
        resourceType: 'User',
        resourceId: id,
        summary: 'User restored',
        outcome: AuditOutcome.Success,
        actorUserId,
        actorUsername,
      })
    }
    return result
  }

  updateStatus(id: string, status: UserStatusValue, actorUserId?: string, actorUsername?: string): User {
    const user = this.repo.update(id, { status })
    this.auditRepo.create({
      action: AuditAction.Update,
      module: 'organization',
      resourceType: 'User',
      resourceId: user._id,
      summary: `User "${user.username}" status changed to ${status}`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })
    return user
  }
}
