/**
 * Dev permission codes — shared between DevAuthService and session loader.
 * These are the permission codes assigned to the ADMINISTRATOR role in
 * development mode when Realm is unavailable.
 */

export const DEV_SEED_VERSION = 2

export const ADMIN_PERMISSIONS = [
  // Organization
  'organization.organization.view', 'organization.organization.create', 'organization.organization.update',
  'organization.branch.view', 'organization.branch.create', 'organization.branch.update', 'organization.branch.delete',
  'organization.department.view', 'organization.department.create', 'organization.department.update', 'organization.department.delete',
  'organization.user.view', 'organization.user.create', 'organization.user.update', 'organization.user.delete',
  'organization.role.view', 'organization.role.create', 'organization.role.update', 'organization.role.delete',
  'organization.permission.view',
  // HR
  'hr.employee.view', 'hr.employee.create', 'hr.employee.update', 'hr.employee.delete',
  'hr.attendance.view', 'hr.attendance.create', 'hr.attendance.update', 'hr.attendance.delete',
  'hr.leave.view', 'hr.leave.create', 'hr.leave.update', 'hr.leave.delete', 'hr.leave.approve',
  'hr.payroll.view', 'hr.payroll.create', 'hr.payroll.update', 'hr.payroll.approve',
  'hr.recruitment.view', 'hr.recruitment.create', 'hr.recruitment.update', 'hr.recruitment.delete',
  // Inventory
  'inventory.products.view', 'inventory.products.create', 'inventory.products.update', 'inventory.products.delete',
  'inventory.categories.view', 'inventory.categories.create', 'inventory.categories.update', 'inventory.categories.delete',
  'inventory.warehouses.view', 'inventory.warehouses.create', 'inventory.warehouses.update', 'inventory.warehouses.delete',
  'inventory.stock.view', 'inventory.stock.create', 'inventory.stock.update',
  'inventory.movements.view',
  'inventory.transfers.view', 'inventory.transfers.create', 'inventory.transfers.update',
  'inventory.adjustments.view', 'inventory.adjustments.create', 'inventory.adjustments.update',
  'inventory.reports.view',
  // Procurement
  'procurement.suppliers.view', 'procurement.suppliers.create', 'procurement.suppliers.update', 'procurement.suppliers.delete',
  'procurement.orders.view', 'procurement.orders.create', 'procurement.orders.update', 'procurement.orders.delete',
  'procurement.receipts.view', 'procurement.receipts.create', 'procurement.receipts.update',
  'procurement.requests.view', 'procurement.requests.create', 'procurement.requests.update',
  'procurement.invoices.view', 'procurement.invoices.create', 'procurement.invoices.update',
  'procurement.reports.view',
  // Sales
  'sales.customers.view', 'sales.customers.create', 'sales.customers.update', 'sales.customers.delete',
  'sales.quotations.view', 'sales.quotations.create', 'sales.quotations.update', 'sales.quotations.delete',
  'sales.orders.view', 'sales.orders.create', 'sales.orders.update', 'sales.orders.delete',
  'sales.deliveries.view', 'sales.deliveries.create', 'sales.deliveries.update',
  'sales.invoices.view', 'sales.invoices.create', 'sales.invoices.update', 'sales.invoices.delete',
  'sales.payments.view', 'sales.payments.create', 'sales.payments.update',
  'sales.returns.view', 'sales.returns.create', 'sales.returns.update',
  // Accounting
  'accounting.accounts.view', 'accounting.accounts.create', 'accounting.accounts.update',
  'accounting.journal.view',
  'accounting.fiscal.view', 'accounting.fiscal.create', 'accounting.fiscal.update',
  'accounting.costCenter.view', 'accounting.costCenter.create', 'accounting.costCenter.update',
  'accounting.budget.view', 'accounting.budget.create', 'accounting.budget.update',
  'accounting.reports.view',
  // Assets
  'assets.asset.view', 'assets.asset.create', 'assets.asset.update', 'assets.asset.delete',
  'assets.asset-category.view', 'assets.asset-category.create', 'assets.asset-category.update', 'assets.asset-category.delete',
  'assets.maintenance.view', 'assets.maintenance.create', 'assets.maintenance.update',
  // Projects
  'projects.project.view', 'projects.project.create', 'projects.project.update', 'projects.project.delete',
  'projects.task.view', 'projects.task.create', 'projects.task.update', 'projects.task.delete',
  'projects.milestone.view', 'projects.milestone.create', 'projects.milestone.update',
  'projects.timesheet.view', 'projects.timesheet.create', 'projects.timesheet.update',
  // Finance (legacy)
  'finance.invoice.view', 'finance.invoice.create', 'finance.invoice.update', 'finance.invoice.delete',
  'finance.payment.view', 'finance.payment.create', 'finance.payment.update', 'finance.payment.delete',
  'finance.voucher.view', 'finance.voucher.create', 'finance.voucher.update',
  'finance.account.view', 'finance.account.create', 'finance.account.update',
  'finance.budget.view', 'finance.budget.create', 'finance.budget.update',
  // Settings & notifications
  'settings.system.view', 'settings.system.update',
  'settings.security.view',
  'settings.backup.view', 'settings.backup.create',
  'reports.report.view', 'reports.report.create',
  'notifications.notification.view', 'notifications.notification.create', 'notifications.notification.update', 'notifications.notification.delete',
]
