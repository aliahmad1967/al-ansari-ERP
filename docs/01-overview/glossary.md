# Glossary

## 1. Currency & Financial Terms

| Term | Definition |
|---|---|
| **SAR** | Saudi Riyal — the primary currency of the system |
| **Fils** | Subunit of SAR. 1 SAR = 100 fils. All internal monetary calculations use integer fils. |
| **Money** | A utility class (`src/core/utils/money.ts`) that stores monetary values as integer fils to prevent floating-point rounding errors. |
| **GL** | General Ledger — the central accounting ledger recording all financial transactions. |
| **Journal Entry** | A recorded financial transaction in the accounting system, consisting of debits and credits. |
| **Trial Balance** | A report listing all GL account balances to verify that total debits equal total credits. |
| **Chart of Accounts** | The organized list of all financial accounts used by the organization. |
| **Fiscal Period** | An accounting period (typically a month or year) during which transactions are recorded. |
| **Depreciation** | The systematic allocation of an asset's cost over its useful life. |
| **End-of-Service Benefit** | Saudi labor law-mandated severance payment calculated based on service duration and salary. |

## 2. ERP Domain Terms

| Term | Definition |
|---|---|
| **PO** | Purchase Order — a document sent to a vendor to purchase goods or services. |
| **GRN** | Goods Received Note — a document confirming receipt of goods from a vendor. |
| **SO** | Sales Order — a customer order for goods or services. |
| **DN** | Delivery Note — a document accompanying shipped goods. |
| **Quotation** | A price proposal sent to a customer before a sales order. |
| **Credit Note** | A document issued to reduce the amount owed by a customer. |
| **Requisition** | An internal request to purchase goods or services. |
| **Cost Center** | An organizational unit that incurs costs, used for internal accounting. |
| **Warehouse** | A physical location where inventory is stored. |
| **SKU** | Stock Keeping Unit — a unique identifier for each distinct product. |

## 3. Technical Terms

| Term | Definition |
|---|---|
| **Realm** | The local NoSQL database used for offline-first data persistence. |
| **Offline-First** | An architecture pattern where the application works fully without network, syncing later when available. |
| **Precache** | A Service Worker strategy that pre-downloads and caches static assets for offline use. |
| **Schema Version** | A number tracking the Realm database structure. Migrations run when the version increases. |
| **Migration** | A function that transforms data from one schema version to the next when the database structure changes. |
| **BaseRepository** | An abstract class providing CRUD operations, pagination, search, and export for all domain repositories. |
| **Service Layer** | Contains business logic, validation orchestration, and workflow rules. Calls repositories. |
| **Repository Layer** | Contains database access logic (Realm queries and writes). No business logic. |
| **Hook Layer** | React integration layer providing state management and calling services. No direct Realm access. |
| **Zustand** | A lightweight state management library used for authentication and UI state. |
| **i18next** | An internationalization framework supporting Arabic (RTL) and English (LTR). |
| **Vite** | The build tool and development server for the React application. |
| **Electron** | A framework for building desktop applications with web technologies (HTML/CSS/JS). |

## 4. Architecture Terms

| Term | Definition |
|---|---|
| **Layered Architecture** | The enforced pattern: UI → Hooks → Services → Repositories → Realm. |
| **Module Boundary** | Each ERP domain is isolated with its own models, repos, services, hooks, and tests. |
| **Cross-Module Transaction** | Business operations affecting multiple modules, coordinated through the service layer. |
| **Audit Trail** | An immutable log of all significant operations for compliance and debugging. |
| **RBAC** | Role-Based Access Control — permissions assigned to roles, roles assigned to users. |
| **Permission String** | A dot-separated permission identifier (e.g., `hr.employee.create`). |
| **Seed Data** | Initial data loaded into the database on first run (roles, permissions, default config). |

## 5. Testing Terms

| Term | Definition |
|---|---|
| **Unit Test** | Tests a single function or class in isolation. |
| **Integration Test** | Tests multiple components working together (e.g., service + repository). |
| **E2E Test** | End-to-end test simulating a full user workflow. |
| **Test Suite** | A collection of related test cases organized in a single file. |
| **Vitest** | The testing framework used for unit and integration tests. |
