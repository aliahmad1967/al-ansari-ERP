# Entity Relationship Diagrams

All relationships are implemented as **string foreign keys** (not Realm `@LinkedObjects` decorators). The application resolves relationships through service/repository calls.

## 1. Core Organization Structure

```mermaid
erDiagram
    Company ||--o{ Branch : "has"
    Company ||--o{ CostCenter : "has"
    Company ||--o{ Warehouse : "has"
    Company ||--o{ Department : "has"
    Company ||--o{ Position : "has"
    Branch ||--o{ Warehouse : "contains"
    CostCenter ||--o{ CostCenter : "parent-child"
    Department ||--o{ Department : "parent-child"

    Company {
        string id PK
        string name
        string nameAr
        string baseCurrency "SAR"
    }
    Branch {
        string id PK
        string companyId FK
        string name
        string managerId FK
    }
    CostCenter {
        string id PK
        string companyId FK
        string parentId FK
        string code
    }
    Warehouse {
        string id PK
        string companyId FK
        string branchId FK
        string type "main/sub/virtual"
    }
```

## 2. Employee & HR Structure

```mermaid
erDiagram
    Company ||--o{ Employee : "employs"
    Branch ||--o{ Employee : "assigns"
    Department ||--o{ Employee : "belongs to"
    Department ||--o{ Position : "contains"
    Employee ||--o{ Employee : "manager-reports"
    Employee ||--o| Contract : "has"
    Employee ||--o{ Leave : "takes"
    Employee ||--o{ Document : "has"
    Employee ||--o{ EmployeeHistory : "tracked by"

    Employee {
        string id PK
        string employeeNumber
        string companyId FK
        string departmentId FK
        string positionId FK
        string managerId FK
        number basicSalary "fils"
    }
    Contract {
        string id PK
        string employeeId FK
        string type
        number basicSalary "fils"
    }
```

## 3. Attendance & Payroll

```mermaid
erDiagram
    Employee ||--o{ AttendanceRecord : "clocks in"
    Employee ||--o{ DailyAttendanceSummary : "daily"
    Shift ||--o{ ShiftAssignment : "assigned to"
    Employee ||--o{ ShiftAssignment : "has shifts"
    PayrollRun ||--o{ Payslip : "generates"
    Employee ||--o{ Payslip : "receives"
    Payslip ||--o{ Earning : "has earnings"
    Payslip ||--o{ Deduction : "has deductions"
    EarningType ||--o{ Earning : "defines"
    DeductionType ||--o{ Deduction : "defines"

    PayrollRun {
        string id PK
        string documentNumber
        string period
        number netPayable "fils"
        boolean isPosted
    }
    Payslip {
        string id PK
        string payrollRunId FK
        string employeeId FK
        number netPayable "fils"
    }
```

## 4. Procure-to-Pay Cycle

```mermaid
erDiagram
    Vendor ||--o{ PurchaseRequisition : "supplies for"
    PurchaseRequisition ||--o{ PurchaseRequisitionItem : "contains"
    PurchaseRequisition ||--o| PurchaseOrder : "converts to"
    PurchaseOrder ||--o{ PurchaseOrderItem : "contains"
    PurchaseOrder ||--o{ GoodsReceipt : "receives"
    GoodsReceipt ||--o{ GoodsReceiptItem : "contains"
    Item ||--o{ PurchaseOrderItem : "ordered"
    Item ||--o{ GoodsReceiptItem : "received"

    Vendor {
        string id PK
        string vendorNumber
        string name
        number rating "1-5"
    }
    PurchaseOrder {
        string id PK
        string documentNumber
        string vendorId FK
        number totalAmount "fils"
        string status
        boolean isPosted
    }
    GoodsReceipt {
        string id PK
        string documentNumber
        string purchaseOrderId FK
        string status
        boolean isPosted
    }
```

## 5. Order-to-Cash Cycle

```mermaid
erDiagram
    Customer ||--o{ Quotation : "requests"
    Quotation ||--o{ QuotationItem : "contains"
    Quotation ||--o| SalesOrder : "converts to"
    SalesOrder ||--o{ SalesOrderItem : "contains"
    SalesOrder ||--o{ DeliveryNote : "ships"
    DeliveryNote ||--o{ DeliveryNoteItem : "contains"
    SalesOrder ||--o| SalesInvoice : "invoices"
    SalesInvoice ||--o{ SalesInvoiceItem : "contains"
    Item ||--o{ QuotationItem : "quoted"
    Item ||--o{ SalesOrderItem : "ordered"
    Item ||--o{ SalesInvoiceItem : "invoiced"

    Customer {
        string id PK
        string customerNumber
        string name
        number creditLimit "fils"
    }
    SalesInvoice {
        string id PK
        string documentNumber
        string customerId FK
        number totalAmount "fils"
        number paidAmount "fils"
        string status
        boolean isPosted
    }
```

## 6. Inventory Management

```mermaid
erDiagram
    ItemCategory ||--o{ Item : "classifies"
    Item ||--o{ StockMovement : "tracked by"
    Item ||--o{ StockBalance : "balance"
    Warehouse ||--o{ StockMovement : "location"
    Warehouse ||--o{ StockBalance : "location"
    Warehouse ||--o{ StockTransfer : "source/dest"
    InventoryCycle ||--o{ InventoryCycleItem : "counts"
    InventoryAdjustment ||--o{ InventoryAdjustmentItem : "adjusts"

    StockMovement {
        string id PK
        string itemId FK
        string warehouseId FK
        string type "receipt/issue/transfer"
        number quantity
        number unitCost "fils"
    }
    StockBalance {
        string id PK
        string itemId FK
        string warehouseId FK
        number quantity
        number totalValue "fils"
    }
```

## 7. Accounting & Financial

```mermaid
erDiagram
    Account ||--o{ Account : "parent-child"
    Account ||--o{ JournalEntryLine : "debit/credit"
    JournalEntry ||--o{ JournalEntryLine : "contains"
    JournalEntry ||--o{ GLEntry : "posts to"
    Account ||--o{ GLEntry : "balance"
    TrialBalance ||--o{ TrialBalanceLine : "contains"
    Account ||--o{ TrialBalanceLine : "listed"
    FiscalPeriod ||--o{ Budget : "plans"
    Account ||--o{ Budget : "budgeted"
    Budget ||--o{ BudgetLine : "monthly"

    Account {
        string id PK
        string code
        string type "asset/liability/equity/revenue/expense"
        number balance "fils"
    }
    JournalEntry {
        string id PK
        string documentNumber
        number totalDebit "fils"
        number totalCredit "fils"
        string status "draft/posted/void"
    }
```

## 8. Assets & Depreciation

```mermaid
erDiagram
    AssetCategory ||--o{ Asset : "classifies"
    DepreciationRun ||--o{ DepreciationEntry : "contains"
    Asset ||--o{ DepreciationEntry : "depreciated"
    Account ||--o{ Asset : "asset account"
    Account ||--o{ AssetCategory : "depreciation accounts"

    Asset {
        string id PK
        string assetNumber
        number purchaseCost "fils"
        number usefulLife "years"
        number salvageValue "fils"
        string status
    }
    DepreciationRun {
        string id PK
        string period
        number totalDepreciation "fils"
        boolean isPosted
    }
```

## 9. Workflow & Approvals

```mermaid
erDiagram
    WorkflowTemplate ||--o{ WorkflowLevel : "defines levels"
    WorkflowTemplate ||--o{ ApprovalRequest : "uses"
    WorkflowLevel ||--o{ ApprovalRequest : "at level"
    ApprovalRequest ||--o{ ApprovalAction : "actions taken"
    WorkflowTemplate ||--o{ GLMapping : "account mapping"

    WorkflowTemplate {
        string id PK
        string name
        string entityType
    }
    ApprovalRequest {
        string id PK
        string entityType
        string entityId
        number currentLevel
        string status
    }
```

## 10. Security & User Management

```mermaid
erDiagram
    User ||--o{ Role : "assigned"
    Role ||--o{ Permission : "grants"
    User ||--o{ AuditTrail : "performs"
    User ||--o{ NotificationRecord : "receives"
    User ||--o{ UserPreference : "configured"

    User {
        string id PK
        string username
        string passwordHash
        string roleIds "JSON array"
    }
    Role {
        string id PK
        string name
        string permissionIds "JSON array"
        boolean isSystemRole
    }
    Permission {
        string id PK
        string code "hr.employee.create"
        string module
        string action
    }
```
