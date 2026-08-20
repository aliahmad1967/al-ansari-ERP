# AL-ANSARI ERP — Module Architecture

## Module Overview

AL-ANSARI ERP consists of 17 feature modules, each following the layered architecture pattern. Modules communicate through service interfaces and share core repositories and utilities.

## Module Inventory

| Module | Pages | Services | Repositories | Tests | Status |
|--------|-------|----------|-------------|-------|--------|
| Organization | 7 | 1 | Core only | 0 | Functional |
| HR | 6 | 2 | Core only | 2 | Functional |
| Attendance | 4 | 1 | Core only | 2 | Functional |
| Payroll | 4 | 2 | Core only | 1 | Functional |
| Inventory | 8 | 2 | Core only | 4 | Partial |
| Procurement | 6 | 3 | Core only | 3 | Functional |
| Sales | 7 | 5 | Core only | 7 | Good |
| Accounting | 8 | 4 | Core only | 8 | Good |
| Assets | 6 | 4 | Core only | 4 | Good |
| Projects | 5 | 2 | Core only | 0 | Functional |
| Finance | 0 | Shared | Core only | 0 | Shared |
| Reports | 2 | 1 | None | 0 | Needs refactor |
| Workflow | 2 | 1 | Module-local | 1 | Needs refactor |
| Notifications | 1 | Core only | Core only | 0 | Partial |
| Settings | 1 | None | Core only | 0 | Incomplete |
| Data Management | 2 | 1 | Core only | 0 | Functional |
| Dashboard | 1 | 1 (dev) | Core only | 0 | Dev-only |
| Auth | 2 | Core only | None | 0 | Minimal |

## Module Details

### Organization Module
- **Entities:** Organization, Branch, Department, Position, User, Role, Permission
- **Services:** OrganizationService (CRUD + hierarchy)
- **Notes:** Foundation module — all other modules reference organizations and branches

### HR Module
- **Entities:** Employee, EmploymentContract, EmployeeDocument, EmergencyContact, Education, Experience, Skill
- **Services:** EmployeeService, ContractService
- **Tests:** EmployeeService, PayrollCalculationEngine
- **Notes:** Core employee data management; feeds into Attendance, Payroll, and Reports

### Attendance Module
- **Entities:** Shift, AttendanceRecord, LeaveType, LeaveBalance, LeaveRequest, LeaveApproval
- **Services:** AttendanceService, LeaveService
- **Tests:** AttendanceService, LeaveService
- **Notes:** Clock-in/out, shift management, leave workflow

### Payroll Module
- **Entities:** SalaryStructure, SalaryComponent, EmployeeSalary, PayrollPeriod, PayrollRun, Payslip
- **Services:** PayrollService, SalaryStructureService
- **Tests:** PayrollCalculationEngine
- **Notes:** Uses decimal.js for all financial calculations; comprehensive validation

### Inventory Module
- **Entities:** Category, UnitOfMeasure, Product, Warehouse, StockBalance, StockMovement, StockTransfer, StockAdjustment, InventoryCount
- **Services:** ProductService, StockService
- **Tests:** ProductRepository, StockMovementEngine, StockTransferService, InventoryCountService
- **Issues:** Some pages (Adjustments, Categories) bypass service layer with direct repository access + localStorage fallback

### Procurement Module
- **Entities:** Supplier, PurchaseRequest, PurchaseOrder, GoodsReceipt, SupplierInvoice, SupplierPayment
- **Services:** PurchaseRequestService, PurchaseOrderService, GoodsReceiptService
- **Tests:** SupplierRepository, PurchaseRequestService, PurchaseOrderService
- **Notes:** Complete PO → GR → Invoice workflow with status transitions

### Sales Module
- **Entities:** Customer, Quotation, SalesOrder, Delivery, SalesInvoice, CustomerPayment, SalesReturn
- **Services:** QuotationService, SalesOrderService, DeliveryService, SalesInvoiceService, CustomerPaymentService
- **Tests:** All 7 services tested
- **Notes:** Best-tested module; uses decimal.js for financial calculations

### Accounting Module
- **Entities:** Account, AccountGroup, JournalEntry, FiscalYear, CostCenter, Budget
- **Services:** AccountService, JournalEntryService, FiscalYearService, PostingService
- **Tests:** All 8 services tested
- **Notes:** Double-entry bookkeeping; journal entries validated for balanced debits/credits

### Assets Module
- **Entities:** Asset, AssetCategory, AssetLocation, AssetCustodian, DepreciationSchedule, AssetMaintenance, AssetTransfer, AssetDisposal
- **Services:** AssetService, DepreciationService, AssetTransferService, AssetDisposalService
- **Tests:** All 4 services tested
- **Notes:** Depreciation calculations use decimal.js; status transition validation

### Projects Module
- **Entities:** Project, ProjectTask, ProjectMilestone, ProjectTimesheet, ProjectExpense, ProjectBudget
- **Services:** ProjectService, TaskService
- **Tests:** None
- **Issues:** No status transition validation; raw arithmetic for budget totals

### Reports Module
- **Services:** ReportService
- **Issues:** CRITICAL — bypasses repository layer; direct Realm access via `getActiveRealm()`; floating-point arithmetic for financial totals; hardcoded English strings

### Workflow Module
- **Entities:** WorkflowDefinition, WorkflowInstance, WorkflowStep, WorkflowAction
- **Services:** WorkflowService
- **Issues:** CRITICAL — broken imports (references `../models/` and `../repositories/` which don't exist in module-local path); localStorage-based data persistence; TypeScript build errors

### Notifications Module
- **Notes:** Core NotificationService exists; module has hooks but no dedicated service; uses localStorage fallback

### Settings Module
- **Notes:** Empty service directory; settings functionality partially in DataManagementService

### Data Management Module
- **Services:** DataManagementService (wraps BackupService, ImportService, ExportService)
- **Notes:** Backup/restore, import/export; uses core services

### Dashboard Module
- **Services:** DevDashboardService
- **Issues:** Generates fake/random data for development; should not be used in production

## Shared Core Services

| Service | Module | Purpose |
|---------|--------|---------|
| AuditService | Core | Audit trail logging |
| AuthService | Core | Authentication, login, session |
| DevAuthService | Core | Development authentication fallback |
| BackupService | Core | Database backup and restore |
| ImportService | Core | Excel/CSV import |
| ExportService | Core | Excel/JSON/PDF export |
| NotificationService | Core | In-app notifications |
| OfflineHealthService | Core | Connectivity and database health checks |
| PermissionService | Core | Permission checking |

## Cross-Module Dependencies

```
HR ←→ Attendance (employee data)
HR ←→ Payroll (salary structures, employees)
HR ←→ Reports (employee analytics)
Inventory ←→ Procurement (stock from POs)
Inventory ←→ Sales (stock from deliveries)
Inventory ←→ Reports (inventory analytics)
Sales ←→ Accounting (journal entries from invoices)
Sales ←→ Reports (sales analytics)
Procurement ←→ Accounting (journal entries from POs)
Procurement ←→ Reports (procurement analytics)
Assets ←→ Accounting (depreciation entries)
Assets ←→ Reports (asset analytics)
Projects ←→ Accounting (project costs)
Projects ←→ Reports (project analytics)
Workflow ←→ Notifications (approval notifications)
Workflow ←→ HR, Inventory, Procurement, Sales (entity approvals)
```

## Financial Calculation Integrity

### Modules Using decimal.js (Correct)
- Payroll: `PayrollCalculationEngine` — all salary calculations
- Sales: Quotation, SalesOrder, SalesInvoice — line totals, tax, discounts
- Inventory: `StockMovementEngine` — stock valuation
- Assets: `DepreciationService` — depreciation calculations

### Modules Using Raw Arithmetic (Needs Fix)
- Procurement: `PurchaseOrderService`, `PurchaseRequestService` — line totals
- Inventory: `StockService`, `GoodsReceiptService` — stock value calculations
- Reports: `ReportService` — financial totals
- Projects: `ProjectBudgetService` — budget sums
- Accounting: `PostingService` — some ledger calculations

## Test Coverage Summary

| Area | Coverage |
|------|----------|
| Core Security | 6 test files ✅ |
| Core Utilities | 4 test files ✅ |
| Accounting Services | 8 test files ✅ |
| Sales Services | 7 test files ✅ |
| Inventory | 4 test files ✅ |
| Assets | 4 test files ✅ |
| Procurement | 3 test files ✅ |
| HR/Payroll | 3 test files ⚠️ |
| Attendance | 2 test files ✅ |
| Workflow | 1 test file ⚠️ |
| Auth | 0 test files ❌ |
| Projects | 0 test files ❌ |
| Organization | 0 test files ❌ |
| Data Management | 0 test files ❌ |
| Reports | 0 test files ❌ |
| Notifications | 0 test files ❌ |
| Settings | 0 test files ❌ |
