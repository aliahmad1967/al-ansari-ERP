/**
 * Model barrel — single source of truth for the Realm schema.
 */

import type Realm from 'realm'

import type { AuditLog } from './AuditLog'
import type { Branch } from './Branch'
import type { Department } from './Department'
import type { Notification } from './Notification'
import type { Organization } from './Organization'
import type { Permission } from './Permission'
import type { Role } from './Role'
import type { User } from './User'

import { AuditLog as AuditLogModel } from './AuditLog'
import { Branch as BranchModel } from './Branch'
import { Department as DepartmentModel } from './Department'
import { Notification as NotificationModel } from './Notification'
import { Organization as OrganizationModel } from './Organization'
import { Permission as PermissionModel } from './Permission'
import { Role as RoleModel } from './Role'
import { User as UserModel } from './User'

export {
  AuditLogModel,
  BranchModel,
  DepartmentModel,
  NotificationModel,
  OrganizationModel,
  PermissionModel,
  RoleModel,
  UserModel,
}

export type { AuditLog, Branch, Department, Notification, Organization, Permission, Role, User }

export { AuditAction, AuditOutcome } from './AuditLog'
export type { AuditActionValue, AuditLogInput, AuditLogEntity, AuditOutcomeValue } from './AuditLog'
export { BranchStatus } from './Branch'
export type { BranchInput, BranchEntity, BranchStatusValue } from './Branch'
export { DepartmentStatus } from './Department'
export type { DepartmentInput, DepartmentEntity, DepartmentStatusValue } from './Department'
export { NotificationType } from './Notification'
export type { NotificationInput, NotificationEntity, NotificationTypeValue } from './Notification'
export { OrganizationStatus } from './Organization'
export type { OrganizationInput, OrganizationEntity, OrganizationStatusValue } from './Organization'
export { buildPermissionCode } from './Permission'
export type { PermissionInput, PermissionEntity } from './Permission'
export { SystemRoleCode } from './Role'
export type { RoleInput, RoleEntity } from './Role'
export { UserStatus } from './User'
export type { UserInput, UserEntity, UserStatusValue } from './User'
export * from './base'

/** The ordered list of Realm schemas installed in the database. */
export const MODEL_SCHEMAS: Realm.ObjectSchema[] = [
  OrganizationModel.schema,
  BranchModel.schema,
  DepartmentModel.schema,
  PermissionModel.schema,
  RoleModel.schema,
  UserModel.schema,
  AuditLogModel.schema,
  NotificationModel.schema,
]

/**
 * The model classes installed in the database. Passed to `Realm.Configuration`
 * so each class constructor is registered with its schema — this is what
 * enables typed `realm.objects(SomeClass)` / `realm.create(SomeClass, ...)`.
 */
export const MODEL_CLASSES: Realm.RealmObjectConstructor<Realm.AnyRealmObject>[] = [
  OrganizationModel,
  BranchModel,
  DepartmentModel,
  PermissionModel,
  RoleModel,
  UserModel,
  AuditLogModel,
  NotificationModel,
]
