# Technical Reference

## 1. Constants

### 1.1 Currency
```typescript
DEFAULT_CURRENCY = 'SAR'
CURRENCY_SUBUNIT = 100  // 1 SAR = 100 fils
```

### 1.2 Status Values
| Entity | Statuses |
|---|---|
| Employee | `active`, `terminated`, `onLeave`, `suspended` |
| Purchase Order | `draft`, `pending_approval`, `approved`, `partial`, `received`, `cancelled` |
| Sales Order | `draft`, `pending_approval`, `approved`, `partial`, `delivered`, `invoiced`, `cancelled` |
| Payroll Run | `draft`, `processing`, `completed`, `cancelled` |
| Journal Entry | `draft`, `posted`, `void` |
| Payment | `draft`, `approved`, `posted`, `cancelled` |
| Expense | `draft`, `pending_approval`, `approved`, `rejected`, `posted` |
| Approval Request | `pending`, `approved`, `rejected`, `cancelled` |

### 1.3 Entity Types (Workflow)
```
PurchaseOrder, PurchaseRequisition, GoodsReceipt,
SalesOrder, SalesInvoice, Quotation,
Expense, Payment, PayrollRun
```

### 1.4 Document Number Prefixes
| Entity | Prefix | Example |
|---|---|---|
| Purchase Order | PO- | PO-2026-00001 |
| Sales Invoice | SI- | SI-2026-00001 |
| Payroll Run | PAY- | PAY-2026-00001 |
| Journal Entry | JE- | JE-2026-00001 |
| Goods Receipt | GR- | GR-2026-00001 |
| Delivery Note | DN- | DN-2026-00001 |
| Asset | AST- | AST-2026-00001 |
| Project | PRJ- | PRJ-2026-00001 |

## 2. Configuration Keys

### 2.1 SystemConfig
| Key | Default | Description |
|---|---|---|
| `company.name` | AL-ANSARI | Company name |
| `currency.default` | SAR | Default currency |
| `date.format` | DD/MM/YYYY | Date format |
| `language.default` | ar | Default language |
| `payroll.gosi.employee_rate` | 11 | GOSI employee % |
| `payroll.gosi.employer_rate` | 12 | GOSI employer % |
| `payroll.work_days_per_month` | 30 | Standard working days |

## 3. Schema Version

Current version: **8**

See [03-database/migrations.md](../03-database/migrations.md) for migration history.

## 4. Dependencies

### 4.1 Production Dependencies
| Package | Version | Purpose |
|---|---|---|
| react | 19.x | UI framework |
| react-dom | 19.x | DOM rendering |
| react-router | 7.x | Routing |
| realm | 12.x | Database |
| zustand | 5.x | State management |
| i18next | 25.x | Internationalization |
| react-i18next | 16.x | React i18n |
| zod | 4.x | Validation |
| lodash | 4.17.x | Utilities |
| date-fns | 4.1.x | Date utilities |
| uuid | 11.x | UUID generation |
| papaparse | 5.5.x | CSV handling |
| xlsx | 0.18.x | Excel handling |
| jspdf | 3.0.x | PDF generation |
| react-hot-toast | 2.5.x | Toast notifications |

### 4.2 Dev Dependencies
| Package | Version | Purpose |
|---|---|---|
| typescript | 6.x | Type checking |
| vite | 8.x | Build tool |
| vitest | 4.x | Testing |
| @testing-library/react | 16.x | Component testing |
| eslint | 9.x | Linting |
| tailwindcss | 4.x | Styling |

## 5. File Paths

### 5.1 Core Files
| File | Path |
|---|---|
| Entry point | `src/main.tsx` |
| Root component | `src/App.tsx` |
| Routes | `src/app/routes.tsx` |
| Database manager | `src/core/database/database-manager.ts` |
| Migrations | `src/core/database/migrations.ts` |
| Realm config | `src/core/database/realm.config.ts` |
| Seed data | `src/core/database/seed.ts` |
| Base repository | `src/core/repositories/BaseRepository.ts` |
| Money utility | `src/core/utils/currency.ts` |
| Auth store | `src/stores/authStore.ts` |
| UI store | `src/stores/uiStore.ts` |
| i18n setup | `src/i18n/index.ts` |
| Service Worker | `public/sw.js` |

### 5.2 Security Files
| File | Path |
|---|---|
| Encryption | `src/core/security/encryption.ts` |
| Password | `src/core/security/password.ts` |
| Permissions | `src/core/security/permissions.ts` |
| Roles | `src/core/security/roles.ts` |
| Session | `src/core/security/session.ts` |
| Access | `src/core/security/access.ts` |

## 6. Change History

See [CHANGELOG.md](../../CHANGELOG.md) for complete version history.

### Recent Phases
| Phase | Description |
|---|---|
| Phase 023 | Offline-First PWA (Service Worker, precache, offline detection) |
| Phase 024 | Production Readiness (architecture review, documentation) |
| Phase 025 | Documentation System (this documentation) |

## 7. Known Issues

| Issue | Status | Impact |
|---|---|---|
| 103 TypeScript errors | OPEN | Build fails (workflow module broken imports) |
| 20 ESLint errors | OPEN | Code quality |
| 69 ESLint warnings | OPEN | Code quality |
| ReportService bypasses repository | OPEN | Architecture violation |
| 30+ hooks use localStorage | OPEN | Should use Realm/Zustand |
| Floating-point in 6+ services | OPEN | Financial accuracy risk |

## 8. Future Work

See [01-overview/roadmap.md](../01-overview/roadmap.md) for planned phases.

## 9. Git Information

| Property | Value |
|---|---|
| Remote | `https://github.com/aliahmad1967/al-ansari-ERP.git` |
| Branch | `main` |
| Latest commit | `cdd371c` |
