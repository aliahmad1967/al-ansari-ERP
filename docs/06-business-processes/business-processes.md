# Business Processes

End-to-end workflows showing how modules interact for key business operations.

---

## 1. Procure-to-Pay (P2P)

### Flow
```
1. Purchase Requisition (HR/Department)
   → Employee requests items
   → Department manager approves
   → Status: draft → pending_approval → approved

2. Purchase Order (Procurement)
   → Procurement team creates PO from approved requisition
   → PO sent to vendor
   → Status: draft → pending_approval → approved

3. Goods Receipt (Procurement/Warehouse)
   → Warehouse receives goods
   → Inspection and acceptance
   → Status: draft → inspected → accepted → posted
   → Creates: StockMovement (+), StockBalance update

4. Vendor Invoice (Accounting)
   → Invoice received from vendor
   → Three-way match: PO ↔ GRN ↔ Invoice
   → Status: draft → approved → posted

5. Payment (Finance)
   → Payment processed to vendor
   → Status: draft → approved → posted
   → Creates: JournalEntry, GLEntry

### GL Entries
```
Goods Receipt:
  Dr. Inventory (asset)     XXX
    Cr. GR/IR Clearing      XXX

Vendor Invoice:
  Dr. GR/IR Clearing        XXX
  Dr. VAT Input             XXX
    Cr. Accounts Payable    XXX

Payment:
  Dr. Accounts Payable      XXX
    Cr. Bank/Cash           XXX
```

---

## 2. Order-to-Cash (O2C)

### Flow
```
1. Quotation (Sales)
   → Sales creates quotation for customer
   → Customer reviews
   → Status: draft → sent → accepted/rejected

2. Sales Order (Sales)
   → SO created from accepted quotation
   → Credit limit check
   → Status: draft → pending_approval → approved

3. Delivery Note (Sales/Warehouse)
   → Warehouse picks and ships items
   → Status: draft → shipped → delivered
   → Creates: StockMovement (-), StockBalance update

4. Sales Invoice (Sales/Accounting)
   → Invoice sent to customer
   → Multi-currency support
   → Status: draft → sent → partial/paid/overdue

5. Payment Receipt (Finance)
   → Customer payment received
   → Status: draft → approved → posted
   → Creates: JournalEntry, GLEntry

### GL Entries
```
Delivery:
  Dr. Cost of Goods Sold     XXX
    Cr. Inventory            XXX

Sales Invoice:
  Dr. Accounts Receivable    XXX
    Cr. Sales Revenue        XXX
    Cr. VAT Output           XXX

Payment Receipt:
  Dr. Bank/Cash              XXX
    Cr. Accounts Receivable  XXX
```

---

## 3. Payroll Processing

### Flow
```
1. Attendance Collection (Attendance Module)
   → Clock in/out records for period
   → Daily attendance summaries calculated

2. Payroll Run (Payroll Module)
   → Select employees for period
   → Calculate: basic salary + earnings - deductions
   → Generate payslips
   → Status: draft → processing → completed

3. Approval (Workflow)
   → Finance manager reviews payroll
   → Approves or requests changes

4. Payment (Finance)
   → Bank transfer file generated
   → Payments processed

5. GL Export (Payroll + Accounting)
   → Journal entries created for:
     - Salary expense
     - GOSI payable (employer + employee)
     - Bank disbursement
   → Status: draft → posted

### GL Entries
```
Payroll Posting:
  Dr. Salary Expense         XXX
  Dr. GOSI Expense           XXX
    Cr. GOSI Payable (employee)  XXX
    Cr. GOSI Payable (employer)  XXX
    Cr. Bank/Cash            XXX
```

---

## 4. Inventory Management

### Stock In (Receipt)
```
Goods Receipt posted → StockMovement (type: receipt)
  → StockBalance.quantity += receivedQuantity
  → StockBalance.totalValue updated
```

### Stock Out (Issue)
```
Delivery Note posted → StockMovement (type: issue)
  → StockBalance.quantity -= issuedQuantity
  → StockBalance.totalValue updated
```

### Stock Transfer
```
Transfer Created → StockMovement (type: transfer, from warehouse, -qty)
                → StockMovement (type: transfer, to warehouse, +qty)
                → Both StockBalance records updated
```

### Cycle Count
```
1. Start cycle count → InventoryCycle created
2. Count items → InventoryCycleItem records
3. Compare system vs counted → Discrepancies identified
4. Reconcile → InventoryAdjustment created
5. Post adjustment → StockMovement + StockBalance updated
```

---

## 5. Asset Depreciation

### Flow
```
1. Monthly Depreciation Run
   → DepreciationService processes all active assets
   → Calculates per-asset depreciation
   → Creates DepreciationEntry records

2. GL Export
   → Journal entries created:
     Dr. Depreciation Expense
       Cr. Accumulated Depreciation
   → Updates asset book value

3. Disposal (when asset sold/retired)
   → Final depreciation calculated
   → Disposal recorded
   → Journal entries for disposal gain/loss
```

---

## 6. Project Costing

### Flow
```
1. Project Setup
   → Budget set at project level
   → Phases and tasks defined

2. Cost Recording
   → Expenses tracked against project
   → Labor costs from attendance/payroll
   → Materials from inventory

3. GL Export
   → Project costs exported to journal entries
   → Dr. WIP/Project Expense
     Cr. Various (bank, inventory, payroll)

4. Project Closure
   → Final cost calculation
   → Profitability analysis
   → Project status → completed
```

---

## 7. Approval Workflows

### Generic Approval Flow
```
1. Document Created (draft)
2. Submit for Approval
   → ApprovalRequest created
   → Level 1 approver notified
3. Level 1 Approval
   → Approve: advance to Level 2 (if exists)
   → Reject: return to draft
4. Level 2+ Approval
   → Same as Level 1
5. Final Approval
   → Document status → approved
   → Ready for posting
```

### Status Transitions (Enforced)
| Document | Valid Transitions |
|---|---|
| Purchase Order | draft → pending_approval → approved → partial → received → cancelled |
| Sales Order | draft → pending_approval → approved → partial → delivered → invoiced → cancelled |
| Payroll Run | draft → processing → completed → cancelled |
| Expense | draft → pending_approval → approved → rejected → posted |
| Payment | draft → approved → posted → cancelled |
