# Schema Migrations

Realm database migrations handle schema evolution from version 1 to the current version 8.

## 1. Migration History

| Version | Description | Key Changes |
|---|---|---|
| 1 → 2 | Initial expansion | Added Employee, Department, Position models |
| 2 → 3 | Attendance & Payroll | Added AttendanceRecord, PayrollRun, Payslip, EarningType, DeductionType |
| 3 → 4 | Inventory & Procurement | Added Item, StockMovement, StockBalance, PurchaseOrder, GoodsReceipt |
| 4 → 5 | Sales & Accounting | Added Customer, SalesOrder, SalesInvoice, Account, JournalEntry, GLEntry |
| 5 → 6 | Finance & Assets | Added FiscalPeriod, Budget, Payment, Asset, DepreciationRun |
| 6 → 7 | Projects & Workflow | Added Project, ProjectTask, WorkflowTemplate, ApprovalRequest |
| 7 → 8 | Notifications & Settings | Added NotificationRecord, SystemConfig, User, Role, Permission |

## 2. Migration Function

```typescript
// src/core/database/migrations.ts
function migrateDatabase(oldRealm: Realm, newRealm: Realm) {
  // Version 1 → 2
  if (oldRealm.schemaVersion < 2) {
    // Add new fields to existing models
    // Create new models
    // Migrate data if needed
  }
  // Version 2 → 3
  if (oldRealm.schemaVersion < 3) {
    // ...
  }
  // ... continue for each version
}
```

## 3. Migration Rules

1. **Never delete fields** — mark as deprecated or ignore
2. **Never rename fields** — add new, keep old, migrate data
3. **Always use `realm.objects()` to read** old data during migration
4. **Always use `realm.create()` to write** new data during migration
5. **Test each migration path** — version 1→8, 2→8, 3→8, etc.
6. **Back up before migrating** — BackupService runs automatically before schema upgrade

## 4. Schema Version Management

```typescript
// src/core/database/realm.config.ts
const REALM_SCHEMA_VERSION = 8;

const config: Realm.Configuration = {
  schema: [...allModels],
  schemaVersion: REALM_SCHEMA_VERSION,
  migration: migrateDatabase,
};
```

## 5. Adding a New Migration

When adding new models or fields for a new phase:

1. Increment `REALM_SCHEMA_VERSION` to 9
2. Add migration logic in `migrateDatabase()`:
   ```typescript
   if (oldRealm.schemaVersion < 9) {
     // Add new fields with default values
     // Create new model instances
     // Migrate existing data if needed
   }
   ```
3. Update all model files
4. Test migration from version 8 to 9
5. Test fresh install (version 1→9)
6. Test downgrade scenario (graceful handling)

## 6. Migration Testing

| Test | Purpose |
|---|---|
| Fresh install | Version 8 from scratch |
| Upgrade 1→8 | All migration paths work |
| Upgrade 7→8 | Single-step upgrade |
| Data integrity | All data preserved after migration |
| Performance | Migration completes within acceptable time |
| Rollback | Old Realm files handled gracefully |
