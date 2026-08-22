# Patterns & Conventions

## 1. BaseRepository Pattern

Every domain repository extends `BaseRepository<T>`, which provides:

| Method | Description |
|---|---|
| `create(realm, data)` | Create a new entity |
| `findById(realm, id)` | Find by primary key |
| `findAll(realm, filters?, pagination?)` | List with filtering and pagination |
| `update(realm, id, changes)` | Update entity fields |
| `delete(realm, id)` | Remove entity |
| `count(realm, filters?)` | Count matching entities |
| `search(realm, query, fields?)` | Full-text search across fields |
| `exportToCSV(realm, filters?)` | Export filtered results as CSV |
| `exportToExcel(realm, filters?)` | Export filtered results as Excel |

Custom repository methods are added per domain (e.g., `findByCompanyId()`, `findByStatus()`).

## 2. Service Layer Pattern

Services contain business logic and orchestrate repository calls:

```typescript
class PayrollService {
  static create(realm: Realm, data: PayrollRunInput): PayrollRun {
    // 1. Validate business rules
    validatePayrollRun(data);

    // 2. Generate document number
    const docNumber = DocumentSequence.next(realm, 'PAYROLL');

    // 3. Call repository
    const run = PayrollRunRepository.create(realm, {
      ...data,
      documentNumber: docNumber,
      status: 'draft',
    });

    // 4. Log audit trail
    AuditService.log(realm, {
      action: 'CREATE',
      entityType: 'PayrollRun',
      entityId: run.id,
    });

    return run;
  }
}
```

## 3. Hook Pattern

Hooks bridge React state management with service calls:

```typescript
function usePayrollRuns(filters?: PayrollFilters) {
  const realm = useRealm(); // Database access via approved abstraction
  const [runs, setRuns] = useState<PayrollRun[]>([]);

  useEffect(() => {
    if (!realm) return;
    const results = PayrollService.findAll(realm, filters);
    setRuns(results);
  }, [realm, filters]);

  const create = useCallback((data: PayrollRunInput) => {
    if (!realm) throw new Error('Database not ready');
    const run = PayrollService.create(realm, data);
    setRuns(prev => [...prev, run]);
    return run;
  }, [realm]);

  return { runs, create, /* ... */ };
}
```

## 4. Validation Pattern (Zod)

Each module defines validation schemas:

```typescript
// src/modules/payroll/validation/PayrollRunSchema.ts
const PayrollRunSchema = z.object({
  companyId: z.string().min(1, 'Company is required'),
  period: z.string().min(1, 'Period is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  employees: z.array(z.object({
    employeeId: z.string().min(1),
    basicSalary: z.number().min(0),
    // ...
  })).min(1, 'At least one employee required'),
});
```

Validation is called at the service layer (not just UI).

## 5. Money Pattern

All monetary values stored as integer fils:

```typescript
// WRONG (floating-point)
const total = price * quantity; // 0.1 + 0.2 = 0.30000000000000004

// CORRECT (integer fils)
const totalFils = priceFils * quantity; // 10 + 20 = 30 (exact)
const display = Money.format(totalFils, 'SAR'); // "SAR 0.30"
```

The `Money` utility class handles:
- Conversion between SAR and fils
- Formatting for display
- Arithmetic operations (add, subtract, multiply, divide)
- Currency conversion

## 6. Audit Trail Pattern

All significant operations are audited:

```typescript
AuditService.log(realm, {
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'APPROVE' | 'REJECT' | 'POST' | 'CANCEL',
  entityType: string,
  entityId: string,
  userId: string,
  timestamp: string, // ISO 8601
  details: Record<string, unknown>, // before/after state
});
```

Audit logs are immutable — never updated or deleted.

## 7. Permission Pattern

Permissions follow `module.resource.action` format:

```
hr.employee.view
hr.employee.create
hr.employee.update
hr.employee.delete
finance.invoice.approve
inventory.product.create
```

Permission checks in hooks/services:

```typescript
const { hasPermission } = usePermissions();

if (!hasPermission('hr.employee.create')) {
  throw new PermissionError('hr.employee.create');
}
```

## 8. Error Handling Pattern

```typescript
// Service throws typed errors
throw new ValidationError('Vendor not found');
throw new PermissionError('finance.invoice.approve');
throw new DatabaseError('Failed to save record');

// Hook catches and re-throws or sets state
// Component displays user-friendly message
try {
  await createEmployee(data);
} catch (error) {
  toast.error(t(getErrorMessage(error)));
}
```

## 9. Module Isolation Pattern

Each module is self-contained:

```
modules/hr/
├── components/    # HR-specific UI
├── pages/         # HR pages
├── hooks/         # HR hooks
├── services/      # HR business logic
├── validation/    # HR schemas
├── types/         # HR types
└── __tests__/     # HR tests
```

Modules do NOT import from other modules' internals. Cross-module coordination happens through the service layer.

## 10. Test Pattern

```typescript
// Unit test (service logic)
describe('PayrollService', () => {
  it('should calculate total deductions correctly', () => {
    const result = PayrollService.calculateDeductions(mockPayrollData);
    expect(result.totalDeductions).toBe(expectedAmount);
  });
});

// Integration test (repository + Realm)
describe('EmployeeRepository', () => {
  it('should create and retrieve an employee', () => {
    const realm = getTestRealm();
    const employee = EmployeeRepository.create(realm, mockEmployee);
    const found = EmployeeRepository.findById(realm, employee.id);
    expect(found).toBeTruthy();
    expect(found.firstName).toBe(mockEmployee.firstName);
  });
});
```

## 11. Lazy Loading Pattern

Modules are lazy-loaded via React Router:

```typescript
const HRModule = lazy(() => import('./modules/hr'));
const InventoryModule = lazy(() => import('./modules/inventory'));
// ...
```

Routes use `Suspense` with `AppLoading` as fallback.

## 12. i18n Pattern

All user-facing strings use i18n:

```tsx
// WRONG
<h1>Employee List</h1>

// CORRECT
<h1>{t('hr:employees.title')}</h1>
```

- Namespace per module: `hr`, `inventory`, `accounting`, etc.
- Shared namespace: `common` (save, cancel, delete, etc.)
- Validation namespace: `validation`
- Date/number formatting uses locale-aware utilities
