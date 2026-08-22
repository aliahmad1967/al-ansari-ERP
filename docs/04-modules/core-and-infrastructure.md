# Core & Infrastructure Modules

Documentation for the foundational modules that support all other ERP domains.

---

## 1. Auth Module

**Path**: `src/modules/auth/`
**Purpose**: User authentication, login, session management.

### Models
- `User` — User accounts with credentials and role assignments

### Repositories
- `UserRepository` — CRUD + `findByUsername()`, `findByEmail()`

### Services
- `AuthService` — Login validation, session creation, password verification
- `DevAuthService` — Development-mode auto-login with test users

### Hooks
- `useAuth()` — Login/logout, current user state, token management

### Pages
- `LoginPage` — Username/password form, language switcher

### Routes
| Path | Component | Auth Required |
|---|---|---|
| `/login` | LoginPage | No |

### Tests
- `auth.test.ts` — Login flow, session management, password validation

---

## 2. Organization Module

**Path**: `src/modules/organization/`
**Purpose**: Multi-company, branch, cost center, warehouse, and unit management.

### Models (5)
- Company, Branch, CostCenter, Warehouse, UnitOfMeasure

### Repositories (5)
- `CompanyRepository`, `BranchRepository`, `CostCenterRepository`, `WarehouseRepository`, `UnitOfMeasureRepository`

### Services
- `OrganizationService` — CRUD + hierarchy management

### Hooks
- `useCompany()`, `useBranch()`, `useCostCenter()`, `useWarehouse()`, `useUnitOfMeasure()`

### Pages
| Page | Description |
|---|---|
| CompanyListPage | List all companies |
| CompanyDetailPage | View/edit company |
| BranchListPage | List branches |
| WarehouseListPage | List warehouses |
| CostCenterListPage | List cost centers (tree view) |
| UnitOfMeasureListPage | List UoM |

### Routes
| Path | Permission |
|---|---|
| `/organizations/companies` | `organization.company.view` |
| `/organizations/branches` | `organization.branch.view` |
| `/organizations/warehouses` | `organization.warehouse.view` |
| `/organizations/cost-centers` | `organization.costCenter.view` |
| `/organizations/units` | `organization.unit.view` |

### Tests
- `organization.test.ts` — Company CRUD, hierarchy, validation

---

## 3. Settings Module

**Path**: `src/modules/settings/`
**Purpose**: System configuration, user management, role/permission management.

### Models
- SystemConfig, User, Role, Permission

### Repositories
- `SystemConfigRepository`, `UserRepository`, `RoleRepository`, `PermissionRepository`

### Services
- `SettingsService` — System config CRUD
- `UserService` — User management
- `RoleService` — Role management with permission assignment

### Hooks
- `useSettings()`, `useUser()`, `useRole()`, `usePermission()`

### Pages
| Page | Description |
|---|---|
| SystemSettingsPage | Global system configuration |
| UserManagementPage | User CRUD |
| RoleManagementPage | Role CRUD with permission matrix |
| PermissionPage | Permission overview |

### Routes
| Path | Permission |
|---|---|
| `/settings/system` | `settings.system.view` |
| `/settings/users` | `settings.user.view` |
| `/settings/roles` | `settings.role.view` |

### Tests
- `settings.test.ts`, `user.test.ts`, `role.test.ts`

---

## 4. Data Management Module

**Path**: `src/modules/data-management/`
**Purpose**: Database backup/restore, data import/export, system info.

### Services
- `BackupService` — Full database backup to file, restore from file
- `ImportService` — CSV/Excel import with validation
- `ExportService` — CSV/Excel/PDF export

### Pages
| Page | Description |
|---|---|
| BackupRestorePage | Backup/restore operations |
| ImportExportPage | Data import/export |
| SystemInfoPage | Database stats, version info, health check |

### Routes
| Path | Permission |
|---|---|
| `/data-management/backup` | `data.backup` |
| `/data-management/import-export` | `data.import` |
| `/data-management/system-info` | `settings.system.view` |

### Tests
- `backup.test.ts`, `import.test.ts`, `export.test.ts`

---

## 5. Dashboard Module

**Path**: `src/modules/dashboard/`
**Purpose**: KPI widgets, recent activity feed, quick actions.

### Pages
| Page | Description |
|---|---|
| DashboardPage | Main dashboard with KPIs |
| KPIWidget | Reusable KPI display component |
| RecentActivity | Activity feed from audit trail |

### Routes
| Path | Permission |
|---|---|
| `/` (home) | `dashboard.view` |
| `/dashboard` | `dashboard.view` |

### Tests
- `dashboard.test.ts` — KPI calculation, activity rendering

---

## 6. Notifications Module

**Path**: `src/modules/notifications/`
**Purpose**: In-app notification center, notification preferences.

### Models
- NotificationRecord, NotificationPreference, NotificationTemplate

### Repositories
- `NotificationRepository`, `NotificationPreferenceRepository`

### Services
- `NotificationService` — Create, read, mark-as-read, preferences

### Hooks
- `useNotifications()` — Unread count, list, mark-as-read

### Components
- `NotificationCenter` — Dropdown/list of notifications
- `NotificationBadge` — Unread count badge

### Routes
| Path | Permission |
|---|---|
| `/notifications` | Authenticated |

### Tests
- `notification.test.ts`

---

## 7. Workflow Module

**Path**: `src/modules/workflow/`
**Purpose**: Multi-level approval engine, GL mapping, document sequences.

### Models
- WorkflowTemplate, WorkflowLevel, ApprovalRequest, ApprovalAction, GLMapping, DocumentSequence

### Repositories
- `WorkflowTemplateRepository`, `ApprovalRequestRepository`, `GLMappingRepository`, `DocumentSequenceRepository`

### Services
- `WorkflowService` — Template CRUD, approval processing
- `DocumentSequenceService` — Auto-numbering for all document types

### Hooks
- `useWorkflow()`, `useApproval()`, `useDocumentSequence()`

### Pages
| Page | Description |
|---|---|
| WorkflowTemplateListPage | Configure approval workflows |
| ApprovalRequestListPage | Pending approvals |
| GLMappingPage | GL account mappings |
| DocumentSequencePage | Document numbering config |

### Routes
| Path | Permission |
|---|---|
| `/workflow/templates` | `workflow.template.view` |
| `/workflow/approvals` | Authenticated |
| `/workflow/gl-mappings` | `workflow.glMapping.view` |

### Tests
- `workflow.test.ts`, `approval.test.ts`

---

## 8. Reports Module

**Path**: `src/modules/reports/`
**Purpose**: Report generation, templates, PDF/CSV/Excel export.

### Services
- `ReportService` — Template-based report generation

### Pages
| Page | Description |
|---|---|
| ReportBuilderPage | Configure and generate reports |
| ReportPreviewPage | Preview before export |

### Routes
| Path | Permission |
|---|---|
| `/reports` | `reports.view` |

### Tests
- `report.test.ts`
