# Realm Models — Sales, Accounting, Finance, Assets, Projects

Continuation of complete Realm model inventory. Verified against source code in `src/core/models/`.

## 7. Sales Domain (7 models)

### Customer
| Field | Type | Notes |
|---|---|---|
| id | string | Primary key |
| companyId | string | FK to Company |
| customerNumber | string | Auto-generated |
| name, nameAr, contactPerson | string | |
| email, phone, address, city, country | string | |
| taxNumber | string | |
| creditLimit | number | Integer fils |
| paymentTerms | string | |
| isActive, isDeleted | boolean | |

### Quotation
| Field | Type | Notes |
|---|---|---|
| id | string | Primary key |
| companyId | string | FK to Company |
| documentNumber | string | |
| customerId | string | FK to Customer |
| quotationDate, validUntil | string | |
| status | string | 'draft' / 'sent' / 'accepted' / 'rejected' / 'expired' / 'converted' |
| subtotal, taxAmount, discountAmount, totalAmount | number | Integer fils |

### QuotationItem
| Field | Type | Notes |
|---|---|---|
| id | string | Primary key |
| quotationId, itemId | string | FK fields |
| description | string | |
| quantity, unitPrice, discountPercent, taxPercent, totalAmount | number | Integer fils |

### SalesOrder
| Field | Type | Notes |
|---|---|---|
| id | string | Primary key |
| companyId | string | FK to Company |
| documentNumber | string | |
| customerId, quotationId, warehouseId | string | FK fields |
| orderDate, deliveryDate | string | |
| status | string | 'draft' / 'pending_approval' / 'approved' / 'partial' / 'delivered' / 'invoiced' / 'cancelled' |
| subtotal, taxAmount, discountAmount, totalAmount | number | Integer fils |
| isPosted | boolean | |
| postedAt | string | Nullable |

### SalesOrderItem
| Field | Type | Notes |
|---|---|---|
| id | string | Primary key |
| salesOrderId, itemId | string | FK fields |
| description | string | |
| quantity, deliveredQuantity, invoicedQuantity | number | |
| unitPrice, discountPercent, taxPercent, totalAmount | number | Integer fils |

### DeliveryNote
| Field | Type | Notes |
|---|---|---|
| id | string | Primary key |
| companyId | string | FK to Company |
| documentNumber | string | |
| salesOrderId, customerId, warehouseId | string | FK fields |
| deliveryDate | string | |
| status | string | 'draft' / 'shipped' / 'delivered' / 'cancelled' |

### DeliveryNoteItem
| Field | Type | Notes |
|---|---|---|
| id | string | Primary key |
| deliveryNoteId, salesOrderItemId, itemId | string | FK fields |
| quantity | number | |

### SalesInvoice
| Field | Type | Notes |
|---|---|---|
| id | string | Primary key |
| companyId | string | FK to Company |
| documentNumber | string | |
| customerId, salesOrderId, deliveryNoteId | string | FK fields (nullable) |
| invoiceDate, dueDate | string | |
| status | string | 'draft' / 'sent' / 'partial' / 'paid' / 'overdue' / 'cancelled' |
| currency | string | Default 'SAR' |
| exchangeRate | number | |
| subtotal, taxAmount, discountAmount, totalAmount, paidAmount, balanceDue | number | Integer fils |
| isPosted | boolean | |

### SalesInvoiceItem
| Field | Type | Notes |
|---|---|---|
| id | string | Primary key |
| salesInvoiceId, itemId | string | FK fields |
| description | string | |
| quantity, unitPrice, discountPercent, taxPercent, totalAmount | number | Integer fils |

---

## 8. Accounting Domain (8 models)

### Account
| Field | Type | Notes |
|---|---|---|
| id | string | Primary key |
| companyId | string | FK to Company |
| code | string | Unique account code |
| name, nameAr | string | |
| type | string | 'asset' / 'liability' / 'equity' / 'revenue' / 'expense' |
| parentId | string | FK to self (hierarchy) |
| currency | string | Default 'SAR' |
| isActive, isSystemAccount | boolean | Protected accounts |
| balance | number | Current balance (fils) |

### JournalEntry
| Field | Type | Notes |
|---|---|---|
| id | string | Primary key |
| companyId | string | FK to Company |
| documentNumber | string | Auto-generated |
| date, referenceType, referenceId | string | Source document |
| description | string | |
| totalDebit, totalCredit | number | Integer fils |
| status | string | 'draft' / 'posted' / 'void' |
| isPosted | boolean | |
| postedAt, postedBy | string | |

### JournalEntryLine
| Field | Type | Notes |
|---|---|---|
| id | string | Primary key |
| journalEntryId, accountId | string | FK fields |
| debit, credit | number | Integer fils |
| description | string | |
| costCenterId | string | FK to CostCenter (nullable) |

### GLEntry
| Field | Type | Notes |
|---|---|---|
| id | string | Primary key |
| companyId, accountId, journalEntryId | string | FK fields |
| date | string | |
| debit, credit, balance | number | Integer fils, running balance |
| description, referenceType, referenceId | string | |

### TrialBalance
| Field | Type | Notes |
|---|---|---|
| id | string | Primary key |
| companyId | string | FK to Company |
| period | string | |
| generatedDate | string | |
| totalDebit, totalCredit | number | Integer fists |
| isBalanced | boolean | |
| status | string | 'draft' / 'final' |

### TrialBalanceLine
| Field | Type | Notes |
|---|---|---|
| id | string | Primary key |
| trialBalanceId, accountId | string | FK fields |
| accountCode, accountName | string | |
| debit, credit, balance | number | Integer fists |

### CashBookEntry
| Field | Type | Notes |
|---|---|---|
| id | string | Primary key |
| companyId, accountId, journalEntryId | string | FK fields |
| date | string | |
| type | string | 'receipt' / 'payment' / 'transfer' |
| amount, balanceAfter | number | Integer fists |
| referenceType, referenceId, description | string | |

### AccountStatement
| Field | Type | Notes |
|---|---|---|
| id | string | Primary key |
| accountId | string | FK to Account |
| period | string | |
| openingBalance, totalDebit, totalCredit, closingBalance | number | Integer fists |
| generatedDate | string | |

---

## 9. Finance Domain (6 models)

### FiscalPeriod
| Field | Type | Notes |
|---|---|---|
| id | string | Primary key |
| companyId | string | FK to Company |
| name, startDate, endDate | string | |
| status | string | 'open' / 'closing' / 'closed' |
| isCurrent, isActive | boolean | |

### Budget
| Field | Type | Notes |
|---|---|---|
| id | string | Primary key |
| companyId, fiscalPeriodId, accountId | string | FK fields |
| name | string | |
| budgetAmount, actualAmount, variance | number | Integer fists |
| notes | string | |

### BudgetLine
| Field | Type | Notes |
|---|---|---|
| id | string | Primary key |
| budgetId | string | FK to Budget |
| month | string | YYYY-MM |
| amount, actualAmount | number | Integer fists |

### Payment
| Field | Type | Notes |
|---|---|---|
| id | string | Primary key |
| companyId | string | FK to Company |
| documentNumber | string | |
| type | string | 'payment' / 'receipt' / 'expense' / 'refund' |
| partyType, partyId | string | Polymorphic FK |
| accountId, journalEntryId | string | FK fields |
| amount | number | Integer fists |
| paymentMethod | string | 'cash' / 'bank_transfer' / 'cheque' / 'card' |
| referenceNumber, paymentDate | string | |
| status | string | 'draft' / 'approved' / 'posted' / 'cancelled' |
| isPosted | boolean | |

### Expense
| Field | Type | Notes |
|---|---|---|
| id | string | Primary key |
| companyId | string | FK to Company |
| documentNumber | string | |
| accountId, costCenterId, employeeId | string | FK fields |
| description | string | |
| amount | number | Integer fists |
| date | string | |
| status | string | 'draft' / 'pending_approval' / 'approved' / 'rejected' / 'posted' |
| isPosted | boolean | |

### CostAllocation
| Field | Type | Notes |
|---|---|---|
| id | string | Primary key |
| companyId | string | FK to Company |
| sourceCostCenterId, targetCostCenterId, accountId | string | FK fields |
| amount | number | Integer fists |
| percentage | number | Allocation percentage |
| period | string | |

---

## 10. Assets Domain (5 models)

### AssetCategory
| Field | Type | Notes |
|---|---|---|
| id | string | Primary key |
| companyId | string | FK to Company |
| code, name, nameAr, description | string | |
| defaultUsefulLife | number | Years |
| defaultSalvagePercent | number | Percentage |
| depreciationMethod | string | 'straight_line' / 'declining_balance' |
| assetAccountId, depreciationAccountId, accumulatedDepreciationAccountId | string | FK to Account |

### Asset
| Field | Type | Notes |
|---|---|---|
| id | string | Primary key |
| companyId, assetCategoryId | string | FK fields |
| assetNumber | string | Auto-generated |
| name, nameAr, description, serialNumber | string | |
| purchaseDate | string | |
| purchaseCost | number | Integer fists |
| usefulLife | number | Years |
| salvageValue | number | Integer fists |
| depreciationMethod | string | |
| assetAccountId, depreciationAccountId, accumulatedDepreciationAccountId | string | FK to Account |
| location | string | |
| status | string | 'active' / 'disposed' / 'fully_depreciated' |
| disposalDate | string | Nullable |
| disposalAmount | number | Nullable |
| isActive | boolean | |

### DepreciationRun
| Field | Type | Notes |
|---|---|---|
| id | string | Primary key |
| companyId | string | FK to Company |
| documentNumber | string | |
| period | string | |
| runDate | string | |
| status | string | 'draft' / 'posted' / 'cancelled' |
| totalDepreciation | number | Integer fists |
| assetCount | number | |
| isPosted | boolean | |
| postedAt | string | Nullable |

### DepreciationEntry
| Field | Type | Notes |
|---|---|---|
| id | string | Primary key |
| depreciationRunId, assetId | string | FK fields |
| period | string | |
| depreciationAmount | number | Integer fists |
| accumulatedDepreciation | number | Integer fists |
| bookValue | number | Integer fists |
| journalEntryId | string | FK to JournalEntry (nullable) |

### AssetGLExport
| Field | Type | Notes |
|---|---|---|
| id | string | Primary key |
| depreciationRunId, journalEntryId | string | FK fields |
| exportDate | string | |
| status | string | 'pending' / 'exported' / 'failed' |

---

## 11. Projects Domain (5 models)

### Project
| Field | Type | Notes |
|---|---|---|
| id | string | Primary key |
| companyId | string | FK to Company |
| projectNumber | string | Auto-generated |
| name, nameAr, description | string | |
| customerId | string | FK to Customer (nullable) |
| startDate, endDate | string | |
| budget | number | Integer fists |
| actualCost | number | Integer fists |
| status | string | 'planning' / 'active' / 'on_hold' / 'completed' / 'cancelled' |
| managerId | string | FK to Employee |
| isActive | boolean | |

### ProjectTask
| Field | Type | Notes |
|---|---|---|
| id | string | Primary key |
| projectId | string | FK to Project |
| name, nameAr, description | string | |
| assignedTo | string | FK to Employee |
| startDate, dueDate, completedDate | string | |
| estimatedHours, actualHours | number | |
| status | string | 'todo' / 'in_progress' / 'review' / 'done' |
| priority | string | 'low' / 'medium' / 'high' / 'critical' |
| isActive | boolean | |

### ProjectPhase
| Field | Type | Notes |
|---|---|---|
| id | string | Primary key |
| projectId | string | FK to Project |
| name, nameAr, description | string | |
| startDate, endDate | string | |
| status | string | 'planned' / 'active' / 'completed' |
| order | number | |
| isActive | boolean | |

### ProjectCost
| Field | Type | Notes |
|---|---|---|
| id | string | Primary key |
| projectId, accountId, costCenterId | string | FK fields |
| description | string | |
| amount | number | Integer fists |
| date | string | |
| referenceType, referenceId | string | Source document |
| isActive | boolean | |

### ProjectGLExport
| Field | Type | Notes |
|---|---|---|
| id | string | Primary key |
| projectId, journalEntryId | string | FK fields |
| exportDate | string | |
| status | string | 'pending' / 'exported' / 'failed' |
