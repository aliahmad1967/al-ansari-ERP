# AL-ANSARI ERP — Security Architecture

## Overview

AL-ANSARI ERP implements a client-side security model appropriate for an offline-first desktop application. Security is enforced at the UI, service, and session layers. Since there is no server, all authorization is client-side — appropriate for a single-user desktop ERP but insufficient for a multi-user web deployment.

## Authentication

### Login Flow

1. User submits username + password
2. Password is hashed using PBKDF2-SHA512 (600,000 iterations)
3. Hash is compared against stored hash using constant-time comparison
4. On success: session created with user info, role, permissions
5. On failure: failed attempt counter incremented; lockout after 5 failures

### Password Hashing

```typescript
// PBKDF2-SHA512 with 600,000 iterations
hashPassword(password, salt?) → Promise<string>
verifyPassword(password, hash) → Promise<boolean>
```

- Salt is randomly generated per password
- Stored as `iterations:salt:hash` format
- Verification uses Node.js `crypto.pbkdf2`

### Session Management

```typescript
interface Session {
  user: { _id, username, fullName, fullNameAr, roleCode, ... }
  permissionCodes: string[]
  authenticatedAt: number
  expiresAt: number
}
```

- Session stored in `localStorage` (plain JSON)
- 30-minute timeout with inactivity detection
- Session checked on every navigation via `ProtectedRoute`

### Account Lockout

| Parameter | Value |
|-----------|-------|
| Max failed attempts | 5 |
| Lockout duration | 15 minutes |
| Counter reset | After successful login or lockout expiry |

## Authorization (RBAC)

### Permission Model

Permissions follow the pattern: `module.resource.action`

```
hr.employee.view
hr.employee.create
hr.employee.update
hr.employee.delete
finance.invoice.view
finance.invoice.approve
inventory.product.create
```

### Role Hierarchy

| Role | Scope |
|------|-------|
| `SuperAdministrator` | Full system access |
| `Administrator` | Full access except system settings |
| `HRManager` | HR module + employee data |
| `HROfficer` | Limited HR operations |
| `FinanceManager` | Finance + accounting modules |
| `Accountant` | Accounting operations |
| `InventoryManager` | Inventory + procurement |
| `SalesManager` | Sales + customer management |
| `ProjectManager` | Project management |
| `Employee` | Self-service (own data only) |

### Permission Enforcement

- **UI Layer:** `RequirePermission` component wraps protected routes
- **Hook Layer:** `usePermissions` hook checks permission codes
- **Service Layer:** Services assume authorization is checked by caller
- **Repository Layer:** No permission checks (pure data access)

### Known Limitations

- Authorization is client-side only — no server-side enforcement
- Permission codes stored in `localStorage` — can be modified via DevTools
- No row-level security (all data accessible if permission is granted)
- `PROJECT_MANAGER` role defined in permissions config but not in roles.ts

## Encryption

### Password Encryption

- **Algorithm:** PBKDF2-SHA512
- **Iterations:** 600,000
- **Salt:** Random 16-byte salt per password
- **Output:** Hex-encoded hash

### Database Encryption

- Optional 64-byte encryption key support in Realm configuration
- Not configured by default
- Must be provided at database open time

### Session Encryption

- **None** — Session data stored as plain JSON in `localStorage`

## Security Utilities

| Module | Purpose |
|--------|---------|
| `encryption.ts` | PBKDF2 hashing, constant-time comparison |
| `password.ts` | Password policy validation |
| `permissions.ts` | Permission code checking |
| `roles.ts` | Role definitions and hierarchy |
| `session.ts` | Session creation, persistence, timeout |
| `access.ts` | Access control helpers |

## Audit Logging

Every significant operation is audit-logged:

| Operation | Logged |
|-----------|--------|
| Create | Object type, ID, user |
| Update | Object type, ID, changes, user |
| Delete | Object type, ID, user |
| Approve | Object type, ID, workflow step, user |
| Reject | Object type, ID, workflow step, user |
| Post | Object type, ID, user |
| Cancel | Object type, ID, user |
| Login | Username, success/failure, IP |
| Logout | User |
| Import | Record count, user |
| Export | Record count, user |
| Backup | File path, user |
| Restore | File path, user |

**Audit records are immutable** — once created, they cannot be modified or deleted.

## Security Concerns (Phase 024 Review)

### Critical

1. **Session in localStorage without encryption** — XSS exposes complete session including permission codes
2. **Client-side authorization only** — No server-side enforcement; permissions can be tampered via DevTools
3. **DevAuthService hardcoded admin password** — `admin` with `mustChangePassword: false`
4. **DevAuthService no account lockout** — Unlike production AuthService, no failed attempt tracking

### High

5. **PROJECT_MANAGER role mismatch** — Defined in permissions.config.ts but missing from roles.ts
6. **Password policy weak** — Doesn't require special characters by default

### Medium

7. **No RBAC at repository level** — Any code with repository access can CRUD any record
8. **Non-constant-time comparison in DevAuthService** — Timing side-channel possible

## Recommendations for Production

1. Add server-side authentication and session management
2. Implement JWT or session tokens with server validation
3. Add row-level security in repository layer
4. Encrypt session data or use httpOnly cookies
5. Force password change on first login (currently disabled in seed)
6. Add password complexity requirements (special characters, uppercase, etc.)
7. Implement rate limiting for authentication attempts
8. Add HTTPS enforcement for any network communication
9. Add Content Security Policy headers
10. Implement server-side audit log tamper detection
