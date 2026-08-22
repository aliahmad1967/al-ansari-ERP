# Build & Deployment Pipeline

## 1. Build Process

### Development Mode

```bash
npm run dev
```

- Starts Vite dev server with HMR (Hot Module Replacement)
- TypeScript type-checking in background
- React Fast Refresh enabled
- Source maps for debugging

### Production Build

```bash
npm run build
```

Pipeline:

```
1. tsc --noEmit                    # TypeScript type checking
2. vite build                      # Vite production build
   ├── Transpiles TypeScript/JSX
   ├── Bundles modules (tree-shaking)
   ├── Optimizes CSS (TailwindCSS purging)
   ├── Generates precache manifest
   └── Outputs to dist/
```

### Build Output

```
dist/
├── index.html                     # Entry HTML
├── assets/
│   ├── index-[hash].js           # Main JavaScript bundle
│   ├── index-[hash].css          # Main CSS bundle
│   └── vendor-[hash].js          # Third-party libraries
├── sw.js                          # Service Worker
├── manifest.json                  # PWA manifest
└── precache-manifest.json         # SW precache list
```

## 2. Electron Build

```bash
npm run electron:build
```

Pipeline:

```
1. vite build                     # Web build
2. electron-builder               # Electron packaging
   ├── Packages app with Chromium + Node.js
   ├── Includes Realm native bindings
   ├── Generates platform-specific distributable
   └── Output to release/ directory
```

### Platform Targets

| Command | Platform | Output |
|---|---|---|
| `npm run electron:build:win` | Windows | `.exe` installer |
| `npm run electron:build:mac` | macOS | `.dmg` |
| `npm run electron:build:linux` | Linux | `.AppImage`, `.deb` |

## 3. Quality Gates

### TypeScript Check

```bash
npm run typecheck
```

- Runs `tsc --noEmit`
- Must pass before build
- **Current status**: 103 errors (workflow module broken imports)

### Lint Check

```bash
npm run lint
```

- Runs ESLint on all `src/` files
- **Current status**: 20 errors, 69 warnings

### Test Suite

```bash
npm run test
```

- Runs Vitest
- 47 test suites, 653 individual tests
- Coverage report: `npm run test:coverage`

## 4. Service Worker & Offline Caching

The Service Worker (`public/sw.js`) implements:

| Strategy | What | How |
|---|---|---|
| **Precache** | Static assets (JS, CSS, HTML) | Pre-downloaded during install |
| **Runtime cache** | API responses | Cache-first with network fallback |
| **Network first** | Dynamic content | Network with cache fallback |

### Precache Manifest

Generated automatically by `vite-plugin-pwa` or custom Vite plugin:

```json
{
  "/index.html": "index-[hash].html",
  "/assets/index-[hash].js": "index-[hash].js",
  "/assets/index-[hash].css": "index-[hash].css",
  "/sw.js": "sw-[hash].js"
}
```

### Cache Versioning

Cache names include version strings for invalidation:

```
static-cache-v1
dynamic-cache-v1
```

On version update, old caches are deleted.

## 5. Database Initialization

On first launch:

```
1. DatabaseManager.initialize()
   ├── Opens Realm with schema version 8
   ├── Runs migrations if upgrading from older version
   ├── Seeds initial data (roles, permissions, default config)
   └── Returns ready Realm instance
2. DatabaseReadyGate unblocks UI
3. Application is ready
```

## 6. Environment Configuration

| Variable | Purpose | Default |
|---|---|---|
| `VITE_APP_NAME` | Application name | `AL-ANSARI ERP` |
| `VITE_DEFAULT_CURRENCY` | Default currency code | `SAR` |
| `VITE_DEFAULT_LOCALE` | Default language | `ar` |
| `VITE_REALM_SCHEMA_VERSION` | Realm schema version | `8` |

## 7. Release Process

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Run full quality gates: `npm run typecheck && npm run lint && npm run test`
4. Build: `npm run build`
5. Package Electron: `npm run electron:build`
6. Tag release in git
7. Distribute platform-specific builds

## 8. CI/CD (Future)

| Stage | Tool | Purpose |
|---|---|---|
| Lint | ESLint | Code quality |
| Type Check | TypeScript | Type safety |
| Test | Vitest | Unit/integration tests |
| Build | Vite | Production bundle |
| Package | electron-builder | Desktop distributable |
| Release | GitHub Releases | Distribution |
