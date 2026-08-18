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
import type { Category } from './Category'
import type { Unit } from './Unit'
import type { Product } from './Product'
import type { Warehouse } from './Warehouse'
import type { WarehouseLocation } from './WarehouseLocation'
import type { StockBalance } from './StockBalance'
import type { StockMovement } from './StockMovement'
import type { StockTransfer } from './StockTransfer'
import type { StockAdjustment } from './StockAdjustment'
import type { InventoryCount } from './InventoryCount'
import type { Supplier } from './Supplier'
import type { PurchaseRequest } from './PurchaseRequest'
import type { PurchaseRequestItem } from './PurchaseRequestItem'
import type { PurchaseOrder } from './PurchaseOrder'
import type { PurchaseOrderItem } from './PurchaseOrderItem'
import type { GoodsReceipt } from './GoodsReceipt'
import type { GoodsReceiptItem } from './GoodsReceiptItem'
import type { SupplierInvoice } from './SupplierInvoice'
import type { SupplierPayment } from './SupplierPayment'
import type { Account } from './Account'
import type { AccountGroup } from './AccountGroup'
import type { FiscalYear } from './FiscalYear'
import type { FiscalPeriod } from './FiscalPeriod'
import type { JournalEntry } from './JournalEntry'
import type { JournalEntryLine } from './JournalEntryLine'
import type { LedgerTransaction } from './LedgerTransaction'
import type { CostCenter } from './CostCenter'
import type { Budget } from './Budget'
import type { AccountingPayment } from './AccountingPayment'
import type { AccountingReceipt } from './AccountingReceipt'
import type { AccountingPolicy } from './AccountingPolicy'
import type { Customer } from './Customer'
import type { Quotation } from './Quotation'
import type { QuotationItem } from './QuotationItem'
import type { SalesOrder } from './SalesOrder'
import type { SalesOrderItem } from './SalesOrderItem'
import type { Delivery } from './Delivery'
import type { DeliveryItem } from './DeliveryItem'
import type { SalesInvoice } from './SalesInvoice'
import type { SalesInvoiceItem } from './SalesInvoiceItem'
import type { CustomerPayment } from './CustomerPayment'
import type { SalesReturn } from './SalesReturn'
import type { SalesReturnItem } from './SalesReturnItem'

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
import { Category as CategoryModel } from './Category'
import { Unit as UnitModel } from './Unit'
import { Product as ProductModel } from './Product'
import { Warehouse as WarehouseModel } from './Warehouse'
import { WarehouseLocation as WarehouseLocationModel } from './WarehouseLocation'
import { StockBalance as StockBalanceModel } from './StockBalance'
import { StockMovement as StockMovementModel } from './StockMovement'
import { StockTransfer as StockTransferModel } from './StockTransfer'
import { StockAdjustment as StockAdjustmentModel } from './StockAdjustment'
import { InventoryCount as InventoryCountModel } from './InventoryCount'
import { Supplier as SupplierModel } from './Supplier'
import { PurchaseRequest as PurchaseRequestModel } from './PurchaseRequest'
import { PurchaseRequestItem as PurchaseRequestItemModel } from './PurchaseRequestItem'
import { PurchaseOrder as PurchaseOrderModel } from './PurchaseOrder'
import { PurchaseOrderItem as PurchaseOrderItemModel } from './PurchaseOrderItem'
import { GoodsReceipt as GoodsReceiptModel } from './GoodsReceipt'
import { GoodsReceiptItem as GoodsReceiptItemModel } from './GoodsReceiptItem'
import { SupplierInvoice as SupplierInvoiceModel } from './SupplierInvoice'
import { SupplierPayment as SupplierPaymentModel } from './SupplierPayment'
import { Account as AccountModel } from './Account'
import { AccountGroup as AccountGroupModel } from './AccountGroup'
import { FiscalYear as FiscalYearModel } from './FiscalYear'
import { FiscalPeriod as FiscalPeriodModel } from './FiscalPeriod'
import { JournalEntry as JournalEntryModel } from './JournalEntry'
import { JournalEntryLine as JournalEntryLineModel } from './JournalEntryLine'
import { LedgerTransaction as LedgerTransactionModel } from './LedgerTransaction'
import { CostCenter as CostCenterModel } from './CostCenter'
import { Budget as BudgetModel } from './Budget'
import { AccountingPayment as AccountingPaymentModel } from './AccountingPayment'
import { AccountingReceipt as AccountingReceiptModel } from './AccountingReceipt'
import { AccountingPolicy as AccountingPolicyModel } from './AccountingPolicy'
import { Customer as CustomerModel } from './Customer'
import { Quotation as QuotationModel } from './Quotation'
import { QuotationItem as QuotationItemModel } from './QuotationItem'
import { SalesOrder as SalesOrderModel } from './SalesOrder'
import { SalesOrderItem as SalesOrderItemModel } from './SalesOrderItem'
import { Delivery as DeliveryModel } from './Delivery'
import { DeliveryItem as DeliveryItemModel } from './DeliveryItem'
import { SalesInvoice as SalesInvoiceModel } from './SalesInvoice'
import { SalesInvoiceItem as SalesInvoiceItemModel } from './SalesInvoiceItem'
import { CustomerPayment as CustomerPaymentModel } from './CustomerPayment'
import { SalesReturn as SalesReturnModel } from './SalesReturn'
import { SalesReturnItem as SalesReturnItemModel } from './SalesReturnItem'

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
  CategoryModel,
  UnitModel,
  ProductModel,
  WarehouseModel,
  WarehouseLocationModel,
  StockBalanceModel,
  StockMovementModel,
  StockTransferModel,
  StockAdjustmentModel,
  InventoryCountModel,
  SupplierModel,
  PurchaseRequestModel,
  PurchaseRequestItemModel,
  PurchaseOrderModel,
  PurchaseOrderItemModel,
  GoodsReceiptModel,
  GoodsReceiptItemModel,
  SupplierInvoiceModel,
  SupplierPaymentModel,
  AccountModel,
  AccountGroupModel,
  FiscalYearModel,
  FiscalPeriodModel,
  JournalEntryModel,
  JournalEntryLineModel,
  LedgerTransactionModel,
  CostCenterModel,
  BudgetModel,
  AccountingPaymentModel,
  AccountingReceiptModel,
  AccountingPolicyModel,
  CustomerModel,
  QuotationModel,
  QuotationItemModel,
  SalesOrderModel,
  SalesOrderItemModel,
  DeliveryModel,
  DeliveryItemModel,
  SalesInvoiceModel,
  SalesInvoiceItemModel,
  CustomerPaymentModel,
  SalesReturnModel,
  SalesReturnItemModel,
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
  Account,
  AccountGroup,
  FiscalYear,
  FiscalPeriod,
  JournalEntry,
  JournalEntryLine,
  LedgerTransaction,
  CostCenter,
  Budget,
  AccountingPayment,
  AccountingReceipt,
  AccountingPolicy,
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
  Category,
  Unit,
  Product,
  Warehouse,
  WarehouseLocation,
  StockBalance,
  StockMovement,
  StockTransfer,
  StockAdjustment,
  InventoryCount,
  Supplier,
  PurchaseRequest,
  PurchaseRequestItem,
  PurchaseOrder,
  PurchaseOrderItem,
  GoodsReceipt,
  GoodsReceiptItem,
  SupplierInvoice,
  SupplierPayment,
  Customer,
  Quotation,
  QuotationItem,
  SalesOrder,
  SalesOrderItem,
  Delivery,
  DeliveryItem,
  SalesInvoice,
  SalesInvoiceItem,
  CustomerPayment,
  SalesReturn,
  SalesReturnItem,
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
export type { CategoryInput, CategoryEntity } from './Category'
export type { UnitInput, UnitEntity } from './Unit'
export { ProductStatus } from './Product'
export type { ProductInput, ProductEntity, ProductStatusValue } from './Product'
export { WarehouseStatus } from './Warehouse'
export type { WarehouseInput, WarehouseEntity, WarehouseStatusValue } from './Warehouse'
export type { WarehouseLocationInput, WarehouseLocationEntity } from './WarehouseLocation'
export type { StockBalanceInput, StockBalanceEntity, StockBalanceUpdate } from './StockBalance'
export { StockMovementType } from './StockMovement'
export type { StockMovementInput, StockMovementEntity, StockMovementTypeValue } from './StockMovement'
export { StockTransferStatus } from './StockTransfer'
export type { StockTransferInput, StockTransferEntity, StockTransferStatusValue, StockTransferUpdate } from './StockTransfer'
export { StockAdjustmentStatus } from './StockAdjustment'
export type { StockAdjustmentInput, StockAdjustmentEntity, StockAdjustmentStatusValue, StockAdjustmentUpdate } from './StockAdjustment'
export { InventoryCountStatus } from './InventoryCount'
export type { InventoryCountInput, InventoryCountEntity, InventoryCountStatusValue, InventoryCountUpdate } from './InventoryCount'
export { SupplierStatus } from './Supplier'
export type { SupplierInput, SupplierEntity, SupplierStatusValue } from './Supplier'
export { PurchaseRequestStatus } from './PurchaseRequest'
export type { PurchaseRequestInput, PurchaseRequestEntity, PurchaseRequestStatusValue } from './PurchaseRequest'
export type { PurchaseRequestItemInput, PurchaseRequestItemEntity } from './PurchaseRequestItem'
export { PurchaseOrderStatus } from './PurchaseOrder'
export type { PurchaseOrderInput, PurchaseOrderEntity, PurchaseOrderStatusValue } from './PurchaseOrder'
export type { PurchaseOrderItemInput, PurchaseOrderItemEntity } from './PurchaseOrderItem'
export { GoodsReceiptStatus } from './GoodsReceipt'
export type { GoodsReceiptInput, GoodsReceiptEntity, GoodsReceiptStatusValue } from './GoodsReceipt'
export type { GoodsReceiptItemInput, GoodsReceiptItemEntity } from './GoodsReceiptItem'
export { SupplierInvoiceStatus } from './SupplierInvoice'
export type { SupplierInvoiceInput, SupplierInvoiceEntity, SupplierInvoiceStatusValue } from './SupplierInvoice'
export { SupplierPaymentStatus, SupplierPaymentMethod } from './SupplierPayment'
export type { SupplierPaymentInput, SupplierPaymentEntity, SupplierPaymentStatusValue, SupplierPaymentMethodValue } from './SupplierPayment'
export { CustomerStatus } from './Customer'
export type { CustomerInput, CustomerEntity, CustomerStatusValue } from './Customer'
export { QuotationStatus } from './Quotation'
export type { QuotationInput, QuotationEntity, QuotationStatusValue } from './Quotation'
export type { QuotationItemInput, QuotationItemEntity } from './QuotationItem'
export { SalesOrderStatus } from './SalesOrder'
export type { SalesOrderInput, SalesOrderEntity, SalesOrderStatusValue } from './SalesOrder'
export type { SalesOrderItemInput, SalesOrderItemEntity } from './SalesOrderItem'
export { DeliveryStatus } from './Delivery'
export type { DeliveryInput, DeliveryEntity, DeliveryStatusValue } from './Delivery'
export type { DeliveryItemInput, DeliveryItemEntity } from './DeliveryItem'
export { SalesInvoiceStatus } from './SalesInvoice'
export type { SalesInvoiceInput, SalesInvoiceEntity, SalesInvoiceStatusValue } from './SalesInvoice'
export type { SalesInvoiceItemInput, SalesInvoiceItemEntity } from './SalesInvoiceItem'
export { CustomerPaymentStatus, CustomerPaymentMethod } from './CustomerPayment'
export type { CustomerPaymentInput, CustomerPaymentEntity, CustomerPaymentStatusValue, CustomerPaymentMethodValue } from './CustomerPayment'
export { SalesReturnStatus } from './SalesReturn'
export type { SalesReturnInput, SalesReturnEntity, SalesReturnStatusValue } from './SalesReturn'
export type { SalesReturnItemInput, SalesReturnItemEntity } from './SalesReturnItem'
export { AccountType } from './Account'
export type { AccountInput, AccountEntity, AccountTypeValue } from './Account'
export type { AccountGroupInput, AccountGroupEntity } from './AccountGroup'
export { FiscalYearStatus } from './FiscalYear'
export type { FiscalYearInput, FiscalYearEntity, FiscalYearStatusValue } from './FiscalYear'
export { FiscalPeriodStatus } from './FiscalPeriod'
export type { FiscalPeriodInput, FiscalPeriodEntity, FiscalPeriodStatusValue } from './FiscalPeriod'
export { JournalEntryStatus, JournalEntryReferenceType } from './JournalEntry'
export type { JournalEntryInput, JournalEntryEntity, JournalEntryStatusValue, JournalEntryReferenceTypeValue } from './JournalEntry'
export type { JournalEntryLineInput, JournalEntryLineEntity } from './JournalEntryLine'
export type { LedgerTransactionInput, LedgerTransactionEntity } from './LedgerTransaction'
export type { CostCenterInput, CostCenterEntity } from './CostCenter'
export { BudgetStatus } from './Budget'
export type { BudgetInput, BudgetEntity, BudgetStatusValue } from './Budget'
export { AccountingPaymentStatus, AccountingPaymentMethod } from './AccountingPayment'
export type { AccountingPaymentInput, AccountingPaymentEntity, AccountingPaymentStatusValue, AccountingPaymentMethodValue } from './AccountingPayment'
export { AccountingReceiptStatus, AccountingReceiptMethod } from './AccountingReceipt'
export type { AccountingReceiptInput, AccountingReceiptEntity, AccountingReceiptStatusValue, AccountingReceiptMethodValue } from './AccountingReceipt'
export type { AccountingPolicyInput, AccountingPolicyEntity } from './AccountingPolicy'
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
  CategoryModel.schema,
  UnitModel.schema,
  ProductModel.schema,
  WarehouseModel.schema,
  WarehouseLocationModel.schema,
  StockBalanceModel.schema,
  StockMovementModel.schema,
  StockTransferModel.schema,
  StockAdjustmentModel.schema,
  InventoryCountModel.schema,
  SupplierModel.schema,
  PurchaseRequestModel.schema,
  PurchaseRequestItemModel.schema,
  PurchaseOrderModel.schema,
  PurchaseOrderItemModel.schema,
  GoodsReceiptModel.schema,
  GoodsReceiptItemModel.schema,
  SupplierInvoiceModel.schema,
  SupplierPaymentModel.schema,
  AccountModel.schema,
  AccountGroupModel.schema,
  FiscalYearModel.schema,
  FiscalPeriodModel.schema,
  JournalEntryModel.schema,
  JournalEntryLineModel.schema,
  LedgerTransactionModel.schema,
  CostCenterModel.schema,
  BudgetModel.schema,
  AccountingPaymentModel.schema,
  AccountingReceiptModel.schema,
  AccountingPolicyModel.schema,
  CustomerModel.schema,
  QuotationModel.schema,
  QuotationItemModel.schema,
  SalesOrderModel.schema,
  SalesOrderItemModel.schema,
  DeliveryModel.schema,
  DeliveryItemModel.schema,
  SalesInvoiceModel.schema,
  SalesInvoiceItemModel.schema,
  CustomerPaymentModel.schema,
  SalesReturnModel.schema,
  SalesReturnItemModel.schema,
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
  CategoryModel,
  UnitModel,
  ProductModel,
  WarehouseModel,
  WarehouseLocationModel,
  StockBalanceModel,
  StockMovementModel,
  StockTransferModel,
  StockAdjustmentModel,
  InventoryCountModel,
  SupplierModel,
  PurchaseRequestModel,
  PurchaseRequestItemModel,
  PurchaseOrderModel,
  PurchaseOrderItemModel,
  GoodsReceiptModel,
  GoodsReceiptItemModel,
  SupplierInvoiceModel,
  SupplierPaymentModel,
  AccountModel,
  AccountGroupModel,
  FiscalYearModel,
  FiscalPeriodModel,
  JournalEntryModel,
  JournalEntryLineModel,
  LedgerTransactionModel,
  CostCenterModel,
  BudgetModel,
  AccountingPaymentModel,
  AccountingReceiptModel,
  AccountingPolicyModel,
  CustomerModel,
  QuotationModel,
  QuotationItemModel,
  SalesOrderModel,
  SalesOrderItemModel,
  DeliveryModel,
  DeliveryItemModel,
  SalesInvoiceModel,
  SalesInvoiceItemModel,
  CustomerPaymentModel,
  SalesReturnModel,
  SalesReturnItemModel,
]
