# Changelog

All notable changes to AL-ANSARI ERP are documented here.

## [0.1.0] — 2026-08-20 — Phase 024: Production Review

### Architecture Documentation
- Created `docs/architecture/overview.md` — system architecture, layered design, directory structure
- Created `docs/architecture/database.md` — Realm configuration, schema, repositories, migrations
- Created `docs/architecture/security.md` — authentication, RBAC, encryption, audit logging
- Created `docs/architecture/modules.md` — module inventory, dependencies, test coverage
- Updated `README.md` with feature list, tech stack, and getting started guide

### Production Readiness Review
- Comprehensive review across 30 evaluation areas
- 103 TypeScript errors identified (workflow module, assets, data-management)
- 89 ESLint errors (20 errors, 69 warnings)
- 653/653 tests passing across 47 test suites
- Build succeeds with warnings

### Known Issues Documented
- Workflow module has broken imports (15 module-not-found errors)
- ReportService bypasses repository layer (direct Realm access)
- Floating-point arithmetic in 6+ financial services
- 30+ hooks use localStorage instead of Realm
- Missing confirmation dialogs on some destructive operations
- 8 modules with zero test coverage
- Client-side authorization only (no server enforcement)

---

## [0.1.0] — 2026-08-20 — Phase 023: Offline-First PWA

### Added
- **Service Worker** — Versioned caching (v2) with automatic old-cache purging
- **Precache Manifest** — Vite plugin auto-generates manifest from build output (267 URLs)
- **Network Store** — Preflight connectivity checks with `confirmedOnline` state
- **Database Readiness** — Store + hook for tracking Realm initialization
- **AppLoading Component** — Full-screen loading overlay during database init
- **OfflineIndicator** — Recovery toast on reconnection, preflight confirmation
- **SW Registration** — Version tracking, cache management messages

### Changed
- Enhanced `network.store.ts` with periodic connectivity monitoring (30s interval)
- Enhanced `useNetwork.ts` hook with `confirmedOnline` and `preflight()` 
- Enhanced `service-worker.ts` with version management and cache clearing
- Enhanced `OfflineIndicator.tsx` with recovery toast and connection status
- Updated `AppProviders.tsx` to auto-initialize Realm on startup
- Updated `AppLayout.tsx` to render AppLoading during database init
- Added i18n keys: `appLoading.*`, `update.*` (EN + AR)

---

## [0.1.0] — 2026-08-15 — Phase 022: Reporting & Analytics

### Added
- Cross-module reporting service
- Dashboard with charts and KPIs
- HR, inventory, procurement, sales, and asset reports
- Analytics page with trend visualizations

---

## [0.1.0] — 2026-08-10 — Phase 021: Workflow Engine

### Added
- Configurable approval workflows
- Workflow definitions and instances
- Step-based approval with action buttons
- Notification integration for approvers

---

## [0.1.0] — 2026-08-05 — Phase 020: Notifications & Settings

### Added
- In-app notification system
- Notification store and hooks
- Application settings module
- Data management module (backup/restore/import/export)

---

## [0.1.0] — 2026-07-30 — Phase 019: Projects Module

### Added
- Project management (CRUD, status tracking)
- Project tasks with assignments
- Milestones and timesheets
- Project budgets and cost tracking

---

## [0.1.0] — 2026-07-25 — Phase 018: Fixed Assets Module

### Added
- Fixed asset management
- Asset categories and locations
- Depreciation schedules (straight-line)
- Asset transfers and disposals
- Asset maintenance tracking

---

## [0.1.0] — 2026-07-20 — Phase 017: Sales Module

### Added
- Customer management
- Quotation → Sales Order → Delivery → Invoice workflow
- Customer payments and returns
- Sales reports and analytics

---

## [0.1.0] — 2026-07-15 — Phase 016: Accounting Module

### Added
- Chart of accounts with groups
- Double-entry journal entries
- Fiscal years and periods
- Cost centers and budgets
- Trial balance, P&L, balance sheet
- Posting service for automated entries

---

## [0.1.0] — 2026-07-10 — Phase 015: Procurement Module

### Added
- Supplier management
- Purchase requests and approvals
- Purchase orders with workflow
- Goods receipts
- Supplier invoices and payments

---

## [0.1.0] — 2026-07-05 — Phase 014: Inventory Module

### Added
- Product catalog with categories and units
- Warehouse management
- Stock balances and movements
- Stock transfers between warehouses
- Stock adjustments and inventory counts
- Inventory reports

---

## [0.1.0] — 2026-06-30 — Phase 013: Payroll Module

### Added
- Salary structures with components
- Payroll periods and runs
- Payslip generation
- Payroll calculation engine (decimal.js)
- Leave management integration

---

## [0.1.0] — 2026-06-25 — Phase 012: Attendance Module

### Added
- Clock-in/clock-out tracking
- Shift management
- Leave types and balances
- Leave request workflow
- Attendance reports

---

## [0.1.0] — 2026-06-20 — Phase 011: HR Module

### Added
- Employee management
- Employment contracts
- Employee documents
- Emergency contacts
- Education, experience, skills

---

## [0.1.0] — 2026-06-15 — Phase 010: Organization Module

### Added
- Multi-branch organization structure
- Departments and positions
- User management
- Roles and permissions (RBAC)
- Audit logging

---

## [0.1.0] — 2026-06-10 — Phase 001–009: Foundation

### Added
- React + TypeScript + Vite project setup
- Tailwind CSS v4 configuration
- Realm database integration
- BaseRepository with transactions
- Authentication and session management
- Encryption and password hashing
- i18n (Arabic + English)
- RTL/LTR layout support
- Dark/light theme
- Responsive sidebar navigation
- Reusable UI component library (25+ components)
- Form validation with Zod
- Toast notification system
- Error boundary
- Protected routes with permission checks
