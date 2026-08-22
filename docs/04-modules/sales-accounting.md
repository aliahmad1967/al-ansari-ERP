# Sales & Accounting Modules

---

## 1. Sales Module

**Path**: `src/modules/sales/`
**Purpose**: Customer management, quotations, sales orders, deliveries, invoicing.

### Models (8)
- Customer, Quotation, QuotationItem, SalesOrder, SalesOrderItem, DeliveryNote, DeliveryNoteItem, SalesInvoice, SalesInvoiceItem

### Repositories (9)
- `CustomerRepository` — `findAll()`, `search()`, `findOverdue()`
- `QuotationRepository` — `findByCustomer()`, `findByStatus()`
- `QuotationItemRepository`
- `SalesOrderRepository` — `findByCustomer()`, `findByStatus()`, `findPendingDelivery()`
- `SalesOrderItemRepository`
- `DeliveryNoteRepository` — `findBySalesOrder()`, `findUndelivered()`
- `DeliveryNoteItemRepository`
- `SalesInvoiceRepository` — `findByCustomer()`, `findByStatus()`, `findOverdue()`, `findUnpaid()`
- `SalesInvoiceItemRepository`

### Services
- `CustomerService` — CRUD, credit limit check
- `QuotationService` — Create/send/accept/reject/convert to SO
- `SalesOrderService` — Create/approve/process, track delivery status
- `DeliveryNoteService` — Create/ship/deliver, create stock movements
- `SalesInvoiceService` — Create/send/post, multi-currency, GL export

### Document Flow
```
Quotation → (accepted) → Sales Order → (shipped) → Delivery Note → (invoiced) → Sales Invoice → (posted) → Stock Movement + Journal Entry
```

### Multi-Currency Support
- SalesInvoice supports `currency` and `exchangeRate` fields
- All monetary calculations stored in the invoice's currency (fils)
- Conversion to base currency (SAR) handled at posting time

### Hooks
| Hook | Purpose |
|---|---|
| `useCustomers(filters?)` | Customer list |
| `useQuotations(filters?)` | Quotation list |
| `useSalesOrders(filters?)` | SO list |
| `useSalesInvoices(filters?)` | Invoice list |
| `useCustomerCreate()` | Create customer |
| `useInvoicePost()` | Post invoice + stock + GL |

### Pages
| Page | Route | Permission |
|---|---|---|
| CustomerListPage | `/sales/customers` | `sales.customer.view` |
| CustomerDetailPage | `/sales/customers/:id` | `sales.customer.view` |
| QuotationListPage | `/sales/quotations` | `sales.quotation.view` |
| SalesOrderListPage | `/sales/orders` | `sales.order.view` |
| SalesOrderDetailPage | `/sales/orders/:id` | `sales.order.view` |
| DeliveryNoteListPage | `/sales/deliveries` | `sales.delivery.view` |
| SalesInvoiceListPage | `/sales/invoices` | `sales.invoice.view` |
| SalesInvoiceDetailPage | `/sales/invoices/:id` | `sales.invoice.view` |

### Tests
- `customer.test.ts` — CRUD, credit limit
- `quotation.test.ts` — Status workflow, conversion
- `salesOrder.test.ts` — Processing, delivery tracking
- `deliveryNote.test.ts` — Shipping, stock movement creation
- `salesInvoice.test.ts` — Multi-currency, posting, GL entries

---

## 2. Accounting Module

**Path**: `src/modules/accounting/`
**Purpose**: Chart of accounts, journal entries, general ledger, trial balance, financial reports.

### Models (8)
- Account, JournalEntry, JournalEntryLine, GLEntry, TrialBalance, TrialBalanceLine, CashBookEntry, AccountStatement

### Repositories (8)
- `AccountRepository` — `findByType()`, `findHierarchy()`, `findByCode()`, `findBalance()`
- `JournalEntryRepository` — `findByDateRange()`, `findByStatus()`, `findByReference()`
- `JournalEntryLineRepository` — `findByJournalEntry()`, `findByAccount()`
- `GLEntryRepository` — `findByAccount()`, `findByDateRange()`, `findRunningBalance()`
- `TrialBalanceRepository`, `TrialBalanceLineRepository`
- `CashBookEntryRepository` — `findByAccount()`, `findByDateRange()`
- `AccountStatementRepository`

### Services
- `AccountService` — CRUD, hierarchy management, balance calculation
- `JournalEntryService` — Create/post/void journal entries, validate debits=credits
- `GLEntryService` — Post journal entries to GL, calculate running balances
- `TrialBalanceService` — Generate trial balance for a period
- `FinancialReportService` — Balance sheet, income statement, account statements

### Accounting Rules
```
Every JournalEntry must have: totalDebit == totalCredit
Every JournalEntryLine has either debit OR credit (not both)
GLEntry balance = running total (previous balance + debit - credit)
Trial Balance verifies: sum(all debits) == sum(all credits)
```

### Hooks
| Hook | Purpose |
|---|---|
| `useAccounts(filters?)` | Account list with hierarchy |
| `useJournalEntries(filters?)` | Journal entry list |
| `useJournalEntryById(id)` | Single JE with lines |
| `useTrialBalance(period)` | Generate trial balance |
| `useFinancialStatement(type, period)` | Balance sheet / income statement |
| `useAccountStatement(accountId, period)` | Account statement |

### Pages
| Page | Route | Permission |
|---|---|---|
| ChartOfAccountsPage | `/accounting/chart-of-accounts` | `accounting.account.view` |
| JournalEntryListPage | `/accounting/journal-entries` | `accounting.journal.view` |
| JournalEntryDetailPage | `/accounting/journal-entries/:id` | `accounting.journal.view` |
| TrialBalancePage | `/accounting/trial-balance` | `accounting.trialBalance.view` |
| BalanceSheetPage | `/accounting/balance-sheet` | `accounting.report.view` |
| IncomeStatementPage | `/accounting/income-statement` | `accounting.report.view` |
| AccountStatementPage | `/accounting/account-statement` | `accounting.account.view` |

### Tests
- `account.test.ts` — CRUD, hierarchy, balance calculation
- `journalEntry.test.ts` — Create, debit=credit validation, posting
- `glEntry.test.ts` — Posting, running balance
- `trialBalance.test.ts` — Generation, balance verification
- `financialReport.test.ts` — Balance sheet, income statement
