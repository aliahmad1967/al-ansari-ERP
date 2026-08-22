# Finance, Assets & Projects Modules

---

## 1. Finance Module

**Path**: `src/modules/finance/`
**Purpose**: Fiscal periods, budgets, payments, expenses, cost allocations.

### Models (6)
- FiscalPeriod, Budget, BudgetLine, Payment, Expense, CostAllocation

### Repositories (6)
- `FiscalPeriodRepository` — `findCurrent()`, `findByStatus()`, `findOpen()`
- `BudgetRepository` — `findByPeriod()`, `findByAccount()`, `findOverBudget()`
- `BudgetLineRepository` — `findByBudget()`, `findByMonth()`
- `PaymentRepository` — `findByType()`, `findByParty()`, `findByStatus()`, `findUnposted()`
- `ExpenseRepository` — `findByEmployee()`, `findByCostCenter()`, `findByStatus()`
- `CostAllocationRepository`

### Services
- `FiscalPeriodService` — Open/close periods, prevent posting to closed periods
- `BudgetService` — CRUD, variance calculation, over-budget alerts
- `PaymentService` — Create/approve/post payments, create journal entries
- `ExpenseService` — Submit/approve/reject expenses

### Payment Flow
```
Payment Created (draft) → Approved → Posted → Journal Entry + GL Entry
Payment Types: payment (vendor), receipt (customer), expense, refund
Payment Methods: cash, bank_transfer, cheque, card
```

### Hooks
| Hook | Purpose |
|---|---|
| `useFiscalPeriods()` | Fiscal period list |
| `useBudgets(periodId?)` | Budget list |
| `usePayments(filters?)` | Payment list |
| `useExpenses(filters?)` | Expense list |
| `usePaymentPost()` | Post payment to GL |

### Pages
| Page | Route | Permission |
|---|---|---|
| FiscalPeriodPage | `/finance/fiscal-periods` | `finance.fiscalPeriod.view` |
| BudgetListPage | `/finance/budgets` | `finance.budget.view` |
| PaymentListPage | `/finance/payments` | `finance.payment.view` |
| ExpenseListPage | `/finance/expenses` | `finance.expense.view` |

### Tests
- `fiscalPeriod.test.ts` — Open/close, posting validation
- `budget.test.ts` — CRUD, variance, over-budget detection
- `payment.test.ts` — Status workflow, GL posting
- `expense.test.ts` — Submit, approval, posting

---

## 2. Assets Module

**Path**: `src/modules/assets/`
**Purpose**: Asset categories, asset registry, depreciation runs, GL export.

### Models (5)
- AssetCategory, Asset, DepreciationRun, DepreciationEntry, AssetGLExport

### Repositories (5)
- `AssetCategoryRepository` — CRUD, find by depreciation method
- `AssetRepository` — `findByCategory()`, `findByStatus()`, `findFullyDepreciated()`
- `DepreciationRunRepository` — `findByPeriod()`, `findPosted()`
- `DepreciationEntryRepository` — `findByRun()`, `findByAsset()`
- `AssetGLExportRepository`

### Services
- `AssetService` — CRUD, asset number generation
- `DepreciationService` — Run depreciation, calculate per-asset depreciation
- `AssetDepreciationGLExportService` — Export depreciation to journal entries

### Depreciation Calculation
```
Straight Line: (Cost - SalvageValue) / UsefulLife / 12 (per month)
Declining Balance: BookValue × (2 / UsefulLife) / 12 (per month)
Depreciation stops when: BookValue <= SalvageValue
```

### Hooks
| Hook | Purpose |
|---|---|
| `useAssets(filters?)` | Asset list |
| `useAssetById(id)` | Single asset detail |
| `useDepreciationRuns(filters?)` | Depreciation run list |
| `useDepreciationRun()` | Process depreciation |

### Pages
| Page | Route | Permission |
|---|---|---|
| AssetCategoryPage | `/assets/categories` | `assets.category.view` |
| AssetListPage | `/assets/list` | `assets.asset.view` |
| AssetDetailPage | `/assets/:id` | `assets.asset.view` |
| DepreciationRunPage | `/assets/depreciation` | `assets.depreciation.view` |

### Tests
- `asset.test.ts` — CRUD, number generation
- `depreciation.test.ts` — Straight line, declining balance, stop conditions
- `assetGLExport.test.ts` — Journal entry creation

---

## 3. Projects Module

**Path**: `src/modules/projects/`
**Purpose**: Project management, task tracking, phases, cost tracking, GL export.

### Models (5)
- Project, ProjectTask, ProjectPhase, ProjectCost, ProjectGLExport

### Repositories (5)
- `ProjectRepository` — `findByStatus()`, `findByCustomer()`, `findActive()`
- `ProjectTaskRepository` — `findByProject()`, `findByAssignee()`, `findByStatus()`
- `ProjectPhaseRepository` — `findByProject()`
- `ProjectCostRepository` — `findByProject()`, `findByAccount()`
- `ProjectGLExportRepository`

### Services
- `ProjectService` — CRUD, project number generation, cost calculation
- `ProjectTaskService` — CRUD, status transitions, hour tracking
- `ProjectGLExportService` — Export project costs to journal entries

### Project Cost Tracking
```
Budget: Set at project level
Actual Cost: Sum of all ProjectCost records
Variance: Budget - ActualCost
Profitability: Revenue - ActualCost (for customer projects)
```

### Hooks
| Hook | Purpose |
|---|---|
| `useProjects(filters?)` | Project list |
| `useProjectById(id)` | Single project with tasks and costs |
| `useProjectTasks(projectId)` | Task list |
| `useProjectCosts(projectId)` | Cost list |
| `useProjectPost()` | Post project costs to GL |

### Pages
| Page | Route | Permission |
|---|---|---|
| ProjectListPage | `/projects/list` | `projects.project.view` |
| ProjectDetailPage | `/projects/:id` | `projects.project.view` |
| ProjectTaskPage | `/projects/:id/tasks` | `projects.task.view` |

### Tests
- `project.test.ts` — CRUD, number generation, cost calculation
- `projectTask.test.ts` — Status workflow, hour tracking
- `projectGLExport.test.ts` — Journal entry creation
