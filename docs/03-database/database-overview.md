# Database Overview

## 1. Database Engine

| Property | Value |
|---|---|
| Engine | Realm (Realm JS SDK) |
| Type | Local NoSQL object database |
| Access | Synchronous (in-process) |
| Location | Per-user local file (Electron userData path) |
| Schema Version | 8 |
| Total Models | 94 |

## 2. Why Realm

| Requirement | Realm Solution |
|---|---|
| Offline-first | Fully local, no network required |
| Fast I/O | In-memory mapped, sub-millisecond queries |
| Reactive | Objects emit change notifications |
| Migrations | Built-in schema versioning with migration functions |
| Encryption | AES-256 encryption at rest |
| Cross-platform | Works on Windows, macOS, Linux (Electron) |
| No server | No database server to manage |

## 3. Database Lifecycle

```
App Launch
  → DatabaseManager.initialize()
    → Realm.open(config)
      → If new: create schema, seed data
      → If existing, same version: open normally
      → If existing, older version: run migrations
    → Returns Realm instance
  → DatabaseReadyGate unblocks UI
  → App is ready

App Close
  → Realm.close()
  → Data persisted to disk
```

## 4. Configuration

```typescript
// src/core/database/realm.config.ts
const realmConfig: Realm.Configuration = {
  schema: [...allModels],
  schemaVersion: 8,
  migration: migrateDatabase,
  // Encryption key (stored securely, not in source)
  encryptionKey: getEncryptionKey(),
};
```

## 5. Schema Organization

Models are organized by domain:

| Domain | Model Count | Key Models |
|---|---|---|
| Organization | 5 | Company, Branch, CostCenter, Warehouse, UnitOfMeasure |
| HR | 10 | Employee, Department, Position, Contract, Shift, Leave, Document |
| Attendance | 5 | AttendanceRecord, DailyAttendanceSummary, ShiftAssignment |
| Payroll | 8 | PayrollRun, Payslip, EarningType, DeductionType, Earning, Deduction |
| Inventory | 10 | Item, ItemCategory, StockMovement, StockBalance, InventoryCycle |
| Procurement | 7 | Vendor, PurchaseRequisition, PurchaseOrder, GoodsReceipt |
| Sales | 7 | Customer, Quotation, SalesOrder, DeliveryNote, SalesInvoice |
| Accounting | 8 | Account, JournalEntry, GLEntry, TrialBalance |
| Finance | 6 | FiscalPeriod, Budget, Payment, Expense, CostAllocation |
| Assets | 5 | AssetCategory, Asset, DepreciationRun, DepreciationEntry |
| Projects | 5 | Project, ProjectTask, ProjectPhase, ProjectCost |
| Workflow | 6 | WorkflowTemplate, ApprovalRequest, ApprovalLevel, GLMapping, DocumentSequence |
| Notifications | 3 | NotificationRecord, NotificationPreference |
| Settings | 3 | SystemConfig, UserPreference |
| Audit/Security | 4 | AuditTrail, User, Role, Permission |

## 6. Naming Conventions

| Element | Convention | Example |
|---|---|---|
| Class name | PascalCase singular | `Employee`, `PurchaseOrder` |
| Primary key | `id: string` (UUID) | `"550e8400-e29b-41d4-a716-446655440000"` |
| Foreign keys | `{entity}Id: string` | `employeeId`, `companyId` |
| Timestamps | `createdAt`, `updatedAt` (ISO 8601) | `"2026-08-15T10:30:00.000Z"` |
| Boolean flags | `is` prefix | `isActive`, `isDeleted`, `isPosted` |
| Status fields | String union | `status: 'draft' | 'active' | 'closed'` |
| Money | Integer fils (not SAR float) | `amount: 150000` = SAR 1,500.00 |

## 7. Transactions

All multi-step writes use Realm transactions:

```typescript
realm.write(() => {
  // All operations here are atomic
  // If any fails, all are rolled back
  realm.create('StockMovement', ...);
  realm.create('StockBalance', ...);
  realm.create('JournalEntry', ...);
});
```

The `TransactionManager` utility provides a safe wrapper:

```typescript
TransactionManager.execute(realm, () => {
  // multi-step operations
});
```

## 8. Encryption

- AES-256 encryption for data at rest
- Encryption key derived and stored securely (not in source code)
- All sensitive fields encrypted:
  - Passwords (bcrypt hashed, then encrypted)
  - Financial data
  - Personal employee information
  - Configuration secrets
