# Seed Data

Initial data loaded into the Realm database on first application launch.

## 1. Seed Data Purpose

- Provide default system configuration
- Create default roles and permissions
- Set up initial admin user
- Configure default currency (SAR)
- Establish base system settings

## 2. Seed Data Location

```
src/core/database/seed.ts
```

## 3. What Gets Seeded

### 3.1 Permissions

All permission strings are seeded on first launch:

| Module | Permissions |
|---|---|
| hr | `hr.employee.view`, `.create`, `.update`, `.delete` |
| attendance | `attendance.record.view`, `.create`, `.update` |
| payroll | `payroll.run.view`, `.create`, `.approve`, `.post` |
| inventory | `inventory.item.view`, `.create`, `.update`, `.delete` |
| procurement | `procurement.order.view`, `.create`, `.approve`, `.post` |
| sales | `sales.invoice.view`, `.create`, `.approve`, `.post` |
| accounting | `accounting.journal.view`, `.create`, `.approve`, `.post` |
| finance | `finance.payment.view`, `.create`, `.approve`, `.post` |
| assets | `assets.asset.view`, `.create`, `.update`, `.post` |
| projects | `projects.project.view`, `.create`, `.update`, `.post` |
| settings | `settings.system.view`, `.update` |
| workflow | `workflow.template.view`, `.create`, `.update` |
| reports | `reports.view`, `.export` |
| data_management | `data.backup`, `.restore`, `.import`, `.export` |

### 3.2 Default Roles

| Role | Description | Key Permissions |
|---|---|---|
| `admin` | Full system access | All permissions |
| `hr_manager` | HR department manager | All HR, attendance, payroll permissions |
| `finance_manager` | Finance department manager | All accounting, finance, reports permissions |
| `inventory_manager` | Warehouse/inventory manager | All inventory, procurement permissions |
| `sales_manager` | Sales department manager | All sales permissions |
| `employee` | Basic employee access | View own data, request leave |
| `viewer` | Read-only access | All view permissions |

### 3.3 System Configuration

| Key | Value | Description |
|---|---|---|
| `company.name` | "AL-ANSARI" | Default company name |
| `currency.default` | "SAR" | Saudi Riyal |
| `date.format` | "DD/MM/YYYY" | Default date format |
| `language.default` | "ar" | Arabic default |
| `payroll.gosi.employee_rate` | 11 | GOSI employee contribution % |
| `payroll.gosi.employer_rate` | 12 | GOSI employer contribution % |
| `payroll.work_days_per_month` | 30 | Standard working days |

### 3.4 Initial Admin User

| Field | Value |
|---|---|
| username | `admin` |
| password | (set during first launch) |
| role | `admin` |
| isActive | true |

## 4. Seed Data Execution

```typescript
// src/core/database/seed.ts
export function seedDatabase(realm: Realm): void {
  // Only seed if database is empty (first run)
  if (realm.objects('User').length > 0) {
    return; // Already seeded
  }

  realm.write(() => {
    // Create permissions
    // Create roles
    // Create system config
    // Create admin user placeholder
  });
}
```

## 5. Development Seed Data

For development and testing, additional seed data can be loaded:

```typescript
// src/core/services/DevOrganizationService.ts
// Creates sample companies, branches, warehouses
// src/core/services/DevEmployeeService.ts
// Creates sample employees with contracts
// src/core/services/DevAttendanceService.ts
// Creates sample attendance records
```

These are controlled by environment flags and should NOT be active in production.

## 6. Adding New Seed Data

When adding new seed data:

1. Check if entity already exists (idempotent)
2. Use `realm.write()` transaction
3. Handle both Arabic and English names
4. Mark seed data with appropriate flags
5. Test fresh install AND upgrade scenarios
