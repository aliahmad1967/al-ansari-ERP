# Module Dependency Map

## 1. Dependency Rules

1. Each module is self-contained with its own models, repositories, services, hooks, and tests.
2. Modules communicate ONLY through service-layer interfaces.
3. No direct model/repository imports across module boundaries.
4. Core services (`AuditService`, `NotificationService`, `PermissionService`) are shared utilities — not cross-module dependencies.

## 2. Core Dependencies (shared by all modules)

```
All modules depend on:
├── core/database/         # Realm instance
├── core/models/BaseEntity # Base entity interface
├── core/repositories/BaseRepository.ts
├── core/services/AuditService.ts
├── core/services/NotificationService.ts
├── core/services/PermissionService.ts
├── core/security/         # Authentication, permissions
├── core/utils/            # Money, dates, formatting
├── i18n/                  # Translations
└── stores/                # Auth store, UI store
```

## 3. Module Cross-References

| Module | Depends On (via service layer) |
|---|---|
| **organization** | None (base module) |
| **hr** | organization (company, branch, department, position, warehouse) |
| **attendance** | hr (employee, shift, schedule) |
| **payroll** | hr (employee, contract, leave), attendance (daily summary), accounting (GL export) |
| **inventory** | organization (warehouse, unit) |
| **procurement** | organization (warehouse), inventory (item, stock), hr (employee for approver) |
| **sales** | organization (warehouse), inventory (item), accounting (GL export) |
| **accounting** | organization (company, cost center) |
| **finance** | accounting (chart of accounts, journal entries, GL entries), organization (company, cost center) |
| **assets** | organization (company, warehouse), accounting (GL export) |
| **projects** | organization (company, cost center), accounting (GL export) |
| **workflow** | None (generic engine used by other modules) |
| **notifications** | None (generic notification system) |
| **reports** | All modules (reporting across all data) |
| **settings** | organization (company), auth (user/role management) |
| **data-management** | All modules (backup/restore, import/export) |
| **dashboard** | All modules (KPIs, analytics) |
| **auth** | settings (user/role/permission management) |

## 4. Service Dependency Graph

```
PayrollService
  ├── calls EmployeeRepository (hr module)
  ├── calls ContractRepository (hr module)
  ├── calls DailyAttendanceSummaryRepository (attendance module)
  ├── calls GLAccountRepository (accounting module)
  ├── calls JournalEntryRepository (accounting module)
  ├── calls AuditService (core)
  └── calls NotificationService (core)

GoodsReceiptService (procurement)
  ├── calls VendorRepository (procurement)
  ├── calls ItemRepository (inventory)
  ├── calls StockMovementRepository (inventory)
  ├── calls StockBalanceRepository (inventory)
  ├── calls JournalEntryRepository (accounting)
  ├── calls AuditService (core)
  └── calls NotificationService (core)

SalesInvoiceService (sales)
  ├── calls CustomerRepository (sales)
  ├── calls ItemRepository (inventory)
  ├── calls StockMovementRepository (inventory)
  ├── calls JournalEntryRepository (accounting)
  ├── calls AuditService (core)
  └── calls NotificationService (core)

AssetDepreciationService (assets)
  ├── calls AssetRepository (assets)
  ├── calls DepreciationRunRepository (assets)
  ├── calls JournalEntryRepository (accounting)
  ├── calls AuditService (core)
  └── calls NotificationService (core)
```

## 5. Database Cross-References

Some Realm models reference other modules' models via string foreign keys (not Realm relationships):

| Model | References |
|---|---|
| `Employee` | `companyId`, `branchId`, `departmentId`, `positionId`, `warehouseId` |
| `DailyAttendanceSummary` | `employeeId` |
| `Payslip` | `payrollRunId`, `employeeId` |
| `StockMovement` | `itemId`, `warehouseId`, `referenceId` |
| `JournalEntry` | `accountId`, `companyId` |
| `PurchaseOrder` | `vendorId`, `warehouseId` |
| `SalesInvoice` | `customerId`, `warehouseId` |

These are string-based references — NOT Realm relationship decorators. The application resolves them through service/repository calls.

## 6. Module Communication Patterns

### Pattern 1: Direct Service Call

```
PayrollService.create()
  → EmployeeRepository.findAll() // hr module
  → ContractRepository.findByEmployeeId() // hr module
  → creates Payslip records
```

### Pattern 2: GL Export (common pattern)

```
PayrollService.post() / AssetDepreciationService.post() / ProjectService.post()
  → creates JournalEntry records
  → debits/credits GLAccount records
  → all via accounting module's repository layer
```

### Pattern 3: Notification Fan-Out

```
Any module's service (create/approve/post)
  → NotificationService.notify()
  → creates NotificationRecord
  → available in notifications module's notification center
```

### Pattern 4: Audit Trail

```
Any module's service (any action)
  → AuditService.log()
  → creates AuditTrail record
  → queryable from settings/data-management modules
```
