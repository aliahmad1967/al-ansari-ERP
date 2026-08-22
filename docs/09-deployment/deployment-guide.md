# Deployment Guide

## 1. Build Process

### 1.1 Production Build
```bash
npm run build
```

Pipeline:
1. `tsc --noEmit` — TypeScript type checking
2. `vite build` — Bundles, optimizes, generates precache manifest

Output: `dist/` directory

### 1.2 Electron Build
```bash
npm run electron:build
```

Pipeline:
1. Vite production build
2. electron-builder packages app with Chromium + Node.js
3. Includes Realm native bindings
4. Platform-specific distributable

## 2. Platform Targets

| Command | Platform | Output |
|---|---|---|
| `npm run electron:build:win` | Windows | `.exe` installer |
| `npm run electron:build:mac` | macOS | `.dmg` |
| `npm run electron:build:linux` | Linux | `.AppImage`, `.deb` |

## 3. Environment Variables

| Variable | Purpose | Default |
|---|---|---|
| `VITE_APP_NAME` | Application name | `AL-ANSARI ERP` |
| `VITE_DEFAULT_CURRENCY` | Default currency | `SAR` |
| `VITE_DEFAULT_LOCALE` | Default language | `ar` |
| `VITE_REALM_SCHEMA_VERSION` | Schema version | `8` |

## 4. Distribution

### 4.1 Windows
- `.exe` installer (electron-builder NSIS)
- Auto-update support (future)
- Installs to `Program Files`

### 4.2 macOS
- `.dmg` disk image
- Code signing (required for distribution)
- Notarization (recommended)

### 4.3 Linux
- `.AppImage` (portable)
- `.deb` (Debian/Ubuntu package)

## 5. Post-Installation

### First Launch
1. Application creates Realm database in user data directory
2. Runs migrations if needed
3. Seeds initial data (roles, permissions)
4. User sees login screen
5. User creates admin account or uses default

### Data Location
| Platform | Path |
|---|---|
| Windows | `%APPDATA%/al-ansari-erp/` |
| macOS | `~/Library/Application Support/al-ansari-erp/` |
| Linux | `~/.config/al-ansari-erp/` |

## 6. Service Worker & Offline

### 6.1 Precache
- Static assets (JS, CSS, HTML) pre-downloaded
- Application works without network after first load

### 6.2 Cache Versioning
- Cache names include version strings
- Old caches deleted on version update

### 6.3 Offline Detection
- `OfflineHealthService` monitors connectivity
- `OfflineHealthBanner` shows status
- Recovery options available

## 7. Monitoring & Health

### 7.1 Database Health
- Schema version check
- Table record counts
- Last migration date
- Database file size

### 7.2 Application Health
- Service Worker status
- Precache status
- Offline/online status
- Error log

## 8. Backup & Restore

### 8.1 Backup
- Full Realm database backup
- Exported as encrypted file
- User-triggered via Settings > Backup

### 8.2 Restore
- Import backup file
- Validates backup integrity
- Restores database to backup state
- Requires application restart

## 9. CI/CD (Planned)

| Stage | Tool | Purpose |
|---|---|---|
| Lint | ESLint | Code quality |
| Type Check | TypeScript | Type safety |
| Test | Vitest | Unit/integration tests |
| Build | Vite | Production bundle |
| Package | electron-builder | Desktop distributable |
| Release | GitHub Releases | Distribution |

## 10. Troubleshooting

| Issue | Solution |
|---|---|
| Build fails | Run `npm run typecheck` to identify errors |
| Electron won't start | Check Node.js version (18+) |
| Database corrupted | Restore from backup |
| Service Worker not updating | Clear cache, reload |
| Slow startup | Check database size, migrations |
