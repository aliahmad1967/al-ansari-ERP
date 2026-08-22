# AL-ANSARI ERP — Systems Overview

## 1. Purpose

AL-ANSARI ERP is a **modular, offline-first, Arabic-first Enterprise Resource Planning system** built for businesses operating in Saudi Arabia. It runs as a desktop Electron application backed by a local Realm database, with a future cloud synchronization layer planned.

## 2. Core Design Principles

| Principle | Description |
|---|---|
| **Offline-First** | Every feature works without network connectivity. Realm DB is the single source of truth locally. |
| **Arabic-First** | Arabic (RTL) is the primary UI language. English (LTR) fully supported via i18n. |
| **Layered Architecture** | UI → Components → Hooks → Services → Repositories → Realm. No direct Realm access from components. |
| **Modular** | Each ERP domain is an independent module with its own models, repositories, services, hooks, components, pages, and tests. |
| **Financial Integrity** | All monetary calculations use the Money utility class with integer-fils arithmetic to prevent floating-point errors. |
| **Auditability** | All significant operations (create, update, delete, approve, post) are logged to AuditTrail with user identity and timestamps. |
| **Extensible** | Adding a new module follows a repeatable pattern: Model → Repository → Service → Hook → UI. |

## 3. Technology Stack

| Layer | Technology |
|---|---|
| **UI Framework** | React 19 |
| **Language** | TypeScript 6 (strict mode) |
| **Build Tool** | Vite 8 |
| **Database** | Realm (local, offline-first) |
| **Desktop Runtime** | Electron 43 |
| **Styling** | TailwindCSS 4 |
| **Internationalization** | i18next + react-i18next |
| **State Management** | Zustand 5 (for auth and UI state) |
| **Routing** | React Router 7 |
| **Testing** | Vitest 4 + React Testing Library 16 |
| **Data Import/Export** | Papa Parse (CSV), SheetJS/xlsx (Excel) |
| **PDF Generation** | jsPDF |
| **Utilities** | Lodash, date-fns, uuid, zod |

## 4. Key Statistics

| Metric | Value |
|---|---|
| Production dependencies | 15 |
| Development dependencies | 14 |
| Realm models | 94 |
| Domain modules | 17 |
| Repositories | 96 (including BaseRepository) |
| Services | 60+ |
| Custom hooks | 73 |
| Routes | 69 |
| UI components | 25+ reusable, 68 page-level |
| Test files | 46 |
| Test suites | 47 (653 individual tests) |
| i18n namespaces | 20 |
| Schema migrations | 7 (version 8) |

## 5. Module Inventory

| Module | Domain |
|---|---|
| `organization` | Companies, branches, cost centers, warehouses, units |
| `hr` | Employees, departments, positions, contracts, shifts, leave |
| `attendance` | Attendance records, shifts, schedules, assignments |
| `payroll` | Payroll runs, earnings, deductions, payslips, GL export |
| `inventory` | Items, stock movements, stock balances, warehouses, cycles |
| `procurement` | Purchase orders, goods receipts, vendor evaluation |
| `sales` | Customers, quotations, sales orders, deliveries, invoices |
| `accounting` | Chart of accounts, journals, GL entries, trial balance, statements |
| `finance` | Fiscal periods, budgets, payments, expenses, cost allocations |
| `assets` | Asset categories, assets, depreciation runs, GL export |
| `projects` | Projects, project tasks, phases, GL export |
| `workflow` | Multi-level approvals, GL mappings, document sequences |
| `notifications` | Notification center, real-time alerts |
| `reports` | Report templates, generation, export (PDF/CSV/Excel) |
| `settings` | System config, preferences, permissions, roles, users |
| `data-management` | Backup/restore, import/export, system info |
| `dashboard` | Real-time KPIs, analytics, recent activity |
| `auth` | Login, authentication, session management |

## 6. Deployment Target

- **Current**: Electron desktop application (Windows, macOS, Linux)
- **Database**: Local Realm instance per user/machine
- **Future**: Cloud synchronization layer (architecture designed to support this without UI changes)

## 7. Documentation Structure

This documentation is organized into 12 sections:

1. **Overview** — System purpose, goals, glossary, roadmap
2. **Architecture** — Technology, folder structure, data flow, naming, patterns, build
3. **Database** — Schema, models, migrations, ER diagrams, seed data
4. **Modules** — Per-module documentation (models, repos, services, hooks, tests)
5. **Security** — Authentication, authorization, encryption, audit
6. **Business Processes** — End-to-end workflows (procure-to-pay, order-to-cash, etc.)
7. **UI/UX** — Design system, components, pages, layouts, accessibility
8. **Development** — Setup, coding standards, testing, debugging
9. **Deployment** — Build, distribution, environment, monitoring
10. **User Guide** — Per-role guides, tutorials, FAQ
11. **API** — Service interfaces, hooks, Realm operations
12. **Reference** — Data dictionary, constants, config, change history
