# System Goals & Objectives

## 1. Primary Goals

### 1.1 Offline-First ERP
Build a fully functional ERP system that operates without internet connectivity. All business processes — procurement, sales, accounting, HR, payroll, inventory — must work entirely on the local Realm database. A future sync layer will be added without changing the UI or business modules.

### 1.2 Arabic-First Localization
Provide a native Arabic (RTL) experience as the primary interface, with full English (LTR) support. Every user-facing string uses i18n. Date formats, number formatting, and text direction are adapted per locale.

### 1.3 Modular Architecture
Each ERP domain is an isolated module (`hr`, `inventory`, `accounting`, etc.) with its own models, repositories, services, hooks, and tests. Modules communicate through service-layer interfaces, never through direct database cross-references.

### 1.4 Financial Accuracy
All monetary calculations use integer-fils arithmetic (SAR subunits) via the `Money` utility class. No floating-point arithmetic is used for money. This prevents rounding errors in invoices, payroll, and accounting entries.

### 1.5 Auditability
Every significant business operation — create, update, delete, approve, reject, post, cancel — is logged with user identity, timestamp, and before/after state. Audit logs are immutable and queryable.

### 1.6 Data Integrity
Business operations that span multiple records (e.g., posting a purchase order creating goods receipt + stock movement + journal entries) use Realm transactions to ensure atomicity. Partial updates to related ERP records are never allowed.

## 2. Business Objectives

| Objective | How It's Addressed |
|---|---|
| Saudi market compliance | Arabic-first, SAR currency, Islamic calendar support |
| Small-to-medium business needs | Modular — businesses can use only what they need |
| Data ownership | All data stored locally on the user's machine |
| Low operating cost | No cloud infrastructure required for core functionality |
| Regulatory compliance | Audit trails, approval workflows, role-based access |
| Multi-entity support | Organization module supports multiple companies, branches, warehouses |

## 3. Technical Objectives

| Objective | Implementation |
|---|---|
| Type safety | TypeScript strict mode, no `any`, no `@ts-ignore` |
| Testability | Every module has unit tests for services, integration tests for repositories |
| Maintainability | Consistent naming conventions, layered architecture, no code duplication |
| Performance | Lazy loading, optimistic updates, virtual scrolling for large lists |
| Extensibility | Adding a new module follows a repeatable pattern |
| Security | AES-256 encryption for sensitive data, bcrypt password hashing, session management |

## 4. Non-Goals (Current Phase)

| Non-Goal | Rationale |
|---|---|
| Cloud synchronization | Architecture supports it, but not implemented yet |
| Mobile app | Current target is Electron desktop |
| Multi-user concurrent editing | Single-user local-first model |
| Real-time collaboration | Not required for current use case |
| Custom reporting engine | Reports use templates; advanced BI is future work |
