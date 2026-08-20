# AL-ANSARI ERP — Architecture Overview

## System Architecture

AL-ANSARI ERP is an offline-first enterprise resource planning system built as a React SPA with local Realm database persistence. The application follows a strict layered architecture designed for maintainability, testability, and future server synchronization.

### Technology Stack

| Layer | Technology |
|-------|-----------|
| UI Framework | React 19 + TypeScript 6 (strict mode) |
| Build Tool | Vite 8 (Rolldown bundler) |
| Styling | Tailwind CSS v4 |
| Routing | React Router DOM v7 |
| State Management | `useSyncExternalStore` (custom external stores) |
| Database | Realm (via Node.js runtime) |
| i18n | i18next + react-i18next (Arabic + English) |
| Validation | Zod v4 |
| Financial Math | decimal.js |
| PDF Generation | jsPDF + jsPDF-autotable |
| Excel Import/Export | xlsx |
| Charts | Recharts |
| Testing | Vitest + jsdom |
| Linting | ESLint + typescript-eslint |
| Formatting | Prettier |
| PWA | Custom service worker + Web App Manifest |

### Runtime Environment

The application targets **Electron** or a similar Node.js-powered desktop shell. Realm requires Node.js for native database access. The Vite configuration externalizes `realm` and `node:crypto` to prevent bundling issues. In a pure browser environment, the application degrades gracefully — the service worker caches the app shell, and Realm-dependent features are unavailable.

## Layered Architecture

```
UI (React Components / Pages)
    ↓
Hooks (React integration, state handling)
    ↓
Services (business logic, validation orchestration, workflow)
    ↓
Repositories (database access, Realm queries, transactions)
    ↓
Realm (persistence layer)
```

### Mandatory Rules

1. **Components** — UI only. No database logic, no business rules, no complex data transformations.
2. **Pages** — Compose components, connect hooks to UI. No direct database operations.
3. **Hooks** — React integration, state handling, calling services. No direct Realm access.
4. **Services** — Business logic, validation, workflow, transaction coordination. Calling repositories.
5. **Repositories** — Database access only. Realm queries and writes. Mapping entities when necessary.
6. **Realm** — Persistence layer only.

### Prohibited Patterns

- UI → Direct Realm manipulation
- Components directly creating, updating, deleting, or querying Realm objects
- Business logic in React components
- Duplicated business logic across modules
- Database operations outside repository layer

## Directory Structure

```
src/
├── app/                    # App shell (providers, router, layout, error boundary)
├── components/             # Shared UI components
│   ├── auth/               # ProtectedRoute, RequirePermission
│   ├── dashboard/          # Dashboard-specific components
│   ├── data-display/       # DataTable, EmptyState, etc.
│   ├── forms/              # FormField, FormActions, FileUpload
│   ├── layout/             # Sidebar, Topbar, MobileNavigation
│   └── ui/                 # 25+ reusable primitives (Button, Dialog, Table, Toast, etc.)
├── config/                 # App-wide constants and permission matrix
├── core/                   # Backend logic layer
│   ├── database/           # Realm engine, config, migrations, seed
│   ├── models/             # 116 Realm model files
│   ├── repositories/       # 96 repository files + BaseRepository
│   ├── services/           # Core services (Audit, Auth, Backup, Export, Import, etc.)
│   ├── security/           # Encryption, permissions, roles, session, password
│   └── utils/              # Currency, dates, formatting, generators, validation
├── hooks/                  # React hooks (useAuth, useNetwork, useDatabaseReady, etc.)
├── i18n/                   # i18next config + 20 translation namespaces (en + ar)
├── lib/                    # Utilities (cn, format, service-worker, logger)
├── modules/                # 17 ERP feature modules
│   ├── accounting/         # Chart of accounts, journal entries, fiscal years
│   ├── assets/             # Fixed assets, depreciation, transfers, disposals
│   ├── attendance/         # Clock-in/out, shifts, overtime
│   ├── auth/               # Login, password change
│   ├── dashboard/          # Dashboard with charts and KPIs
│   ├── data-management/    # Backup, restore, import, export
│   ├── finance/            # Shared financial services
│   ├── hr/                 # Employees, contracts, payroll
│   ├── inventory/          # Products, stock, warehouses, movements
│   ├── notifications/      # In-app notification system
│   ├── organization/       # Organizations, branches, departments, positions, users, roles
│   ├── procurement/        # Suppliers, POs, goods receipts
│   ├── projects/           # Projects, tasks, milestones, timesheets
│   ├── reports/            # Cross-module reporting and analytics
│   ├── sales/              # Customers, quotations, SOs, invoices, payments
│   ├── settings/           # App configuration
│   └── workflow/           # Approval workflows
├── stores/                 # External stores (useSyncExternalStore pattern)
├── styles/                 # CSS (globals, dark, RTL, print, variables)
├── types/                  # TypeScript type definitions
└── scripts/                # CLI scripts (backup, reset, seed, validate, generate-icons)
```

## Module Communication

Modules communicate through clearly defined service interfaces. Cross-module dependencies are minimized and must go through the service layer — never by importing another module's hooks or repositories directly.

Example cross-module transaction:
```
Sales Invoice (Sales Service)
    ├── Invoice Repository
    ├── Inventory Service (stock deduction)
    ├── Accounting Service (journal entry)
    └── Notification Service (notify stakeholders)
```

## Offline-First Design

The application is designed as offline-first:

1. **Local Realm database** is the authoritative data source
2. **Service worker** caches the app shell (HTML, CSS, JS) for offline access
3. **Preflight connectivity checks** detect captive portals and network issues
4. **No server dependency** for core functionality
5. **Future synchronization** is architecturally supported but not yet implemented

### Future Synchronization Architecture

```
UI → Hooks → Services → Repository Interface
                              ↓
                    Realm Repository (current)
                              ↓
                    Realm Repository + Sync Layer (future)
```

The repository interface abstraction allows swapping the Realm-only implementation for one that synchronizes with a remote server without touching the UI or business modules.

## Internationalization

- Every user-facing string uses i18n (`useTranslation` hook)
- Arabic = RTL, English = LTR
- Logical CSS properties (start/end) used throughout
- Language preference persisted in localStorage
- Document `lang` and `dir` attributes synced automatically

## Testing Strategy

- Unit tests colocated with source files (`*.test.ts`)
- 47 test suites, 653+ test cases
- Core financial calculations thoroughly tested
- Service layer tested with mock repositories
- Database transactions tested in-memory
