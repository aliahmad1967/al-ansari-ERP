# AL-ANSARI ERP — Documentation

Complete technical documentation for the AL-ANSARI ERP system.

## Quick Navigation

| Section | Description |
|---|---|
| [01-overview](01-overview/systems-overview.md) | System purpose, goals, features, glossary, roadmap |
| [02-architecture](02-architecture/technology-stack.md) | Technology, folder structure, data flow, patterns, build |
| [03-database](03-database/database-overview.md) | Schema, 91 models, migrations, ER diagrams, transactions |
| [04-modules](04-modules/core-and-infrastructure.md) | Per-module documentation (17 modules) |
| [05-security](05-security/security-architecture.md) | Auth, RBAC, encryption, audit |
| [06-business-processes](06-business-processes/business-processes.md) | End-to-end workflows (P2P, O2C, payroll, etc.) |
| [07-ui-ux](07-ui-ux/ui-ux-architecture.md) | Design system, components, i18n, accessibility |
| [08-development](08-development/development-guide.md) | Setup, coding standards, testing, debugging |
| [09-deployment](09-deployment/deployment-guide.md) | Build, distribution, backup, monitoring |
| [10-user-guide](10-user-guide/user-guide.md) | Per-module user tutorials, FAQ |
| [11-api](11-api/api-reference.md) | Service interfaces, hooks, utilities |
| [12-reference](12-reference/technical-reference.md) | Constants, config, dependencies, file paths |

## Documentation Rules

1. **Verified against source code** — Every fact checked against actual implementation
2. **Status marked** — IMPLEMENTED / PARTIALLY IMPLEMENTED / PLANNED / NOT IMPLEMENTED
3. **No hallucination** — Unverified items marked with "Not verified in the current implementation."
4. **Source code wins** — If docs differ from code, code is correct

## Statistics

| Metric | Value |
|---|---|
| Documentation files | 25+ |
| Sections | 12 |
| Realm models documented | 91 |
| ER diagrams | 10 |
| Module docs | 17 |
| Business processes | 7 |
