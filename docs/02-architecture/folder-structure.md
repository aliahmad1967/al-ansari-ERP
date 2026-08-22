# Folder Structure

## 1. Root Directory

```
D:\AL-ANSARI-ERP\
├── docs/                          # Documentation (this system)
├── public/                        # Static assets
│   ├── sw.js                      # Service Worker for offline caching
│   └── manifest.json              # PWA manifest
├── src/                           # Application source code
│   ├── app/                       # Application shell (routing, providers)
│   ├── components/                # Shared UI components
│   ├── config/                    # Application configuration
│   ├── core/                      # Core framework (database, models, repos, services, utils)
│   ├── hooks/                     # Shared React hooks
│   ├── i18n/                      # Internationalization (20 namespaces)
│   ├── lib/                       # Third-party library wrappers
│   ├── modules/                   # ERP domain modules (17 modules)
│   ├── stores/                    # Zustand stores (auth, UI)
│   ├── styles/                    # Global styles, TailwindCSS config
│   ├── types/                     # Shared TypeScript type definitions
│   ├── App.tsx                    # Root React component
│   ├── main.tsx                   # Application entry point
│   └── vite-env.d.ts              # Vite type declarations
├── index.html                     # HTML entry point
├── package.json                   # Dependencies and scripts
├── tsconfig.json                  # TypeScript configuration
├── vite.config.ts                 # Vite build configuration
├── tailwind.config.js             # TailwindCSS configuration
├── eslint.config.js               # ESLint configuration
├── CHANGELOG.md                   # Version history
├── README.md                      # Project overview
└── AGENTS.md                      # Architecture rules for AI agents
```

## 2. Source Code Structure

### `src/app/` — Application Shell

```
app/
├── routes.tsx                     # All 69 route definitions with auth/permissions
├── providers/
│   ├── AuthProvider.tsx           # Authentication context
│   ├── ThemeProvider.tsx          # Theme management
│   ├── DatabaseReadyGate.tsx      # Blocks UI until Realm is initialized
│   └── QueryProvider.tsx          # (Reserved for future React Query integration)
```

### `src/components/` — Shared UI Components

```
components/
├── AppLoading.tsx                 # Application loading screen
├── ErrorBoundary.tsx              # React error boundary
├── OfflineHealthBanner.tsx        # Shows offline status and recovery options
├── ErrorRecoveryToast.tsx         # Error recovery notification
├── Layout/
│   ├── MainLayout.tsx             # Main application layout with sidebar
│   ├── Header.tsx                 # Top navigation header
│   ├── Sidebar.tsx                # Side navigation menu
│   └── Footer.tsx                 # Footer bar
├── ui/                            # Primitives (Button, Input, Modal, Table, etc.)
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Select.tsx
│   ├── Modal.tsx
│   ├── Table.tsx
│   ├── Card.tsx
│   ├── Badge.tsx
│   ├── Tabs.tsx
│   ├── Pagination.tsx
│   ├── SearchInput.tsx
│   ├── LanguageSwitcher.tsx
│   ├── ThemeToggle.tsx
│   └── ...
├── forms/                         # Reusable form components
│   └── ...
└── reports/                       # Report rendering components
    └── ...
```

### `src/core/` — Core Framework

```
core/
├── database/                      # Database layer
│   ├── realm.ts                   # Realm instance singleton
│   ├── realm.config.ts            # Realm configuration
│   ├── database-manager.ts        # Database lifecycle management
│   ├── migrations.ts              # Schema migration functions (v1→v8)
│   ├── seed.ts                    # Initial seed data (roles, permissions)
│   ├── transactions.ts            # Transaction utilities
│   ├── index.ts                   # Module exports
│   ├── errors.ts                  # Database error handling
│   └── transactions.test.ts       # Transaction tests
├── models/                        # Realm object models (94 models)
│   ├── Organization.ts
│   ├── Company.ts
│   ├── Branch.ts
│   ├── Employee.ts
│   ├── Department.ts
│   ├── Position.ts
│   ├── ... (94 total)
│   └── WorkflowTemplate.ts
├── repositories/                  # Data access layer (96 repositories)
│   ├── BaseRepository.ts          # Abstract base with CRUD, pagination, search
│   ├── OrganizationRepository.ts
│   ├── EmployeeRepository.ts
│   ├── ... (95 total)
│   └── WorkflowTemplateRepository.ts
├── services/                      # Core services (12 services)
│   ├── AuditService.ts            # Audit trail logging
│   ├── AuthService.ts             # Authentication logic
│   ├── BackupService.ts           # Database backup/restore
│   ├── ExportService.ts           # CSV/Excel export
│   ├── ImportService.ts           # CSV/Excel import
│   ├── NotificationService.ts     # Notification management
│   ├── OfflineHealthService.ts    # Offline detection & recovery
│   ├── PermissionService.ts       # RBAC permission checking
│   ├── DevAuthService.ts          # Dev-mode authentication
│   ├── DevAttendanceService.ts    # Dev-mode attendance seeding
│   ├── DevEmployeeService.ts      # Dev-mode employee seeding
│   └── DevOrganizationService.ts  # Dev-mode organization seeding
├── security/                      # Security utilities
│   ├── encryption.ts              # AES-256 encryption/decryption
│   ├── password.ts                # Password hashing (bcrypt)
│   ├── permissions.ts             # Permission constants and checking
│   ├── roles.ts                   # Role definitions and management
│   ├── session.ts                 # Session management
│   └── access.ts                  # Access control utilities
└── utils/                         # Core utility functions
    ├── currency.ts                # SAR currency formatting
    ├── currency.test.ts
    ├── dates.ts                   # Date formatting (Hijri support)
    ├── formatting.ts              # Number/text formatting
    ├── generators.ts              # ID/document number generators
    ├── generators.test.ts
    ├── numbers.ts                 # Number utilities
    ├── numbers.test.ts
    ├── validation.ts              # Validation utilities
    └── validation.test.ts
```

### `src/modules/` — ERP Domain Modules (17 modules)

Each module follows this internal structure:

```
modules/{module-name}/
├── components/                    # Module-specific UI components
│   ├── {Entity}Form.tsx           # Create/edit forms
│   ├── {Entity}Table.tsx          # List/data tables
│   ├── {Entity}View.tsx           # Detail/view pages
│   └── ...
├── pages/                         # Module page components
│   ├── {Entity}ListPage.tsx       # List view
│   ├── {Entity}DetailPage.tsx     # Detail view
│   ├── {Entity}CreatePage.tsx     # Create view
│   ├── {Entity}EditPage.tsx       # Edit view
│   └── ...
├── hooks/                         # Module-specific React hooks
│   ├── use{Entity}.ts             # Entity CRUD hooks
│   ├── use{Entity}Validation.ts   # Validation schemas
│   └── ...
├── services/                      # Module-specific business logic
│   ├── {Entity}Service.ts         # Service layer
│   └── ...
├── validation/                    # Zod validation schemas
│   └── {Entity}Schema.ts
├── types/                         # Module-specific TypeScript types
│   └── index.ts
└── __tests__/                     # Module tests
    ├── {Entity}.test.ts
    └── ...
```

### `src/hooks/` — Shared React Hooks (73 hooks)

```
hooks/
├── useAuth.ts                     # Authentication state
├── usePermissions.ts              # Permission checking
├── useDatabaseReady.ts            # Database readiness
├── useDebounce.ts                 # Debounced input
├── usePagination.ts               # Pagination state
├── useSearch.ts                   # Search functionality
├── useOfflineStatus.ts            # Offline detection
├── useNotifications.ts            # Notification management
├── useCurrency.ts                 # Currency formatting
├── useDate.ts                     # Date formatting
├── useTranslation.ts              # i18n helper
├── ... (63 more)
```

### `src/stores/` — Zustand Stores

```
stores/
├── authStore.ts                   # Authentication state (user, token, permissions)
└── uiStore.ts                     # UI state (sidebar, theme, modals)
```

### `src/i18n/` — Internationalization (20 namespaces)

```
i18n/
├── index.ts                       # i18next initialization
├── en/                            # English translations
│   ├── common.json
│   ├── auth.json
│   ├── hr.json
│   ├── inventory.json
│   ├── procurement.json
│   ├── sales.json
│   ├── accounting.json
│   ├── payroll.json
│   ├── assets.json
│   ├── projects.json
│   ├── attendance.json
│   ├── finance.json
│   ├── reports.json
│   ├── settings.json
│   ├── dashboard.json
│   ├── organization.json
│   ├── workflow.json
│   ├── notifications.json
│   ├── validation.json
│   └── data-management.json
└── ar/                            # Arabic translations (same structure)
    ├── common.json
    ├── auth.json
    └── ...
```

### `src/types/` — Shared Type Definitions

```
types/
├── index.ts                       # Shared types (entity base, pagination, API response)
├── common.ts                      # Common utility types
├── audit.ts                       # Audit trail types
├── financial.ts                   # Financial types (Money, Currency)
├── workflow.ts                    # Workflow/approval types
└── index.test.ts                  # Type tests
```
