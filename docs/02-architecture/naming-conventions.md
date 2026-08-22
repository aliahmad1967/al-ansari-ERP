# Naming Conventions

## 1. Files & Directories

| Category | Convention | Example |
|---|---|---|
| **Realm Models** | PascalCase singular | `Employee.ts`, `PurchaseOrder.ts` |
| **Repositories** | PascalCase + `Repository` suffix | `EmployeeRepository.ts` |
| **Services** | PascalCase + `Service` suffix | `PayrollService.ts` |
| **Hooks** | camelCase + `use` prefix | `useEmployee.ts`, `usePayroll.ts` |
| **Components** | PascalCase | `EmployeeForm.tsx`, `StockTable.tsx` |
| **Pages** | PascalCase + `Page` suffix | `EmployeeListPage.tsx` |
| **Validation schemas** | PascalCase + `Schema` suffix | `EmployeeSchema.ts` |
| **Utility files** | camelCase | `currency.ts`, `dates.ts`, `generators.ts` |
| **Test files** | Same name + `.test.ts` suffix | `currency.test.ts` |
| **i18n files** | camelCase namespace | `hr.json`, `inventory.json` |
| **Directories** | kebab-case for config, camelCase for source | `data-management/`, `workflow/` |

## 2. TypeScript Naming

| Category | Convention | Example |
|---|---|---|
| **Interfaces** | PascalCase (no `I` prefix) | `Employee`, `PayrollRun` |
| **Type aliases** | PascalCase | `EntityType`, `PermissionString` |
| **Enums** | PascalCase members | `Currency.SAR`, `LeaveType.ANNUAL` |
| **Variables** | camelCase | `employeeList`, `totalAmount` |
| **Constants** | UPPER_SNAKE_CASE | `MAX_LOGIN_ATTEMPTS`, `DEFAULT_CURRENCY` |
| **Functions** | camelCase | `calculateDeduction()`, `formatCurrency()` |
| **Classes** | PascalCase | `BaseRepository`, `Money` |
| **Generic parameters** | Single uppercase letter | `T`, `K`, `R extends Realm.Object` |

## 3. Realm Model Naming

| Element | Convention | Example |
|---|---|---|
| **Model class** | PascalCase singular | `Employee`, `PurchaseOrder` |
| **Primary key** | `id: string` | Always a UUID string |
| **Timestamps** | `createdAt`, `updatedAt` | ISO 8601 strings |
| **Foreign keys** | `{EntityName}Id` string | `employeeId`, `companyId` |
| **Relationships** | Backlink via `@Backlink` | `@Backlink('employee') attendanceRecords` |
| **Boolean fields** | `is` prefix | `isActive`, `isDeleted`, `isPosted` |
| **Status fields** | String enums | `status: 'draft' | 'pending' | 'approved'` |
| **Monetary fields** | Store as integer fils | `amount: number` (fils, not SAR) |

## 4. Repository Naming

| Element | Convention | Example |
|---|---|---|
| **Class** | `{Entity}Repository` | `EmployeeRepository` |
| **Create method** | `create(realm, data)` | `realm.create('Employee', data)` |
| **Read methods** | `findById()`, `findAll()`, `findBy{Criteria}()` | `findByCompanyId()` |
| **Update method** | `update(realm, id, changes)` | Merges changes into existing |
| **Delete method** | `delete(realm, id)` | Soft or hard delete |
| **Count method** | `count(realm, filters?)` | `countByDepartment()` |
| **Search method** | `search(realm, query)` | Full-text search |

## 5. Service Naming

| Element | Convention | Example |
|---|---|---|
| **Class** | `{Domain}Service` | `PayrollService` |
| **Create** | `create(data)` | Validates, then calls repo |
| **Update** | `update(id, changes)` | Validates, then calls repo |
| **Delete** | `delete(id)` | Checks dependencies, then calls repo |
| **Find** | `findById(id)`, `findAll(filters)` | Calls repo |
| **Specialized** | `post(id)`, `approve(id)`, `cancel(id)` | Workflow actions |
| **Export** | `exportTo{Format}(data)` | PDF, CSV, Excel |

## 6. Hook Naming

| Element | Convention | Example |
|---|---|---|
| **CRUD hooks** | `use{Entity}(filters?)` | `useEmployees({ departmentId })` |
| **Single entity** | `use{Entity}ById(id)` | `useEmployeeById('emp-123')` |
| **Action hooks** | `use{Entity}{Action}()` | `useEmployeeCreate()`, `usePayrollPost()` |
| **State hooks** | `use{State}` | `useAuth()`, `useDatabaseReady()` |
| **Utility hooks** | `use{Utility}` | `useDebounce()`, `usePagination()` |

## 7. Route Naming

| Pattern | Example |
|---|---|
| List | `/employees` |
| Detail | `/employees/:id` |
| Create | `/employees/create` |
| Edit | `/employees/:id/edit` |

## 8. i18n Key Naming

| Pattern | Example |
|---|---|
| Entity list | `hr:employees` |
| Entity fields | `hr:employee.firstName` |
| Actions | `hr:employee.create` |
| Validation | `validation:required`, `validation:email` |
| Common | `common:save`, `common:cancel`, `common:delete` |
