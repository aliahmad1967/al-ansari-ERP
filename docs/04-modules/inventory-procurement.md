# Inventory & Procurement Modules

---

## 1. Inventory Module

**Path**: `src/modules/inventory/`
**Purpose**: Item catalog, stock tracking, warehouse transfers, cycle counts, adjustments.

### Models (10)
- Item, ItemCategory, StockMovement, StockBalance, InventoryCycle, InventoryCycleItem, InventoryAdjustment, InventoryAdjustmentItem, StockTransfer, StockTransferItem

### Repositories (10)
- `ItemRepository` — `findAll()`, `findBySku()`, `findByCategory()`, `search()`, `findLowStock()`
- `ItemCategoryRepository` — `findHierarchy()`
- `StockMovementRepository` — `findByItem()`, `findByWarehouse()`, `findByDateRange()`, `findByReference()`
- `StockBalanceRepository` — `findByItemAndWarehouse()`, `findLowStock()`, `findOutOfStock()`
- `InventoryCycleRepository`, `InventoryCycleItemRepository`
- `InventoryAdjustmentRepository`, `InventoryAdjustmentItemRepository`
- `StockTransferRepository`, `StockTransferItemRepository`

### Services
- `ItemService` — Item CRUD, SKU generation
- `StockService` — Stock in/out, balance calculation, movement history
- `InventoryCycleService` — Start/count/reconcile cycle counts
- `StockTransferService` — Create/process/complete transfers

### Hooks
| Hook | Purpose |
|---|---|
| `useItems(filters?)` | Item list with filtering |
| `useItemById(id)` | Single item detail |
| `useStockBalance(itemId?, warehouseId?)` | Current stock levels |
| `useStockMovements(filters?)` | Movement history |
| `useLowStockAlerts()` | Items below minimum stock |
| `useStockTransfer()` | Transfer operations |

### Stock Calculation Rules
```
Available = Quantity - ReservedQuantity
Total Value = Quantity × AverageCost (for average costing)
Movement Types: receipt (+), issue (-), transfer (+/-), adjustment (+/-), return (+)
```

### Pages
| Page | Route | Permission |
|---|---|---|
| ItemListPage | `/inventory/items` | `inventory.item.view` |
| ItemDetailPage | `/inventory/items/:id` | `inventory.item.view` |
| StockBalancePage | `/inventory/stock` | `inventory.stock.view` |
| StockMovementPage | `/inventory/movements` | `inventory.movement.view` |
| StockTransferPage | `/inventory/transfers` | `inventory.transfer.view` |
| InventoryCyclePage | `/inventory/cycles` | `inventory.cycle.view` |
| AdjustmentPage | `/inventory/adjustments` | `inventory.adjustment.view` |

### Tests
- `item.test.ts` — CRUD, SKU, search
- `stock.test.ts` — Movement creation, balance calculation, low stock detection
- `cycle.test.ts` — Count process, discrepancy calculation
- `transfer.test.ts` — Transfer workflow, stock movement creation

---

## 2. Procurement Module

**Path**: `src/modules/procurement/`
**Purpose**: Purchase requisitions, purchase orders, goods receipts, vendor evaluation.

### Models (7)
- Vendor, PurchaseRequisition, PurchaseRequisitionItem, PurchaseOrder, PurchaseOrderItem, GoodsReceipt, GoodsReceiptItem, VendorEvaluation

### Repositories (8)
- `VendorRepository` — `findAll()`, `search()`, `findByRating()`
- `PurchaseRequisitionRepository` — `findByStatus()`, `findPendingApproval()`
- `PurchaseRequisitionItemRepository`
- `PurchaseOrderRepository` — `findByVendor()`, `findByStatus()`, `findPendingDelivery()`
- `PurchaseOrderItemRepository`
- `GoodsReceiptRepository` — `findByPurchaseOrder()`, `findUnposted()`
- `GoodsReceiptItemRepository`
- `VendorEvaluationRepository`

### Services
- `VendorService` — CRUD, evaluation scoring
- `PurchaseRequisitionService` — Create/approve/convert to PO
- `PurchaseOrderService` — Create/approve/post, track delivery status
- `GoodsReceiptService` — Receive/inspect/accept/post, create stock movements
- `VendorEvaluationService` — Score vendors across dimensions

### Document Flow
```
Purchase Requisition → (approved) → Purchase Order → (received) → Goods Receipt → (posted) → Stock Movement + Journal Entry
```

### Hooks
| Hook | Purpose |
|---|---|
| `useVendors(filters?)` | Vendor list |
| `usePurchaseOrders(filters?)` | PO list |
| `useGoodsReceipts(filters?)` | GR list |
| `usePurchaseOrderCreate()` | Create PO |
| `useGoodsReceiptPost()` | Post GR + stock + GL |

### Pages
| Page | Route | Permission |
|---|---|---|
| VendorListPage | `/procurement/vendors` | `procurement.vendor.view` |
| PurchaseRequisitionListPage | `/procurement/requisitions` | `procurement.requisition.view` |
| PurchaseOrderListPage | `/procurement/orders` | `procurement.order.view` |
| PurchaseOrderDetailPage | `/procurement/orders/:id` | `procurement.order.view` |
| GoodsReceiptListPage | `/procurement/receipts` | `procurement.receipt.view` |
| VendorEvaluationPage | `/procurement/evaluations` | `procurement.evaluation.view` |

### Tests
- `vendor.test.ts` — CRUD, search, evaluation
- `purchaseOrder.test.ts` — Status workflow, totals
- `goodsReceipt.test.ts` — Receipt posting, stock creation, GL entries
- `threeWayMatch.test.ts` — PO/GR/Invoice matching
