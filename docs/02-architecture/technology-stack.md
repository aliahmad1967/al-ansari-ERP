# Technology Stack

## 1. Runtime & Platform

| Component | Version | Purpose |
|---|---|---|
| **Electron** | 43 | Desktop application runtime (Chromium + Node.js) |
| **Node.js** | (bundled with Electron) | Required for Realm database native bindings |
| **React** | 19 | UI framework |
| **TypeScript** | 6 | Type-safe language (strict mode enforced) |

## 2. Build & Development

| Component | Version | Purpose |
|---|---|---|
| **Vite** | 8 | Build tool and dev server |
| **TailwindCSS** | 4 | Utility-first CSS framework |
| **ESLint** | 9 | Code linting |
| **Vitest** | 4 | Unit and integration testing |

## 3. Data & State

| Component | Version | Purpose |
|---|---|---|
| **Realm** | 12.x | Local NoSQL database (offline-first) |
| **Zustand** | 5 | Lightweight state management (auth, UI state) |
| **React Router** | 7 | Client-side routing (69 routes) |
| **i18next** | 25 | Internationalization (Arabic + English) |
| **react-i18next** | 16 | React bindings for i18next |
| **Zod** | 4 | Schema validation |

## 4. Utilities & Libraries

| Component | Version | Purpose |
|---|---|---|
| **Lodash** | 4.17 | General utility functions |
| **date-fns** | 4.1 | Date manipulation and formatting |
| **uuid** | 11.1 | UUID generation |
| **Papa Parse** | 5.5 | CSV parsing and generation |
| **SheetJS (xlsx)** | 0.18 | Excel file reading/writing |
| **jsPDF** | 3.0 | PDF generation |
| **react-hot-toast** | 2.5 | Toast notifications |
| **lucide-react** | 0.524 | Icon library |
| **@hello-pangea/dnd** | 18 | Drag and drop |

## 5. Dev Dependencies

| Component | Purpose |
|---|---|
| **@types/react** | React type definitions |
| **@types/react-dom** | React DOM type definitions |
| **@types/node** | Node.js type definitions |
| **@types/lodash** | Lodash type definitions |
| **@types/papaparse** | Papa Parse type definitions |
| **@types/uuid** | UUID type definitions |
| **@vitejs/plugin-react** | Vite React plugin |
| **autoprefixer** | CSS vendor prefixing |
| **postcss** | CSS post-processing |
| **typescript** | TypeScript compiler |

## 6. NPM Scripts

| Script | Command | Purpose |
|---|---|---|
| `dev` | `vite` | Start development server |
| `build` | `tsc && vite build` | TypeScript check + production build |
| `preview` | `vite preview` | Preview production build |
| `test` | `vitest run` | Run test suite |
| `test:watch` | `vitest` | Run tests in watch mode |
| `test:coverage` | `vitest run --coverage` | Run with coverage report |
| `lint` | `eslint src/` | Run ESLint |
| `lint:fix` | `eslint src/ --fix` | Auto-fix lint issues |
| `typecheck` | `tsc --noEmit` | Type-check without emitting |
| `electron:dev` | `concurrently "vite" "electron ."` | Run in Electron dev mode |
| `electron:build` | `vite build && electron-builder` | Build Electron distributable |
| `electron:build:win` | `vite build && electron-builder --win` | Build Windows distributable |
| `electron:build:mac` | `vite build && electron-builder --mac` | Build macOS distributable |
| `electron:build:linux` | `vite build && electron-builder --linux` | Build Linux distributable |
