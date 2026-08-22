# Development Guide

## 1. Prerequisites

| Requirement | Version |
|---|---|
| Node.js | 18+ (required for Realm) |
| npm | 9+ |
| Git | 2.x |
| IDE | VS Code (recommended) |

## 2. Getting Started

```bash
# Clone the repository
git clone https://github.com/aliahmad1967/al-ansari-ERP.git
cd al-ansari-ERP

# Install dependencies
npm install

# Start development server
npm run dev
```

## 3. Development Scripts

| Script | Command | Purpose |
|---|---|---|
| Dev server | `npm run dev` | Start Vite dev server |
| Type check | `npm run typecheck` | Check TypeScript errors |
| Lint | `npm run lint` | Run ESLint |
| Lint fix | `npm run lint:fix` | Auto-fix lint issues |
| Test | `npm run test` | Run test suite |
| Test watch | `npm run test:watch` | Tests in watch mode |
| Test coverage | `npm run test:coverage` | Tests with coverage |
| Build | `npm run build` | Production build |
| Electron dev | `npm run electron:dev` | Run in Electron |

## 4. Project Structure

See [02-architecture/folder-structure.md](../02-architecture/folder-structure.md) for complete directory structure.

## 5. Coding Standards

### 5.1 TypeScript
- Strict mode enforced
- No `any` types
- No `@ts-ignore`
- Prefer interfaces over type aliases for object shapes
- Use `readonly` for immutable data

### 5.2 File Naming
- Components: `PascalCase.tsx`
- Hooks: `useCamelCase.ts`
- Services: `PascalCaseService.ts`
- Repositories: `PascalCaseRepository.ts`
- Tests: `same-name.test.ts`

### 5.3 Component Guidelines
- One component per file
- Max ~200 lines per component
- Extract reusable parts to separate components
- Use hooks for state and logic
- No direct Realm access from components

### 5.4 Commit Convention
```
feat: Add new feature
fix: Fix a bug
refactor: Refactor existing code
docs: Documentation changes
test: Add/update tests
chore: Build/config changes
```

## 6. Testing

### 6.1 Test Framework
- **Vitest** for unit and integration tests
- **React Testing Library** for component tests

### 6.2 Test Organization
```
src/modules/{module}/__tests__/
  ├── {entity}.test.ts        # Unit tests
  ├── {service}.test.ts       # Service tests
  └── {component}.test.tsx    # Component tests
```

### 6.3 Writing Tests
```typescript
// Unit test
describe('Money', () => {
  it('should format SAR correctly', () => {
    expect(Money.format(150000, 'SAR')).toBe('SAR 1,500.00');
  });
});

// Integration test
describe('EmployeeService', () => {
  it('should create an employee', () => {
    const realm = getTestRealm();
    const employee = EmployeeService.create(realm, mockData);
    expect(employee.id).toBeDefined();
    expect(employee.employeeNumber).toMatch(/^EMP-/);
  });
});
```

### 6.4 Running Tests
```bash
# Run all tests
npm run test

# Run specific module tests
npm run test -- --testPathPattern=hr

# Run with coverage
npm run test:coverage
```

## 7. Database Development

### 7.1 Adding a New Model
1. Create model in `src/core/models/NewModel.ts`
2. Register in `database-manager.ts` schema array
3. Add to migration in `migrations.ts` if upgrading schema
4. Create repository extending BaseRepository
5. Create service with business logic
6. Create hook for React integration
7. Write tests

### 7.2 Schema Changes
1. Increment `REALM_SCHEMA_VERSION`
2. Add migration logic for version upgrade
3. Test all migration paths (fresh, upgrade)

### 7.3 Test Database
- Tests use isolated Realm instances
- Clean up after each test
- Use `getTestRealm()` utility

## 8. Common Patterns

### 8.1 Adding a New Module
1. Create directory: `src/modules/{name}/`
2. Add subdirectories: `components/`, `pages/`, `hooks/`, `services/`, `validation/`, `types/`, `__tests__/`
3. Create services, hooks, pages
4. Add routes in `src/app/routes.tsx`
5. Add i18n namespace
6. Write tests

### 8.2 Adding a New Page
1. Create page component in `pages/`
2. Create hook if needed
3. Add route in `routes.tsx`
4. Add permission if needed
5. Add i18n strings
6. Write tests

## 9. Debugging

### 9.1 Common Issues
| Issue | Solution |
|---|---|
| Realm not opening | Check Node.js version, native bindings |
| TypeScript errors | Run `npm run typecheck` |
| Build fails | Check for missing imports, type errors |
| Tests fail | Check Realm cleanup, mock data |

### 9.2 Dev Tools
- React DevTools for component inspection
- Zustand DevTools for store state
- Vite HMR for instant feedback
- ESLint for code quality

## 10. Architecture Rules

See `AGENTS.md` for the complete list of mandatory architecture rules. Key rules:

1. **Layered Architecture**: UI → Hooks → Services → Repositories → Realm
2. **No Direct Realm Access**: Components must never directly query/modify Realm
3. **Single Source of Truth**: No duplicate business logic
4. **Financial Integrity**: Integer fils for all monetary values
5. **Auditability**: Log all significant operations
6. **i18n**: All user-facing strings use i18n
