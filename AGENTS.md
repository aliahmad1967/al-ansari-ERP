CRITICAL ARCHITECTURE RULES, MANDATORY FOR EVERY PHASE

You are extending an existing production-grade ERP system.

Before writing or modifying ANY code:

1\. INSPECT FIRST

&#x20; - Inspect the existing project structure.

&#x20; - Inspect relevant existing files.

&#x20; - Inspect existing models, repositories, services, hooks, stores, routes, and components.

&#x20; - Understand existing architecture before making changes.

&#x20; - Never assume a file is empty or missing.

&#x20; - Never recreate existing functionality unnecessarily.

2\. NEVER REBUILD THE PROJECT

&#x20; - Do not delete the existing project.

&#x20; - Do not recreate the project from scratch.

&#x20; - Do not replace working architecture with a different architecture without explicit justification.

&#x20; - Preserve all existing functionality.

&#x20; - Extend the existing architecture incrementally.

3\. MANDATORY ARCHITECTURE

&#x20; UI

&#x20; ↓

&#x20; Components / Pages

&#x20; ↓

&#x20; Hooks

&#x20; ↓

&#x20; Services

&#x20; ↓

&#x20; Repositories

&#x20; ↓

&#x20; Realm Database

&#x20; NEVER use:

&#x20; UI

&#x20; ↓

&#x20; Direct Realm manipulation

&#x20; React components must NOT directly create, update, delete, or query Realm objects.

4\. SEPARATION OF RESPONSIBILITIES

&#x20; Components:

&#x20; - UI only.

&#x20; - No database logic.

&#x20; - No business rules.

&#x20; - No complex data transformations.

&#x20; Pages:

&#x20; - Compose components.

&#x20; - Connect hooks to the UI.

&#x20; - No direct database operations.

&#x20; Hooks:

&#x20; - React integration.

&#x20; - State handling.

&#x20; - Calling services.

&#x20; - No direct Realm access unless through an approved abstraction.

&#x20; Services:

&#x20; - Business logic.

&#x20; - Validation orchestration.

&#x20; - Workflow logic.

&#x20; - Transaction coordination.

&#x20; - Calling repositories.

&#x20; Repositories:

&#x20; - Database access only.

&#x20; - Realm queries.

&#x20; - Realm writes.

&#x20; - Mapping database entities when necessary.

&#x20; - No UI logic.

&#x20; Realm:

&#x20; - Persistence layer only.

5\. SINGLE SOURCE OF TRUTH

&#x20; Do not duplicate business logic.

&#x20; If a calculation or rule is required by multiple modules:

&#x20; - Put it in the appropriate service/domain layer.

&#x20; - Reuse it everywhere.

&#x20; Examples:

&#x20; - Currency calculations.

&#x20; - Payroll calculations.

&#x20; - Inventory calculations.

&#x20; - Permission checks.

&#x20; - Document numbering.

&#x20; - Approval rules.

&#x20; - Accounting calculations.

6\. DATABASE RULES

&#x20; All Realm operations must go through repositories.

&#x20; Use transactions for related writes.

&#x20; Never partially update related ERP records.

&#x20; Example:

&#x20; Purchase Order

&#x20; ↓

&#x20; Goods Receipt

&#x20; ↓

&#x20; Stock Movement

&#x20; These operations must be handled safely and consistently.

7\. FINANCIAL INTEGRITY

&#x20; Financial data requires special protection.

&#x20; Never use unsafe floating-point arithmetic for money calculations.

&#x20; Use precise decimal-safe calculations.

&#x20; Posted financial transactions must not be silently modified.

&#x20; Corrections must use proper reversal or adjustment mechanisms.

&#x20; Accounting rules must be centralized.

8\. INVENTORY INTEGRITY

&#x20; Never directly manipulate StockBalance as the source of truth.

&#x20; Inventory changes must originate from StockMovement transactions.

&#x20; Example:

&#x20; Purchase

&#x20; ↓

&#x20; Goods Receipt

&#x20; ↓

&#x20; Stock Movement

&#x20; ↓

&#x20; Stock Balance

&#x20; Sale

&#x20; ↓

&#x20; Delivery

&#x20; ↓

&#x20; Stock Movement

&#x20; ↓

&#x20; Stock Balance

9\. AUDITABILITY

&#x20; Important ERP operations must be auditable.

&#x20; Audit operations such as:

&#x20; - Create

&#x20; - Update

&#x20; - Delete

&#x20; - Approve

&#x20; - Reject

&#x20; - Post

&#x20; - Cancel

&#x20; - Login

&#x20; - Logout

&#x20; - Import

&#x20; - Export

&#x20; - Backup

&#x20; - Restore

&#x20; Never log passwords, tokens, or secrets.

10\. STATUS AND WORKFLOW INTEGRITY

&#x20; Use explicit status transitions.

&#x20; Example:

&#x20; Draft

&#x20; ↓

&#x20; Pending Approval

&#x20; ↓

&#x20; Approved

&#x20; ↓

&#x20; Posted

&#x20; ↓

&#x20; Completed

&#x20; Invalid status transitions must be rejected.

&#x20; Do not allow UI code to bypass workflow rules.

11\. PERMISSION ARCHITECTURE

&#x20; Permission checks must be centralized.

&#x20; Use a consistent permission model:

&#x20; module.resource.action

&#x20; Examples:

&#x20; hr.employee.view

&#x20; hr.employee.create

&#x20; hr.employee.update

&#x20; hr.employee.delete

&#x20; finance.invoice.view

&#x20; finance.invoice.approve

&#x20; inventory.product.create

&#x20; Do not scatter hardcoded role checks throughout the UI.

12\. INTERNATIONALIZATION

&#x20; Every user-facing string must use i18n.

&#x20; NEVER hardcode:

&#x20; Arabic text directly in components.

&#x20; English text directly in components.

&#x20; Support:

&#x20; Arabic = RTL

&#x20; English = LTR

&#x20; Use logical CSS properties whenever possible.

13\. COMPONENT REUSE

&#x20; Before creating a new component:

&#x20; 1. Search for an existing reusable component.

&#x20; 2. Reuse it if possible.

&#x20; 3. Extend it if appropriate.

&#x20; 4. Only create a new component when necessary.

&#x20; Do not create multiple versions of the same component.

14\. SERVICE REUSE

&#x20; Before creating a new service:

&#x20; 1. Search existing services.

&#x20; 2. Check whether the required functionality already exists.

&#x20; 3. Extend existing services when appropriate.

&#x20; 4. Avoid duplicate business logic.

15\. DATABASE MODEL REUSE

&#x20; Before creating a new Realm model:

&#x20; 1. Search existing models.

&#x20; 2. Determine whether an existing entity can be reused.

&#x20; 3. Avoid duplicate entities representing the same business concept.

16\. TYPE SAFETY

&#x20; TypeScript strict mode is mandatory.

&#x20; Avoid:

&#x20; - any

&#x20; - @ts-ignore

&#x20; - unsafe type assertions

&#x20; - duplicated interfaces

&#x20; If a type must be weakened, document the reason.

17\. ERROR HANDLING

&#x20; Every database and business operation must have appropriate error handling.

&#x20; Do not silently swallow errors.

&#x20; Provide user-friendly translated error messages.

&#x20; Log technical details safely for debugging.

18\. VALIDATION

&#x20; Validate data at multiple appropriate layers:

&#x20; UI validation

&#x20; ↓

&#x20; Service validation

&#x20; ↓

&#x20; Database/business integrity

&#x20; Never rely exclusively on frontend validation.

19\. DESTRUCTIVE OPERATIONS

&#x20; Never perform destructive operations without confirmation.

&#x20; Examples:

&#x20; Delete

&#x20; Archive

&#x20; Restore

&#x20; Database Reset

&#x20; Bulk Delete

&#x20; Bulk Import

&#x20; Backup Restore

20\. TESTING

&#x20; Every significant feature must have tests.

&#x20; Test:

&#x20; - business logic

&#x20; - services

&#x20; - repositories

&#x20; - calculations

&#x20; - workflows

&#x20; - permissions

&#x20; - critical UI behavior

&#x20; Do not consider a feature complete merely because the UI renders.

21\. NO FAKE IMPLEMENTATION

&#x20; Do not create fake functionality merely to make the interface look complete.

&#x20; Do not use:

&#x20; setTimeout() as fake backend logic.

&#x20; Random numbers as fake business data.

&#x20; Hardcoded financial calculations.

&#x20; Fake success messages.

&#x20; Fake database operations.

&#x20; Development seed data is allowed only when explicitly required.

22\. NO PREMATURE ABSTRACTION

&#x20; Do not create unnecessary frameworks or abstractions.

&#x20; Use simple, maintainable architecture.

&#x20; Abstract repeated patterns when they actually repeat.

23\. DEPENDENCY POLICY

&#x20; Use free and open-source dependencies whenever possible.

&#x20; Before adding a dependency:

&#x20; - Check whether the project already has an equivalent.

&#x20; - Avoid unnecessary dependencies.

&#x20; - Avoid paid services.

&#x20; - Avoid proprietary services unless explicitly requested.

&#x20; - Prefer mature and actively maintained packages.

24\. OFFLINE-FIRST PRINCIPLE

&#x20; Realm is the local source of truth for the current application.

&#x20; The application must remain functional when network connectivity is unavailable.

&#x20; Do not introduce a remote dependency merely to implement local ERP functionality.

&#x20; Design services and repositories so a future synchronization layer can be added without rewriting the UI or business modules.

25\. FUTURE SYNCHRONIZATION

&#x20; Do NOT implement server synchronization unless explicitly requested in the current phase.

&#x20; However, architecture must allow:

&#x20; UI

&#x20; ↓

&#x20; Hooks

&#x20; ↓

&#x20; Services

&#x20; ↓

&#x20; Repository Interface

&#x20; ↓

&#x20; Realm Repository

&#x20; Later:

&#x20; UI

&#x20; ↓

&#x20; Hooks

&#x20; ↓

&#x20; Services

&#x20; ↓

&#x20; Repository Interface

&#x20; ↓

&#x20; Realm Repository + Sync Layer

&#x20; Do not couple the UI directly to Realm in a way that makes future synchronization impossible.

26\. MODULE BOUNDARIES

&#x20; Each ERP module must remain independently organized.

&#x20; Example:

&#x20; HR

&#x20; Finance

&#x20; Inventory

&#x20; Procurement

&#x20; Sales

&#x20; Assets

&#x20; Projects

&#x20; Modules may communicate through clearly defined services/interfaces.

&#x20; Do not create uncontrolled cross-module dependencies.

27\. CROSS-MODULE TRANSACTIONS

&#x20; When a business operation affects multiple modules, coordinate it through the service/domain layer.

&#x20; Example:

&#x20; Sales Invoice

&#x20; ↓

&#x20; Sales Service

&#x20; ├── Invoice Repository

&#x20; ├── Inventory Service

&#x20; └── Accounting Service

&#x20; Do not let the Sales UI directly manipulate Inventory or Accounting.

28\. BEFORE MODIFYING ANY FILE

&#x20; Check:

&#x20; - Does this functionality already exist?

&#x20; - Is there an existing component?

&#x20; - Is there an existing hook?

&#x20; - Is there an existing service?

&#x20; - Is there an existing repository?

&#x20; - Is there an existing model?

&#x20; - Is there an existing translation?

&#x20; - Is there an existing type?

&#x20; Reuse before creating.

29\. AFTER IMPLEMENTATION

&#x20; Always:

&#x20; 1. Inspect changed files.

&#x20; 2. Check TypeScript errors.

&#x20; 3. Check lint errors.

&#x20; 4. Run relevant tests.

&#x20; 5. Run production build.

&#x20; 6. Fix errors.

&#x20; 7. Verify existing functionality was not broken.

&#x20; 8. Report exactly what changed.

30\. DEFINITION OF DONE

&#x20; A phase is NOT complete because code was generated.

&#x20; A phase is complete only when:

&#x20; - Feature implemented.

&#x20; - Architecture respected.

&#x20; - Existing functionality preserved.

&#x20; - Types valid.

&#x20; - Validation implemented.

&#x20; - Errors handled.

&#x20; - Permissions implemented where required.

&#x20; - i18n implemented.

&#x20; - RTL/LTR verified.

&#x20; - Tests implemented where applicable.

&#x20; - Build passes.

&#x20; - Lint passes.

&#x20; - No known critical errors remain.

FINAL ARCHITECTURAL PRINCIPLE:

&#x20; Keep the ERP layered, modular, testable, offline-first, and extensible.

&#x20; NEVER bypass the architecture for convenience.

&#x20; NEVER put database logic directly into UI components.

&#x20; NEVER duplicate business logic.

&#x20; NEVER rewrite working modules unnecessarily.

&#x20; ALWAYS inspect first.

&#x20; ALWAYS reuse before creating.

&#x20; ALWAYS preserve existing functionality.

&#x20; ALWAYS validate before considering the phase complete.
