# AL-ANSARI ERP

Offline-first enterprise resource planning system built with React, TypeScript, and Realm.

## Features

### Core Modules
- **Organization** — Multi-branch structure, departments, positions, users, roles, permissions
- **HR** — Employee management, contracts, documents, skills, education, experience
- **Attendance** — Clock-in/out, shift management, overtime tracking
- **Payroll** — Salary structures, payroll runs, payslips, tax calculations
- **Inventory** — Products, warehouses, stock management, movements, transfers, adjustments
- **Procurement** — Suppliers, purchase requests, POs, goods receipts, supplier invoices
- **Sales** — Customers, quotations, sales orders, deliveries, invoices, payments, returns
- **Accounting** — Chart of accounts, journal entries, fiscal years, cost centers, budgets, trial balance, P&L, balance sheet
- **Assets** — Fixed asset management, depreciation, transfers, disposals, maintenance
- **Projects** — Project management, tasks, milestones, timesheets, cost tracking
- **Reports** — Cross-module analytics and reporting
- **Workflow** — Configurable approval workflows
- **Notifications** — In-app notification system
- **Settings** — Application configuration
- **Data Management** — Backup, restore, import, export

### Technical Features
- **Offline-first** — Full functionality without network connectivity
- **PWA** — Installable as a Progressive Web App with service worker caching
- **RTL/LTR** — Complete Arabic (RTL) and English (LTR) support
- **Dark/Light Theme** — System-aware theme switching
- **Responsive** — Desktop sidebar + mobile navigation
- **Accessible** — ARIA labels, keyboard navigation, focus management
- **Tested** — 653+ test cases across 47 test suites

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript 6 |
| Build | Vite 8 |
| Styling | Tailwind CSS v4 |
| Database | Realm (Node.js) |
| i18n | i18next (Arabic + English) |
| Validation | Zod v4 |
| Financial Math | decimal.js |
| Testing | Vitest |

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build

# Lint
npm run lint
```

## Architecture

```
UI (React Components)
    ↓
Hooks (React integration)
    ↓
Services (business logic)
    ↓
Repositories (database access)
    ↓
Realm (persistence)
```

See [docs/architecture/overview.md](docs/architecture/overview.md) for detailed architecture documentation.

## Documentation

- [Architecture Overview](docs/architecture/overview.md)
- [Database Architecture](docs/architecture/database.md)
- [Security Architecture](docs/architecture/security.md)
- [Module Architecture](docs/architecture/modules.md)

## Project Status

**Version:** 0.1.0 (Phase 024 — Production Review)
**Status:** Pre-production — see [CHANGELOG.md](CHANGELOG.md) for details

## License

Private — AL-ANSARI ERP
