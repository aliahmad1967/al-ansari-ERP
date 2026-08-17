/**
 * Model barrel — single source of truth for the Realm schema.
 */

import type Realm from 'realm'

import type { AuditLog } from './AuditLog'
import type { AttendanceRecord } from './AttendanceRecord'
import type { Branch } from './Branch'
import type { Department } from './Department'
import type { Education } from './Education'
import type { Employee } from './Employee'
import type { EmployeeDocument } from './EmployeeDocument'
import type { EmergencyContact } from './EmergencyContact'
import type { EmployeeSalary } from './EmployeeSalary'
import type { EmployeeSalaryItem } from './EmployeeSalaryItem'
import type { EmploymentContract } from './EmploymentContract'
import type { Experience } from './Experience'
import type { LeaveApproval } from './LeaveApproval'
import type { LeaveBalance } from './LeaveBalance'
import type { LeaveRequest } from './LeaveRequest'
import type { LeaveType } from './LeaveType'
import type { Notification } from './Notification'
import type { Organization } from './Organization'
import type { PayrollItem } from './PayrollItem'
import type { PayrollLineItem } from './PayrollLineItem'
import type { PayrollPeriod } from './PayrollPeriod'
import type { PayrollRun } from './PayrollRun'
import type { Permission } from './Permission'
import type { Position } from './Position'
import type { Role } from './Role'
import type { SalaryComponent } from './SalaryComponent'
import type { SalaryStructure } from './SalaryStructure'
import type { Payslip } from './Payslip'
import type { Shift } from './Shift'
import type { Skill } from './Skill'
import type { User } from './User'

import { AuditLog as AuditLogModel } from './AuditLog'
import { AttendanceRecord as AttendanceRecordModel } from './AttendanceRecord'
import { Branch as BranchModel } from './Branch'
import { Department as DepartmentModel } from './Department'
import { Education as EducationModel } from './Education'
import { Employee as EmployeeModel } from './Employee'
import { EmployeeDocument as EmployeeDocumentModel } from './EmployeeDocument'
import { EmergencyContact as EmergencyContactModel } from './EmergencyContact'
import { EmployeeSalary as EmployeeSalaryModel } from './EmployeeSalary'
import { EmployeeSalaryItem as EmployeeSalaryItemModel } from './EmployeeSalaryItem'
import { EmploymentContract as EmploymentContractModel } from './EmploymentContract'
import { Experience as ExperienceModel } from './Experience'
import { LeaveApproval as LeaveApprovalModel } from './LeaveApproval'
import { LeaveBalance as LeaveBalanceModel } from './LeaveBalance'
import { LeaveRequest as LeaveRequestModel } from './LeaveRequest'
import { LeaveType as LeaveTypeModel } from './LeaveType'
import { Notification as NotificationModel } from './Notification'
import { Organization as OrganizationModel } from './Organization'
import { PayrollItem as PayrollItemModel } from './PayrollItem'
import { PayrollLineItem as PayrollLineItemModel } from './PayrollLineItem'
import { PayrollPeriod as PayrollPeriodModel } from './PayrollPeriod'
import { PayrollRun as PayrollRunModel } from './PayrollRun'
import { Permission as PermissionModel } from './Permission'
import { Position as PositionModel } from './Position'
import { Role as RoleModel } from './Role'
import { SalaryComponent as SalaryComponentModel } from './SalaryComponent'
import { SalaryStructure as SalaryStructureModel } from './SalaryStructure'
import { Payslip as PayslipModel } from './Payslip'
import { Shift as ShiftModel } from './Shift'
import { Skill as SkillModel } from './Skill'
import { User as UserModel } from './User'

export {
  AuditLogModel,
  AttendanceRecordModel,
  BranchModel,
  DepartmentModel,
  EducationModel,
  EmployeeModel,
  EmployeeDocumentModel,
  EmergencyContactModel,
  EmployeeSalaryModel,
  EmployeeSalaryItemModel,
  EmploymentContractModel,
  ExperienceModel,
  LeaveApprovalModel,
  LeaveBalanceModel,
  LeaveRequestModel,
  LeaveTypeModel,
  NotificationModel,
  OrganizationModel,
  PayrollItemModel,
  PayrollLineItemModel,
  PayrollPeriodModel,
  PayrollRunModel,
  PermissionModel,
  PositionModel,
  RoleModel,
  SalaryComponentModel,
  SalaryStructureModel,
  PayslipModel,
  ShiftModel,
  SkillModel,
  UserModel,
}

export type {
  AuditLog,
  AttendanceRecord,
  Branch,
  Department,
  Education,
  Employee,
  EmployeeDocument,
  EmergencyContact,
  EmployeeSalary,
  EmployeeSalaryItem,
  EmploymentContract,
  Experience,
  LeaveApproval,
  LeaveBalance,
  LeaveRequest,
  LeaveType,
  Notification,
  Organization,
  PayrollItem,
  PayrollLineItem,
  PayrollPeriod,
  PayrollRun,
  Permission,
  Position,
  Role,
  SalaryComponent,
  SalaryStructure,
  Payslip,
  Shift,
  Skill,
  User,
}

export { AuditAction, AuditOutcome } from './AuditLog'
export type { AuditActionValue, AuditLogInput, AuditLogEntity, AuditOutcomeValue } from './AuditLog'
export { AttendanceStatus, CheckInOutSource } from './AttendanceRecord'
export type { AttendanceRecordInput, AttendanceRecordEntity, AttendanceStatusValue, CheckInOutSourceValue } from './AttendanceRecord'
export { BranchStatus } from './Branch'
export type { BranchInput, BranchEntity, BranchStatusValue } from './Branch'
export { ContractStatus } from './ContractStatus'
export type { ContractStatusValue } from './ContractStatus'
export { ContractType } from './ContractType'
export type { ContractTypeValue } from './ContractType'
export { DepartmentStatus } from './Department'
export type { DepartmentInput, DepartmentEntity, DepartmentStatusValue } from './Department'
export { EmployeeStatus } from './EmployeeStatus'
export type { EmployeeInput, EmployeeStatusValue } from './EmployeeStatus'
export type { EmployeeEntity } from './Employee'
export { EmployeeSalaryStatus } from './EmployeeSalary'
export type { EmployeeSalaryInput, EmployeeSalaryEntity, EmployeeSalaryStatusValue } from './EmployeeSalary'
export type { EmployeeSalaryItemInput, EmployeeSalaryItemEntity } from './EmployeeSalaryItem'
export type { EducationInput, EducationEntity } from './Education'
export type { EmployeeDocumentInput, EmployeeDocumentEntity } from './EmployeeDocument'
export type { EmergencyContactInput, EmergencyContactEntity } from './EmergencyContact'
export type { EmploymentContractInput, EmploymentContractEntity } from './EmploymentContract'
export type { ExperienceInput, ExperienceEntity } from './Experience'
export { SkillLevel } from './Skill'
export type { SkillInput, SkillEntity, SkillLevelValue } from './Skill'
export { ApprovalLevel, ApprovalAction } from './LeaveApproval'
export type { LeaveApprovalInput, LeaveApprovalEntity, ApprovalLevelValue, ApprovalActionValue } from './LeaveApproval'
export type { LeaveBalanceInput, LeaveBalanceEntity } from './LeaveBalance'
export { LeaveRequestStatus } from './LeaveRequest'
export type { LeaveRequestInput, LeaveRequestEntity, LeaveRequestStatusValue } from './LeaveRequest'
export type { LeaveTypeInput, LeaveTypeEntity } from './LeaveType'
export { NotificationType } from './Notification'
export type { NotificationInput, NotificationEntity, NotificationTypeValue } from './Notification'
export { OrganizationStatus } from './Organization'
export type { OrganizationInput, OrganizationEntity, OrganizationStatusValue } from './Organization'
export { PayrollItemStatus } from './PayrollItem'
export type { PayrollItemInput, PayrollItemEntity, PayrollItemStatusValue } from './PayrollItem'
export type { PayrollLineItemInput, PayrollLineItemEntity } from './PayrollLineItem'
export { PayrollPeriodStatus } from './PayrollPeriod'
export type { PayrollPeriodInput, PayrollPeriodEntity, PayrollPeriodStatusValue } from './PayrollPeriod'
export { PayrollRunStatus } from './PayrollRun'
export type { PayrollRunInput, PayrollRunEntity, PayrollRunStatusValue } from './PayrollRun'
export { buildPermissionCode } from './Permission'
export type { PermissionInput, PermissionEntity } from './Permission'
export { PositionStatus } from './Position'
export type { PositionInput, PositionEntity, PositionStatusValue } from './Position'
export { PayslipStatus } from './Payslip'
export type { PayslipInput, PayslipEntity, PayslipStatusValue } from './Payslip'
export { SystemRoleCode } from './Role'
export type { RoleInput, RoleEntity } from './Role'
export { SalaryComponentType, SalaryComponentCalculation, SalaryComponentPercentageBase } from './SalaryComponent'
export type {
  SalaryComponentInput,
  SalaryComponentEntity,
  SalaryComponentTypeValue,
  SalaryComponentCalculationValue,
  SalaryComponentPercentageBaseValue,
} from './SalaryComponent'
export type { SalaryStructureInput, SalaryStructureEntity } from './SalaryStructure'
export type { ShiftInput, ShiftEntity } from './Shift'
export { UserStatus } from './User'
export type { UserInput, UserEntity, UserStatusValue } from './User'
export * from './base'

/** The ordered list of Realm schemas installed in the database. */
export const MODEL_SCHEMAS: Realm.ObjectSchema[] = [
  OrganizationModel.schema,
  BranchModel.schema,
  DepartmentModel.schema,
  PositionModel.schema,
  PermissionModel.schema,
  RoleModel.schema,
  UserModel.schema,
  AuditLogModel.schema,
  NotificationModel.schema,
  EmployeeModel.schema,
  EmploymentContractModel.schema,
  EmployeeDocumentModel.schema,
  EmergencyContactModel.schema,
  EducationModel.schema,
  ExperienceModel.schema,
  SkillModel.schema,
  ShiftModel.schema,
  AttendanceRecordModel.schema,
  LeaveTypeModel.schema,
  LeaveBalanceModel.schema,
  LeaveRequestModel.schema,
  LeaveApprovalModel.schema,
  SalaryStructureModel.schema,
  SalaryComponentModel.schema,
  EmployeeSalaryModel.schema,
  EmployeeSalaryItemModel.schema,
  PayrollPeriodModel.schema,
  PayrollRunModel.schema,
  PayrollItemModel.schema,
  PayrollLineItemModel.schema,
  PayslipModel.schema,
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
  PositionModel,
  PermissionModel,
  RoleModel,
  UserModel,
  AuditLogModel,
  NotificationModel,
  EmployeeModel,
  EmploymentContractModel,
  EmployeeDocumentModel,
  EmergencyContactModel,
  EducationModel,
  ExperienceModel,
  SkillModel,
  ShiftModel,
  AttendanceRecordModel,
  LeaveTypeModel,
  LeaveBalanceModel,
  LeaveRequestModel,
  LeaveApprovalModel,
  SalaryStructureModel,
  SalaryComponentModel,
  EmployeeSalaryModel,
  EmployeeSalaryItemModel,
  PayrollPeriodModel,
  PayrollRunModel,
  PayrollItemModel,
  PayrollLineItemModel,
  PayslipModel,
]
