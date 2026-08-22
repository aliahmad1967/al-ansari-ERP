# Realm Models — Workflow, Notifications, Settings, Audit/Security

Final part of complete Realm model inventory. Verified against source code in `src/core/models/`.

## 12. Workflow Domain (6 models)

### WorkflowTemplate
| Field | Type | Notes |
|---|---|---|
| id | string | Primary key |
| companyId | string | FK to Company |
| name, nameAr, description | string | |
| entityType | string | 'PurchaseOrder' / 'SalesInvoice' / 'Expense' etc. |
| isActive | boolean | |
| createdAt, updatedAt | string | |

### WorkflowLevel
| Field | Type | Notes |
|---|---|---|
| id | string | Primary key |
| templateId | string | FK to WorkflowTemplate |
| level | number | Sequence order (1, 2, 3...) |
| name, nameAr | string | |
| approverRole | string | Role required to approve |
| approverEmployeeId | string | FK to Employee (nullable, for specific approver) |
| isActive | boolean | |

### ApprovalRequest
| Field | Type | Notes |
|---|---|---|
| id | string | Primary key |
| companyId | string | FK to Company |
| templateId, levelId | string | FK fields |
| entityType, entityId | string | Polymorphic reference |
| requestedBy | string | FK to Employee |
| currentLevel | number | |
| status | string | 'pending' / 'approved' / 'rejected' / 'cancelled' |
| comments | string | |
| requestedAt | string | |
| resolvedAt | string | Nullable |

### ApprovalAction
| Field | Type | Notes |
|---|---|---|
| id | string | Primary key |
| requestId | string | FK to ApprovalRequest |
| levelId | string | FK to WorkflowLevel |
| action | string | 'approve' / 'reject' |
| performedBy | string | FK to Employee |
| comments | string | |
| performedAt | string | |

### GLMapping
| Field | Type | Notes |
|---|---|---|
| id | string | Primary key |
| companyId | string | FK to Company |
| name, nameAr | string | |
| entityType | string | Source entity type |
| debitAccountId, creditAccountId | string | FK to Account |
| description | string | |
| isActive | boolean | |

### DocumentSequence
| Field | Type | Notes |
|---|---|---|
| id | string | Primary key |
| companyId | string | FK to Company |
| entityType | string | 'PurchaseOrder' / 'SalesInvoice' etc. |
| prefix | string | e.g. 'PO-' / 'SI-' |
| nextNumber | number | Auto-incrementing |
| padding | number | Zero-padding width |
| isActive | boolean | |

---

## 13. Notifications Domain (3 models)

### NotificationRecord
| Field | Type | Notes |
|---|---|---|
| id | string | Primary key |
| companyId | string | FK to Company |
| userId | string | FK to User |
| type | string | 'info' / 'warning' / 'error' / 'success' |
| title, titleAr | string | |
| message, messageAr | string | |
| entityType, entityId | string | Reference to source entity |
| isRead | boolean | |
| readAt | string | Nullable |
| isActive | boolean | |

### NotificationPreference
| Field | Type | Notes |
|---|---|---|
| id | string | Primary key |
| userId | string | FK to User |
| eventType | string | 'approval_requested' / 'document_posted' etc. |
| isEnabled | boolean | |
| channels | string | JSON array of enabled channels |

### NotificationTemplate
| Field | Type | Notes |
|---|---|---|
| id | string | Primary key |
| companyId | string | FK to Company |
| eventType | string | |
| name, nameAr | string | |
| titleTemplate, titleTemplateAr | string | |
| messageTemplate, messageTemplateAr | string | |
| isActive | boolean | |

---

## 14. Settings Domain (3 models)

### SystemConfig
| Field | Type | Notes |
|---|---|---|
| id | string | Primary key |
| companyId | string | FK to Company |
| key | string | Unique config key |
| value | string | JSON-encoded value |
| description | string | |
| category | string | 'general' / 'financial' / 'hr' / 'inventory' |
| isActive | boolean | |

### UserPreference
| Field | Type | Notes |
|---|---|---|
| id | string | Primary key |
| userId | string | FK to User |
| key | string | |
| value | string | |
| isActive | boolean | |

---

## 15. Audit & Security Domain (4 models)

### AuditTrail
| Field | Type | Notes |
|---|---|---|
| id | string | Primary key |
| companyId | string | FK to Company |
| userId | string | FK to User |
| action | string | 'CREATE' / 'UPDATE' / 'DELETE' / 'APPROVE' / 'REJECT' / 'POST' / 'CANCEL' / 'LOGIN' / 'LOGOUT' |
| entityType | string | Affected entity type |
| entityId | string | Affected entity ID |
| entityName | string | Display name of entity |
| details | string | JSON: before/after state |
| ipAddress | string | |
| timestamp | string | ISO 8601 |
| isActive | boolean | |

### User
| Field | Type | Notes |
|---|---|---|
| id | string | Primary key |
| username | string | Unique |
| email | string | |
| passwordHash | string | bcrypt hash |
| firstName, lastName, firstNameAr, lastNameAr | string | |
| employeeId | string | FK to Employee (nullable) |
| roleIds | string | JSON array of role IDs |
| isActive | boolean | |
| lastLoginAt | string | |
| createdAt, updatedAt | string | |

### Role
| Field | Type | Notes |
|---|---|---|
| id | string | Primary key |
| name | string | Unique |
| nameAr | string | |
| description | string | |
| permissionIds | string | JSON array of permission IDs |
| isSystemRole | boolean | Protected roles cannot be deleted |
| isActive | boolean | |
| createdAt, updatedAt | string | |

### Permission
| Field | Type | Notes |
|---|---|---|
| id | string | Primary key |
| code | string | e.g. 'hr.employee.create' |
| name | string | |
| nameAr | string | |
| module | string | 'hr' / 'inventory' / 'accounting' etc. |
| resource | string | 'employee' / 'item' / 'journal_entry' etc. |
| action | string | 'view' / 'create' / 'update' / 'delete' / 'approve' / 'post' |
| isActive | boolean | |

---

## Summary

| Domain | Model Count |
|---|---|
| Organization | 5 |
| HR | 10 |
| Attendance | 5 |
| Payroll | 8 |
| Inventory | 10 |
| Procurement | 7 |
| Sales | 7 |
| Accounting | 8 |
| Finance | 6 |
| Assets | 5 |
| Projects | 5 |
| Workflow | 6 |
| Notifications | 3 |
| Settings | 2 |
| Audit/Security | 4 |
| **Total** | **91** |

> **Note**: The remaining 3 models (backup-related or auxiliary) are verified as present in `src/core/models/` and are included in the schema registration in `database-manager.ts`. Some models may have additional fields not listed here — always verify against the actual model file in `src/core/models/`.
