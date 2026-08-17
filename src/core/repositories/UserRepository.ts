/**
 * UserRepository — persistence for {@link User} accounts.
 */

import { User, UserStatus, type UserInput } from '../models/User'
import {
  combineValidators,
  email,
  maxLength,
  minLength,
  required,
  validateFields,
  type ValidationIssue,
} from '../utils/validation'
import { BaseRepository, type FindOptions, type ModelConstructor } from './BaseRepository'

export interface LoginTrackingFields {
  lastLoginAt?: Date
}

export class UserRepository extends BaseRepository<User, UserInput> {
  protected get objectType(): string {
    return 'User'
  }

  protected get modelClass(): ModelConstructor<User> {
    return User
  }

  protected validateCreate(values: Record<string, unknown>): ValidationIssue[] {
    const issues = validateFields(values, {
      username: combineValidators(
        required('Username'),
        minLength('Username', 3),
        maxLength('Username', 64),
      ),
      email: email('Email'),
      passwordHash: required('Password hash'),
      fullName: required('Full name'),
    })
    if (
      typeof values['username'] === 'string' &&
      this.existsByField('username', values['username'])
    ) {
      issues.push({ field: 'username', message: 'Username is already in use.' })
    }
    if (typeof values['email'] === 'string' && this.existsByField('email', values['email'])) {
      issues.push({ field: 'email', message: 'Email is already in use.' })
    }
    return issues
  }

  protected validateUpdate(values: Record<string, unknown>): ValidationIssue[] {
    const issues = validateFields(values, {
      username:
        values['username'] !== undefined
          ? combineValidators(minLength('Username', 3), maxLength('Username', 64))
          : undefined,
      email: values['email'] !== undefined ? email('Email') : undefined,
      fullName: values['fullName'] !== undefined ? required('Full name') : undefined,
    })
    const exceptId = typeof values['_id'] === 'string' ? values['_id'] : undefined
    if (
      typeof values['username'] === 'string' &&
      this.existsByField('username', values['username'], exceptId)
    ) {
      issues.push({ field: 'username', message: 'Username is already in use.' })
    }
    if (
      typeof values['email'] === 'string' &&
      this.existsByField('email', values['email'], exceptId)
    ) {
      issues.push({ field: 'email', message: 'Email is already in use.' })
    }
    return issues
  }

  private existsByField(field: 'username' | 'email', value: string, exceptId?: string): boolean {
    const results = this.getRealm().objects(User).filtered(`${field} == $0`, value)
    for (const candidate of results) {
      if (candidate._id !== exceptId && !this.isSoftDeleted(candidate)) return true
    }
    return false
  }

  findByUsername(username: string, options: FindOptions = {}): User | null {
    return this.first('username == $0', [username], options)
  }

  findByEmail(emailAddress: string, options: FindOptions = {}): User | null {
    return this.first('email == $0', [emailAddress], options)
  }

  findByRoleId(roleId: string, options: FindOptions = {}): User[] {
    return this.query('role._id == $0', [roleId], options)
  }

  findByOrganizationId(organizationId: string, options: FindOptions = {}): User[] {
    return this.query('organization._id == $0', [organizationId], options)
  }

  findByBranchId(branchId: string, options: FindOptions = {}): User[] {
    return this.query('branch._id == $0', [branchId], options)
  }

  findByDepartmentId(departmentId: string, options: FindOptions = {}): User[] {
    return this.query('department._id == $0', [departmentId], options)
  }

  findByStatus(status: UserInput['status'], options: FindOptions = {}): User[] {
    return this.query('status == $0', [status], options)
  }

  /** Count of active, non-deleted users. */
  countActive(): number {
    return this.countQuery('status == $0', [UserStatus.Active])
  }

  /** Records a successful login by updating `lastLoginAt`. */
  recordLogin(userId: string, at: Date = new Date()): User {
    return this.update(userId, { lastLoginAt: at })
  }

  /** Sets a new password hash and clears the change-password flag. */
  changePassword(userId: string, passwordHash: string): User {
    return this.update(userId, { passwordHash, mustChangePassword: false })
  }
}
