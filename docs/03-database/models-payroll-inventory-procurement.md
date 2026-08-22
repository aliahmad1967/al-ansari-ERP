# Realm Models — Payroll, Inventory, Procurement

Continuation of complete Realm model inventory. Verified against source code in `src/core/models/`.

## 4. Payroll Domain (8 models)

### PayrollRun
| Field | Type | Notes |
|---|---|---|
| id | string | Primary key |
| documentNumber | string | Auto-generated |
| companyId | string | FK to Company |
| period | string | e.g. '2026-08' |
| startDate, endDate, paymentDate | string | |
| status | string | 'draft' / 'processing' / 'completed' / 'cancelled' |
| totalBasicSalary, totalEarnings, totalDeductions, netPayable | number | Integer fils |
| employeeCount | number | |
| isPosted | boolean | |
| postedAt | string | Nullable |
| notes | string | |
| isActive | boolean | |

### Payslip
| Field | Type | Notes |
|---|---|---|
| id | string | Primary key |
| payrollRunId, employeeId | string | FK fields |
| documentNumber | string | |
| basicSalary, totalEarnings, totalDeductions, netPayable | number | Integer fils |
| workingDays, actualDays | number | |
| status | string | 'draft' / 'approved' / 'paid' |
| isPosted | boolean | |
| postedAt | string | Nullable |

### EarningType
| Field | Type | Notes |
|---|---|---|
| id | string | Primary key |
| companyId | string | FK to Company |
| name, nameAr, code | string | |
| type | string | 'fixed' / 'percentage' / 'variable' |
| defaultValue | number | Integer fils or percentage |
| isTaxable, isActive | boolean | |

### DeductionType
| Field | Type | Notes |
|---|---|---|
| id | string | Primary key |
| companyId | string | FK to Company |
| name, nameAr, code | string | |
| type | string | 'fixed' / 'percentage' / 'variable' |
| defaultValue | number | |
| isStatutory, isActive | boolean | Saudi labor law required |

### Earning
| Field | Type | Notes |
|---|---|---|
| id | string | Primary key |
| payslipId, earningTypeId | string | FK fields |
| amount | number | Integer fils |
| description | string | |
| isActive | boolean | |

### Deduction
| Field | Type | Notes |
|---|---|---|
| id | string | Primary key |
| payslipId, deductionTypeId | string | FK fields |
| amount | number | Integer fils |
| description | string | |
| isActive | boolean | |

### EndOfServiceBenefit
| Field | Type | Notes |
|---|---|---|
| id | string | Primary key |
| employeeId | string | FK to Employee |
| terminationDate | string | |
| lastBasicSalary | number | Integer fils |
| totalServiceYears, totalServiceDays | number | |
| benefitAmount | number | Integer fils |
| isPaid | boolean | |
| notes | string | |

### PayrollGLExport
| Field | Type | Notes |
|---|---|---|
| id | string | Primary key |
| payrollRunId, journalEntryId | string | FK fields |
| exportDate | string | |
| status | string | 'pending' / 'exported' / 'failed' |
| notes | string | |

---

## 5. Inventory Domain (10 models)

### Item
| Field | Type | Notes |
|---|---|---|
| id | string | Primary key |
| companyId, itemCategoryId, unitOfMeasureId | string | FK fields |
| sku | string | Unique |
| name, nameAr, description, barcode | string | |
| type | string | 'product' / 'service' / 'raw_material' |
| costMethod | string | 'fifo' / 'lifo' / 'average' |
| standardCost, sellingPrice | number | Integer fils |
| minimumStock, reorderPoint, maximumStock | number | |
| leadTimeDays, weight, volume | number | |
| isActive, isDeleted | boolean | |

### ItemCategory
| Field | Type | Notes |
|---|---|---|
| id | string | Primary key |
| companyId, parentId | string | FK fields (hierarchy) |
| code, name, nameAr, description | string | |
| isActive | boolean | |

### StockMovement
| Field | Type | Notes |
|---|---|---|
| id | string | Primary key |
| companyId, itemId, warehouseId | string | FK fields |
| type | string | 'receipt' / 'issue' / 'transfer' / 'adjustment' / 'return' |
| referenceType, referenceId | string | Source document |
| quantity | number | Positive=in, negative=out |
| unitCost, totalCost | number | Integer fils |
| balanceAfter | number | Running quantity |
| date, notes | string | |
| performedBy | string | FK to Employee |

### StockBalance
| Field | Type | Notes |
|---|---|---|
| id | string | Primary key |
| companyId, itemId, warehouseId | string | FK fields |
| quantity, reservedQuantity, availableQuantity | number | |
| averageCost, totalValue | number | Integer fils |
| lastMovementDate | string | |

### InventoryCycle
| Field | Type | Notes |
|---|---|---|
| id | string | Primary key |
| companyId, warehouseId | string | FK fields |
| documentNumber, name | string | |
| status | string | 'draft' / 'in_progress' / 'completed' / 'cancelled' |
| startDate, endDate | string | |
| totalItems, countedItems, discrepancies | number | |

### InventoryCycleItem
| Field | Type | Notes |
|---|---|---|
| id | string | Primary key |
| cycleId, itemId | string | FK fields |
| systemQuantity, countedQuantity, difference | number | |
| unitCost, adjustmentValue | number | Integer fils |
| notes | string | |

### InventoryAdjustment
| Field | Type | Notes |
|---|---|---|
| id | string | Primary key |
| companyId, warehouseId | string | FK fields |
| documentNumber | string | |
| type | string | 'increase' / 'decrease' / 'write_off' |
| reason | string | |
| status | string | 'draft' / 'approved' / 'posted' |
| totalValue | number | Integer fils |
| performedBy | string | FK to Employee |

### InventoryAdjustmentItem
| Field | Type | Notes |
|---|---|---|
| id | string | Primary key |
| adjustmentId, itemId | string | FK fields |
| quantity, unitCost, totalCost | number | Integer fils |
| reason | string | |

### StockTransfer
| Field | Type | Notes |
|---|---|---|
| id | string | Primary key |
| companyId | string | FK to Company |
| documentNumber | string | |
| fromWarehouseId, toWarehouseId | string | FK fields |
| status | string | 'draft' / 'in_transit' / 'received' / 'cancelled' |
| transferDate, receivedDate | string | |

### StockTransferItem
| Field | Type | Notes |
|---|---|---|
| id | string | Primary key |
| transferId, itemId | string | FK fields |
| quantity, unitCost, receivedQuantity | number | |

---

## 6. Procurement Domain (7 models)

### Vendor
| Field | Type | Notes |
|---|---|---|
| id | string | Primary key |
| companyId | string | FK to Company |
| vendorNumber | string | Auto-generated |
| name, nameAr, contactPerson | string | |
| email, phone, address, city, country | string | |
| taxNumber, paymentTerms | string | |
| rating | number | 1-5 |
| isActive, isDeleted | boolean | |

### PurchaseRequisition
| Field | Type | Notes |
|---|---|---|
| id | string | Primary key |
| companyId | string | FK to Company |
| documentNumber | string | |
| requestedBy, departmentId | string | FK fields |
| requiredDate | string | |
| status | string | 'draft' / 'pending_approval' / 'approved' / 'rejected' / 'converted' |
| notes | string | |

### PurchaseRequisitionItem
| Field | Type | Notes |
|---|---|---|
| id | string | Primary key |
| requisitionId, itemId | string | FK fields |
| quantity, unitCost, totalCost | number | Integer fils |
| requiredDate | string | |

### PurchaseOrder
| Field | Type | Notes |
|---|---|---|
| id | string | Primary key |
| companyId | string | FK to Company |
| documentNumber | string | |
| vendorId, warehouseId | string | FK fields |
| orderDate, expectedDeliveryDate | string | |
| status | string | 'draft' / 'pending_approval' / 'approved' / 'partial' / 'received' / 'cancelled' |
| paymentTerms | string | |
| subtotal, taxAmount, discountAmount, totalAmount | number | Integer fils |
| isPosted | boolean | |
| postedAt | string | Nullable |

### PurchaseOrderItem
| Field | Type | Notes |
|---|---|---|
| id | string | Primary key |
| purchaseOrderId, itemId | string | FK fields |
| quantity, receivedQuantity | number | |
| unitCost, discountPercent, taxPercent, totalCost | number | Integer fils |

### GoodsReceipt
| Field | Type | Notes |
|---|---|---|
| id | string | Primary key |
| companyId | string | FK to Company |
| documentNumber | string | |
| purchaseOrderId, vendorId, warehouseId | string | FK fields |
| receiptDate | string | |
| status | string | 'draft' / 'inspected' / 'accepted' / 'posted' / 'cancelled' |
| isPosted | boolean | |
| postedAt | string | Nullable |

### GoodsReceiptItem
| Field | Type | Notes |
|---|---|---|
| id | string | Primary key |
| goodsReceiptId, itemId, purchaseOrderItemId | string | FK fields |
| quantityReceived, quantityAccepted, quantityRejected | number | |
| unitCost, totalCost | number | Integer fils |

### VendorEvaluation
| Field | Type | Notes |
|---|---|---|
| id | string | Primary key |
| vendorId | string | FK to Vendor |
| evaluationDate | string | |
| qualityRating, deliveryRating, priceRating, serviceRating | number | 1-5 |
| overallRating | number | Calculated average |
| comments | string | |
| evaluatedBy | string | FK to Employee |
