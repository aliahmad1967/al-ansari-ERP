# Data Flow & Request Lifecycle

## 1. Layered Architecture

The system enforces a strict unidirectional data flow:

```
┌─────────────────────────────────────────────────────┐
│  UI Layer (Components / Pages)                      │
│  - Renders HTML via React components                │
│  - Handles user events (clicks, inputs)             │
│  - Calls hooks for data and actions                 │
│  - NO direct database access                        │
└──────────────────────┬──────────────────────────────┘
                       │ calls
                       ▼
┌─────────────────────────────────────────────────────┐
│  Hook Layer (React Hooks)                           │
│  - Manages component state (useState, useReducer)   │
│  - Calls service methods                            │
│  - Transforms data for UI consumption               │
│  - NO direct Realm access                           │
└──────────────────────┬──────────────────────────────┘
                       │ calls
                       ▼
┌─────────────────────────────────────────────────────┐
│  Service Layer (Business Logic)                     │
│  - Validates business rules                         │
│  - Orchestrates workflows                           │
│  - Coordinates cross-module transactions            │
│  - Calls repository methods                         │
│  - NO UI logic                                      │
└──────────────────────┬──────────────────────────────┘
                       │ calls
                       ▼
┌─────────────────────────────────────────────────────┐
│  Repository Layer (Data Access)                     │
│  - Realm queries and writes                         │
│  - CRUD operations via BaseRepository               │
│  - Pagination, search, filtering                    │
│  - NO business logic                                │
└──────────────────────┬──────────────────────────────┘
                       │ reads/writes
                       ▼
┌─────────────────────────────────────────────────────┐
│  Realm Database (Persistence)                       │
│  - Local NoSQL database                             │
│  - Schema version 8 (7 migrations)                  │
│  - 94 object models                                 │
│  - Transactions for atomic writes                   │
└─────────────────────────────────────────────────────┘
```

## 2. Typical Request Flow

### Example: Creating a Purchase Order

```
User fills form → Component validates (Zod) → calls usePurchaseOrder.create()
  → PurchaseOrderService.create(poData)
    → Validates business rules (vendor exists, items valid, amounts correct)
    → Generates document number (documentSequence)
    → Repository.create(realm, poData)
      → Realm.write { realm.create('PurchaseOrder', poData) }
    → AuditService.log({ action: 'CREATE', entity: 'PurchaseOrder', ... })
    → NotificationService.notify({ ... })
  → Returns created entity
  → Hook updates local state
  → Component re-renders with new data
  → Toast shows success message
```

### Example: Posting a Goods Receipt

```
User clicks "Post" → Component calls useGoodsReceipt.post(id)
  → GoodsReceiptService.post(id)
    → Validates: status must be 'approved', items exist
    → Realm.write transaction begins:
      1. Update GoodsReceipt status → 'posted'
      2. Create StockMovement records (one per item line)
      3. Update StockBalance records (quantity, value)
      4. Create JournalEntry records (debit/credit)
      5. Update GLAccount balances
      6. Log audit trail
    → Realm.write transaction commits (atomic)
    → NotificationService.notify({ ... })
  → Returns updated entity
  → Hook updates local state
  → Component re-renders
```

## 3. State Management

### Zustand Stores (2 stores)

| Store | Purpose | State |
|---|---|---|
| `authStore` | Authentication & session | `user`, `isAuthenticated`, `permissions`, `login()`, `logout()` |
| `uiStore` | UI preferences | `sidebarCollapsed`, `theme`, `language`, `toggleSidebar()` |

### React State (per-component)

- `useState` for local UI state
- `useReducer` for complex state logic
- Custom hooks encapsulate stateful logic
- No global state beyond Zustand stores

## 4. Data Fetching Pattern

Since Realm is local (no network), data fetching is synchronous:

```
Hook calls Service → Service calls Repository → Repository queries Realm → Data returned synchronously
```

No loading states needed for data reads (Realm is fast local I/O). Loading states are used only for:
- Initial database initialization (via `DatabaseReadyGate`)
- Export operations (PDF/CSV/Excel generation)
- Backup/restore operations

## 5. Error Handling Flow

```
Component catches errors from hooks
  → Displays toast notification (react-hot-toast)
  → Logs technical details (console, safe for debugging)
  → Shows user-friendly translated message (i18n)
```

Service layer throws typed errors:
- `ValidationError` — business rule violations
- `NotFoundError` — entity not found
- `PermissionError` — insufficient permissions
- `DatabaseError` — Realm operation failures

Repository layer wraps Realm errors in `DatabaseError`.

## 6. Cross-Module Communication

Modules communicate through service-layer interfaces:

```
SalesModule → SalesService
                ├── calls InventoryService.checkStock()
                ├── calls AccountingService.createJournalEntry()
                └── calls NotificationService.notify()
```

Modules never directly import or call another module's repository or model.

## 7. Transaction Flow

Multi-step operations use Realm transactions:

```
TransactionManager.execute(realm, () => {
  // All writes here are atomic
  realm.create('StockMovement', ...)
  realm.create('StockBalance', ...)
  realm.create('JournalEntry', ...)
  realm.create('AuditTrail', ...)
})
```

If any write fails, all writes are rolled back.

## 8. Authentication Flow

```
Login Page → calls useAuth.login(credentials)
  → AuthService.authenticate(username, password)
    → UserRepository.findByUsername(username)
    → PasswordService.verify(password, hashedPassword)
    → SessionService.createSession(user)
    → AuthStore.setState({ user, isAuthenticated, permissions })
  → Redirect to dashboard
```

Session persistence: stored in Zustand (in-memory). On app restart, user must re-login.

## 9. Offline Flow

```
App starts → DatabaseReadyGate blocks UI
  → DatabaseManager.initialize()
    → Opens Realm (runs migrations if needed)
    → Seeds initial data if empty
  → DatabaseReadyGate unblocks UI
  → Service Worker precaches static assets
  → All operations work against local Realm
  → OfflineHealthBanner shows connectivity status
```
