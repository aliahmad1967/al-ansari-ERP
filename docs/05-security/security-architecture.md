# Security Architecture

## 1. Authentication

### 1.1 Login Flow
```
User enters credentials → AuthService.authenticate()
  → UserRepository.findByUsername()
  → PasswordService.verify(password, storedHash)
  → If valid: SessionService.createSession(user)
  → Store user + permissions in authStore (Zustand)
  → AuditService.log('LOGIN')
```

### 1.2 Password Security
- **Hashing**: bcrypt with salt rounds (configurable)
- **Storage**: Only hashed passwords stored; never plaintext
- **Location**: `src/core/security/password.ts`

```typescript
PasswordService.hash(password)     // → hashed password
PasswordService.verify(input, hash) // → boolean
```

### 1.3 Session Management
- Sessions stored in-memory (Zustand authStore)
- On app restart, user must re-login
- Session includes: userId, username, roles, permissions
- **Location**: `src/core/security/session.ts`

### 1.4 Dev Mode Authentication
- `DevAuthService` provides auto-login for development
- Creates test user with admin permissions
- Only active in development environment

## 2. Authorization (RBAC)

### 2.1 Permission Model
Format: `module.resource.action`

```
hr.employee.view
hr.employee.create
hr.employee.update
hr.employee.delete
finance.invoice.approve
inventory.product.create
accounting.journal.post
```

### 2.2 Role-Permission Assignment
- Roles contain arrays of permission IDs
- Users are assigned one or more roles
- Effective permissions = union of all role permissions
- System roles (admin) cannot be deleted

### 2.3 Permission Checking

```typescript
// In hooks/services
const { hasPermission } = usePermissions();
if (!hasPermission('hr.employee.create')) {
  throw new PermissionError('hr.employee.create');
}

// In route definitions (routes.tsx)
{
  path: '/hr/employees/create',
  element: <EmployeeCreatePage />,
  requiredPermission: 'hr.employee.create',
}
```

### 2.4 Files
| File | Purpose |
|---|---|
| `src/core/security/permissions.ts` | Permission constants, `checkPermission()` |
| `src/core/security/roles.ts` | Role definitions, role management |
| `src/core/security/access.ts` | Access control utilities |

## 3. Data Encryption

### 3.1 AES-256 Encryption
- **Location**: `src/core/security/encryption.ts`
- Used for sensitive data at rest
- Encryption key derived from system configuration
- Applied to:
  - Financial data
  - Personal employee information
  - Configuration secrets

### 3.2 What's Encrypted
| Data | Method |
|---|---|
| Passwords | bcrypt hash (not reversible) |
| Sensitive config | AES-256 encryption |
| Employee personal data | AES-256 encryption |
| Financial records | Stored as integer fils (no floating point) |

## 4. Audit Trail

### 4.1 What's Audited
| Action | Entities |
|---|---|
| CREATE | All major entities |
| UPDATE | All major entities |
| DELETE | Soft deletes logged |
| APPROVE | Workflow approvals |
| REJECT | Workflow rejections |
| POST | Financial postings |
| CANCEL | Document cancellations |
| LOGIN / LOGOUT | User sessions |

### 4.2 Audit Record Structure
```typescript
{
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  entityName: string;
  details: string;  // JSON: before/after state
  ipAddress: string;
  timestamp: string; // ISO 8601
}
```

### 4.3 Immutability
- Audit records are never updated or deleted
- Append-only log for compliance
- Queryable from settings and data management modules

## 5. Security Files

| File | Location |
|---|---|
| Encryption | `src/core/security/encryption.ts` |
| Password | `src/core/security/password.ts` |
| Permissions | `src/core/security/permissions.ts` |
| Roles | `src/core/security/roles.ts` |
| Session | `src/core/security/session.ts` |
| Access Control | `src/core/security/access.ts` |

## 6. Security Best Practices

| Practice | Implementation |
|---|---|
| No secrets in source code | Encryption key derived at runtime |
| No plaintext passwords | bcrypt hashing |
| No direct DB access from UI | Layered architecture enforced |
| Permission checks at service layer | Not just UI level |
| Audit all significant operations | AuditService.log() |
| Soft deletes | `isActive` / `isDeleted` flags |
| Input validation | Zod schemas at service layer |
