# API Reference

Service interfaces, hooks, and Realm operations reference.

## 1. BaseRepository Interface

All domain repositories extend `BaseRepository<T>`:

```typescript
class BaseRepository<T extends Realm.Object> {
  // CRUD
  create(realm: Realm, data: CreateInput): T
  findById(realm: Realm, id: string): T | null
  findAll(realm: Realm, filters?: FilterInput, pagination?: PaginationInput): T[]
  update(realm: Realm, id: string, changes: UpdateInput): T
  delete(realm: Realm, id: string): boolean

  // Querying
  count(realm: Realm, filters?: FilterInput): number
  search(realm: Realm, query: string, fields?: string[]): T[]

  // Export
  exportToCSV(realm: Realm, filters?: FilterInput): string
  exportToExcel(realm: Realm, filters?: FilterInput): Blob
}
```

### FilterInput
```typescript
{
  field: string;        // Field name to filter on
  operator: string;     // 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'in'
  value: unknown;       // Filter value
}
```

### PaginationInput
```typescript
{
  page: number;         // Page number (1-based)
  pageSize: number;     // Items per page (default: 20)
  sortBy?: string;      // Sort field
  sortOrder?: 'asc' | 'desc';
}
```

## 2. Service Interfaces

### EmployeeService
```typescript
static create(realm: Realm, data: EmployeeInput): Employee
static update(realm: Realm, id: string, changes: EmployeeUpdateInput): Employee
static terminate(realm: Realm, id: string, terminationDate: string): Employee
static findAll(realm: Realm, filters?: EmployeeFilters): Employee[]
static findById(realm: Realm, id: string): Employee | null
static search(realm: Realm, query: string): Employee[]
```

### PayrollService
```typescript
static create(realm: Realm, data: PayrollRunInput): PayrollRun
static process(realm: Realm, payrollRunId: string): PayrollRun
static post(realm: Realm, payrollRunId: string): PayrollRun
static findAll(realm: Realm, filters?: PayrollFilters): PayrollRun[]
```

### StockService
```typescript
static receive(realm: Realm, data: StockReceiptInput): StockMovement
static issue(realm: Realm, data: StockIssueInput): StockMovement
static transfer(realm: Realm, data: StockTransferInput): StockTransfer
static getBalance(realm: Realm, itemId: string, warehouseId: string): StockBalance
static getLowStock(realm: Realm, companyId: string): StockBalance[]
```

### JournalEntryService
```typescript
static create(realm: Realm, data: JournalEntryInput): JournalEntry
static post(realm: Realm, id: string): JournalEntry
static void(realm: Realm, id: string, reason: string): JournalEntry
static findByDateRange(realm: Realm, start: string, end: string): JournalEntry[]
```

### PaymentService
```typescript
static create(realm: Realm, data: PaymentInput): Payment
static approve(realm: Realm, id: string): Payment
static post(realm: Realm, id: string): Payment
static findAll(realm: Realm, filters?: PaymentFilters): Payment[]
```

## 3. Hook Interfaces

### useEmployees
```typescript
function useEmployees(filters?: EmployeeFilters): {
  employees: Employee[];
  loading: boolean;
  error: string | null;
  create: (data: EmployeeInput) => Promise<Employee>;
  update: (id: string, changes: EmployeeUpdateInput) => Promise<Employee>;
  remove: (id: string) => Promise<void>;
  refresh: () => void;
}
```

### usePayrollRuns
```typescript
function usePayrollRuns(filters?: PayrollFilters): {
  runs: PayrollRun[];
  loading: boolean;
  error: string | null;
  create: (data: PayrollRunInput) => Promise<PayrollRun>;
  process: (id: string) => Promise<PayrollRun>;
  post: (id: string) => Promise<PayrollRun>;
  refresh: () => void;
}
```

### useStockBalance
```typescript
function useStockBalance(filters?: StockFilters): {
  balances: StockBalance[];
  lowStock: StockBalance[];
  loading: boolean;
  refresh: () => void;
}
```

### useAuth
```typescript
function useAuth(): {
  user: User | null;
  isAuthenticated: boolean;
  permissions: string[];
  login: (credentials: LoginInput) => Promise<void>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
}
```

## 4. Money Utility

```typescript
class Money {
  // Convert SAR to fils
  static toFils(sar: number): number

  // Convert fils to SAR
  static toSAR(fils: number): number

  // Format for display
  static format(fils: number, currency?: string): string
  // → "SAR 1,500.00"

  // Arithmetic
  static add(a: number, b: number): number
  static subtract(a: number, b: number): number
  static multiply(a: number, b: number): number
  static divide(a: number, b: number): number

  // Comparison
  static equals(a: number, b: number): boolean
  static greaterThan(a: number, b: number): boolean
  static lessThan(a: number, b: number): boolean
}
```

## 5. Validation (Zod Schemas)

### EmployeeSchema
```typescript
const EmployeeSchema = z.object({
  firstName: z.string().min(1, 'First name required'),
  lastName: z.string().min(1, 'Last name required'),
  companyId: z.string().min(1, 'Company required'),
  departmentId: z.string().min(1, 'Department required'),
  positionId: z.string().min(1, 'Position required'),
  hireDate: z.string().min(1, 'Hire date required'),
  employmentType: z.enum(['fullTime', 'partTime', 'contract']),
  basicSalary: z.number().min(0, 'Salary must be positive'),
});
```

### PayrollRunSchema
```typescript
const PayrollRunSchema = z.object({
  companyId: z.string().min(1),
  period: z.string().regex(/^\d{4}-\d{2}$/, 'Format: YYYY-MM'),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  paymentDate: z.string().min(1),
});
```

## 6. Error Types

```typescript
class ValidationError extends Error {
  constructor(message: string, field?: string) { ... }
}

class PermissionError extends Error {
  constructor(permission: string) { ... }
}

class DatabaseError extends Error {
  constructor(message: string, originalError?: Error) { ... }
}

class NotFoundError extends Error {
  constructor(entityType: string, id: string) { ... }
}
```
