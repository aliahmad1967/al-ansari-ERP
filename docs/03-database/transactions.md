# Database Transactions

All multi-step write operations use Realm transactions to ensure atomicity and data integrity.

## 1. Transaction Rules

1. **All related writes** must be in a single transaction
2. **If any write fails**, all writes are rolled back
3. **Never partially update** related ERP records
4. **Use `TransactionManager`** for complex multi-step operations

## 2. TransactionManager Utility

```typescript
// src/core/database/transactions.ts
export class TransactionManager {
  static execute(realm: Realm, operations: () => void): void {
    realm.write(() => {
      operations();
    });
  }
}
```

## 3. Cross-Module Transaction Examples

### 3.1 Posting a Purchase Order

```
Transaction begins:
  1. Update PurchaseOrder.status → 'approved'
  2. Update PurchaseOrder.isPosted → true
  3. Update PurchaseOrder.postedAt → now
  4. Create StockMovement records (one per item)
  5. Update StockBalance records (increase quantity)
  6. Create JournalEntry (debit: inventory, credit: AP)
  7. Create JournalEntryLine records
  8. Create GLEntry records
  9. Create AuditTrail record
Transaction commits — all or nothing
```

### 3.2 Posting a Sales Invoice

```
Transaction begins:
  1. Update SalesInvoice.status → 'posted'
  2. Update SalesInvoice.isPosted → true
  3. Create StockMovement records (decrease stock)
  4. Update StockBalance records (decrease quantity)
  5. Create JournalEntry (debit: AR, credit: revenue + tax)
  6. Create JournalEntryLine records
  7. Create GLEntry records
  8. Create AuditTrail record
Transaction commits
```

### 3.3 Processing a Payroll Run

```
Transaction begins:
  1. Update PayrollRun.status → 'processing'
  2. For each employee:
     a. Calculate earnings (basic + allowances)
     b. Calculate deductions (GOSI, tax, etc.)
     c. Create Payslip record
     d. Create Earning records
     e. Create Deduction records
  3. Update PayrollRun totals
  4. Update PayrollRun.status → 'completed'
  5. Create AuditTrail record
Transaction commits
```

### 3.4 Posting a Payroll Run to GL

```
Transaction begins:
  1. Create JournalEntry for payroll expense
  2. Create JournalEntryLine: Dr. Salary Expense
  3. Create JournalEntryLine: Cr. GOSI Payable
  4. Create JournalEntryLine: Cr. Bank/Cash
  5. Create GLEntry records for each line
  6. Update PayrollRun.isPosted → true
  7. Create PayrollGLExport record
  8. Create AuditTrail record
Transaction commits
```

### 3.5 Posting Depreciation Run

```
Transaction begins:
  1. Update DepreciationRun.status → 'posting'
  2. For each asset:
     a. Calculate depreciation for period
     b. Create DepreciationEntry
     c. Update Asset accumulated depreciation
  3. Create JournalEntry (Dr. Depreciation Expense, Cr. Accumulated Depreciation)
  4. Create JournalEntryLine records
  5. Create GLEntry records
  6. Update DepreciationRun.status → 'posted'
  7. Update DepreciationRun.isPosted → true
  8. Create AuditTrail record
Transaction commits
```

## 4. Transaction Error Handling

```typescript
try {
  TransactionManager.execute(realm, () => {
    // All writes here
  });
} catch (error) {
  // Transaction automatically rolled back
  // Log error safely
  console.error('Transaction failed:', error.message);
  // Show user-friendly message
  throw new DatabaseError('Failed to save changes. Please try again.');
}
```

## 5. Transaction Performance

| Consideration | Guideline |
|---|---|
| Keep transactions small | Only include necessary writes |
| Avoid UI updates inside transactions | Update state after commit |
| Batch related operations | One transaction for related writes |
| Avoid nested transactions | Realm doesn't support nested writes |
| Test with realistic data sizes | Large transactions may be slow |

## 6. Concurrency

- Realm handles concurrent access at the object level
- Write transactions are serialized (one at a time)
- Read operations are non-blocking
- Use `realm.objects().addListener()` for reactive updates
