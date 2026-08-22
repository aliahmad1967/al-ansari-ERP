# UI/UX Architecture

## 1. Design System

### 1.1 Styling
- **Framework**: TailwindCSS 4
- **Approach**: Utility-first CSS
- **RTL Support**: Logical CSS properties (`ms-`/`me-` instead of `ml-`/`mr-`)
- **Theme**: Light/dark mode via ThemeProvider

### 1.2 Layout Structure
```
MainLayout
├── Header (top bar)
│   ├── Logo/branding
│   ├── Search input
│   ├── Language switcher (AR/EN)
│   ├── Theme toggle
│   ├── Notification bell
│   └── User menu
├── Sidebar (left/right based on RTL)
│   ├── Navigation menu
│   ├── Collapse/expand toggle
│   └── Module icons
├── Content area
│   └── {children} (page content)
└── Footer (status bar)
```

### 1.3 Component Library

| Component | Location | Description |
|---|---|---|
| Button | `src/components/ui/Button.tsx` | Primary/secondary/ghost variants |
| Input | `src/components/ui/Input.tsx` | Text input with label, error |
| Select | `src/components/ui/Select.tsx` | Dropdown with search |
| Modal | `src/components/ui/Modal.tsx` | Dialog overlay |
| Table | `src/components/ui/Table.tsx` | Data table with sorting |
| Card | `src/components/ui/Card.tsx` | Content container |
| Badge | `src/components/ui/Badge.tsx` | Status indicators |
| Tabs | `src/components/ui/Tabs.tsx` | Tabbed navigation |
| Pagination | `src/components/ui/Pagination.tsx` | Page navigation |
| SearchInput | `src/components/ui/SearchInput.tsx` | Search with debounce |

## 2. Internationalization

### 2.1 i18n Setup
- **Library**: i18next + react-i18next
- **Namespaces**: 20 (one per module + common + validation)
- **Languages**: Arabic (ar), English (en)
- **Default**: Arabic

### 2.2 RTL/LTR Handling
```tsx
// Root element direction based on locale
<html dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>

// TailwindCSS logical properties
<div className="ms-4 me-2 ps-3 pe-1">
  {/* Automatically flips based on direction */}
</div>
```

### 2.3 i18n Namespaces
| Namespace | Purpose |
|---|---|
| common | Shared strings (save, cancel, delete, search) |
| hr | HR module strings |
| inventory | Inventory module strings |
| procurement | Procurement module strings |
| sales | Sales module strings |
| accounting | Accounting module strings |
| payroll | Payroll module strings |
| assets | Assets module strings |
| projects | Projects module strings |
| attendance | Attendance module strings |
| finance | Finance module strings |
| reports | Reports module strings |
| settings | Settings module strings |
| dashboard | Dashboard module strings |
| organization | Organization module strings |
| workflow | Workflow module strings |
| notifications | Notification strings |
| validation | Validation message strings |
| data-management | Data management strings |
| auth | Authentication strings |

## 3. Routing

### 3.1 Route Structure
- 69 routes total
- All routes defined in `src/app/routes.tsx`
- Lazy-loaded per module
- Auth-gated with permission checks

### 3.2 Route Protection
```tsx
{
  path: '/hr/employees/create',
  element: <EmployeeCreatePage />,
  requiredPermission: 'hr.employee.create',
  // AuthProvider checks permission before rendering
}
```

## 4. State Management

### 4.1 Zustand Stores (2)
| Store | State |
|---|---|
| authStore | user, isAuthenticated, permissions, login(), logout() |
| uiStore | sidebarCollapsed, theme, language, toggleSidebar() |

### 4.2 Component State
- `useState` for simple local state
- `useReducer` for complex state logic
- Custom hooks encapsulate reusable stateful logic

## 5. Error Handling

### 5.1 Error Boundary
- `ErrorBoundary` component catches React errors
- Displays fallback UI
- Logs error for debugging

### 5.2 Toast Notifications
- `react-hot-toast` for success/error/warning messages
- Auto-dismiss after configurable timeout
- RTL-aware positioning

## 6. Forms & Validation

### 6.1 Form Pattern
```tsx
// Component renders form
// Hook provides data and mutations
// Zod schema validates input
// Service layer validates business rules

const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(EmployeeSchema),
});
```

### 6.2 Validation Layers
1. **UI**: Zod schema (immediate feedback)
2. **Service**: Business rules (data integrity)
3. **Database**: Realm schema constraints (last resort)

## 7. Performance

| Technique | Implementation |
|---|---|
| Lazy loading | React.lazy() per module route |
| Code splitting | Vite automatic chunking |
| Memoization | React.memo for expensive components |
| Virtual scrolling | For large lists (planned) |
| Optimistic updates | UI updates before server confirmation |

## 8. Accessibility

| Standard | Implementation |
|---|---|
| Keyboard navigation | All interactive elements focusable |
| Screen reader | ARIA labels on icons and buttons |
| Color contrast | TailwindCSS color tokens |
| Focus indicators | Visible focus rings |
