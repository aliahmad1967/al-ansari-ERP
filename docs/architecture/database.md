# AL-ANSARI ERP — Database Architecture

## Overview

AL-ANSARI ERP uses **Realm** as its local persistence layer. Realm provides ACID transactions, schema validation, lazy loading, and automatic compaction. The database is the single source of truth for all ERP data.

## Database Engine

| Property | Value |
|----------|-------|
| Engine | Realm (MongoDB) |
| Schema Version | 8 |
| Default File | `data/al-ansari.realm` |
| Compaction | Auto-compact when file > 50MB and free space > 50% |
| Encryption | Optional 64-byte key support |
| Runtime | Node.js (Electron or desktop shell) |

## Database Manager

`DatabaseManager` is a singleton lifecycle owner:

```typescript
databaseManager.open(options)    // Async open (idempotent)
databaseManager.close()          // Safe close
databaseManager.getRealm()       // Get active instance
databaseManager.backup()         // Write-consistent snapshot
databaseManager.restore(path)    // Close → replace → reopen
databaseManager.reset(options)   // Delete (production-guarded)
databaseManager.exportJson()     // Full JSON export
databaseManager.status()         // Diagnostic info
```

### Key Properties

- **Singleton pattern** — One instance manages the entire database lifecycle
- **Idempotent open** — Multiple calls return the same promise
- **Production guard** — Reset blocked in production unless explicitly allowed
- **Confirmation token** — Destructive reset requires `'RESET'` token

## Schema Architecture

### Base Properties (all models)

```typescript
{
  _id: string           // Primary key (UUID)
  createdAt: Date       // Creation timestamp
  updatedAt: Date       // Last modification timestamp
}
```

### Soft Delete Properties (all models)

```typescript
{
  isDeleted: boolean    // Soft delete flag
  deletedAt: Date?      // Deletion timestamp
}
```

### Model Inventory (116 models)

| Category | Models |
|----------|--------|
| Organization | Organization, Branch, Department, Position, User, Role, Permission, AuditLog |
| HR | Employee, EmploymentContract, EmployeeDocument, EmergencyContact, Education, Experience, Skill |
| Attendance | Shift, AttendanceRecord, LeaveType, LeaveBalance, LeaveRequest, LeaveApproval |
| Payroll | SalaryStructure, SalaryComponent, EmployeeSalary, PayrollPeriod, PayrollRun, Payslip |
| Inventory | Category, UnitOfMeasure, Product, Warehouse, StockBalance, StockMovement, StockTransfer, StockAdjustment, InventoryCount |
| Procurement | Supplier, PurchaseRequest, PurchaseRequestItem, PurchaseOrder, PurchaseOrderItem, GoodsReceipt, GoodsReceiptItem, SupplierInvoice, SupplierPayment |
| Sales | Customer, Quotation, QuotationItem, SalesOrder, SalesOrderItem, Delivery, DeliveryItem, SalesInvoice, SalesInvoiceItem, CustomerPayment, SalesReturn, SalesReturnItem |
| Accounting | Account, AccountGroup, JournalEntry, JournalEntryLine, FiscalYear, FiscalPeriod, CostCenter, Budget, TrialBalance |
| Assets | Asset, AssetCategory, AssetLocation, AssetCustodian, DepreciationSchedule, AssetMaintenance, AssetTransfer, AssetDisposal |
| Projects | Project, ProjectTask, ProjectMilestone, ProjectTimesheet, ProjectExpense, ProjectBudget |
| Workflow | WorkflowDefinition, WorkflowInstance, WorkflowStep, WorkflowAction |
| Notifications | Notification |

## Repository Layer

### BaseRepository<TModel, TInput>

All repositories extend `BaseRepository` which provides:

| Method | Description |
|--------|-------------|
| `findById(id)` | Lookup by primary key |
| `findAll(filter?)` | Query with optional filter |
| `create(input)` | Insert with validation hook |
| `update(id, patch)` | Update with validation hook |
| `softDelete(id)` | Mark as deleted (not physical delete) |
| `restore(id)` | Undo soft delete |
| `count(filter?)` | Count records |
| `findDeleted()` | Find soft-deleted records |

### Transaction Management

```typescript
withTransaction(realm, (realm) => {
  // All writes within this callback are atomic
  // If any write fails, all writes are rolled back
})
```

**Rule:** All Realm writes must use `withTransaction()`. Related ERP records (e.g., Purchase Order → Goods Receipt → Stock Movement) must be coordinated through the service layer within a single transaction.

### Validation Hooks

Repositories support pre-write validation:
- `onBeforeCreate(input)` — Validate before insert
- `onBeforeUpdate(id, input)` — Validate before update

## Migration Strategy

Migrations are managed through a versioned migration system:

```typescript
// Current version: 8
const MIGRATIONS = [
  { fromVersion: 1, toVersion: 2, steps: [...] },
  { fromVersion: 2, toVersion: 3, steps: [...] },
  // ...
  { fromVersion: 7, toVersion: 8, steps: [...] },
]
```

Each migration step can:
- Add/remove object types
- Add/remove properties
- Transform existing data

**Critical Rule:** Schema changes must be backward-compatible. Never remove or rename properties without a migration step that handles existing data.

## Error Handling

All database errors are wrapped in typed `DatabaseError` with machine-readable codes:

| Code | Description |
|------|-------------|
| `DB_NOT_OPEN` | Database not yet opened |
| `DB_UNSUPPORTED_ENVIRONMENT` | Realm not available (browser) |
| `DB_OPEN_FAILED` | Failed to open database |
| `DB_CLOSE_FAILED` | Failed to close database |
| `DB_NOT_FOUND` | Record not found |
| `DB_DUPLICATE` | Duplicate primary key or unique field |
| `DB_VALIDATION_FAILED` | Input failed validation |
| `DB_TRANSACTION_FAILED` | Write transaction failed |
| `DB_MIGRATION_FAILED` | Schema migration failed |
| `DB_BACKUP_FAILED` | Backup creation failed |
| `DB_RESTORE_FAILED` | Restore from backup failed |
| `DB_EXPORT_FAILED` | JSON export failed |
| `DB_CORRUPTED` | Database file corrupted |

## Backup and Restore

### Backup

```typescript
const path = databaseManager.backup()  // Creates timestamped backup
```

- Writes a consistent snapshot using `writeCopyTo()`
- Stored in `data/backups/` directory
- Timestamped filename: `backup-YYYY-MM-DDTHH-MM-SS-MSZ.realm`

### Restore

```typescript
await databaseManager.restore(backupPath)
```

- Closes current database
- Replaces database file
- Reopens with current schema version
- Triggers migration if schema version differs

### Export

```typescript
const json = databaseManager.exportJson()  // Full JSON export
const path = databaseManager.exportToFile() // Write to file
```

- Exports all records of all object types
- Includes schema version and export timestamp
- Safe for offline export and future synchronization seeding

## Seed Data

In non-production environments, the database is auto-seeded with:

- Default organization and branches
- Admin user (username: `admin`, password: `admin`)
- Sample departments, positions, roles
- Default permissions matrix
- Sample employees, products, suppliers
- Fiscal year and chart of accounts

**Production Note:** Seed data is development-only. The seed check is: `process.env.NODE_ENV !== 'production'`.

## Known Limitations

1. **No server synchronization** — Local Realm is the only data source
2. **Single-user per device** — No concurrent user access management
3. **No data encryption at rest** — Optional encryption key support exists but is not configured by default
4. **Browser limitation** — Realm requires Node.js; pure browser environments have no database access
5. **Backup is manual** — No automated scheduled backups
6. **No incremental backup** — Full backup each time
