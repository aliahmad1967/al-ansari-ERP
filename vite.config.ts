import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, URL } from 'node:url'

import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

const srcDir = (segment: string): string =>
  fileURLToPath(new URL(`./src/${segment}`, import.meta.url))

/**
 * Treats Node.js-only packages as external so Vite never attempts to
 * resolve or bundle them. Required because this desktop app imports
 * Realm (a native Node.js module) through the repository layer.
 */
function externalizeNodePackages(): Plugin {
  const EXTERNALS = ['realm', 'node:crypto']
  return {
    name: 'externalize-node-packages',
    enforce: 'pre',
    resolveId(source) {
      if (EXTERNALS.includes(source) || EXTERNALS.some((ext) => source.startsWith(ext + '/'))) {
        return { id: source, external: true }
      }
      return null
    },
  }
}

/**
 * Generates a precache manifest JSON file after the build completes.
 * The service worker reads this manifest at install time to pre-cache
 * all hashed Vite build output (JS, CSS, fonts, etc.).
 *
 * The manifest is written to `public/precache-manifest.json` so it is
 * served as a static asset. It contains only the public paths (starting
 * with `/`) that the service worker can fetch.
 */
function precacheManifest(): Plugin {
  return {
    name: 'precache-manifest',
    apply: 'build',
    enforce: 'post',
    closeBundle() {
      try {
        const outDir = path.resolve(process.cwd(), 'dist')
        const manifestPath = path.join(outDir, '.vite', 'manifest.json')
        const publicDir = path.resolve(process.cwd(), 'public')

        if (!fs.existsSync(manifestPath)) {
          console.warn('[precache-manifest] Vite manifest not found, skipping.')
          return
        }

        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'))
        const urls: string[] = []

        // Extract all asset file paths from the Vite manifest
        for (const entry of Object.values(manifest)) {
          if (typeof entry !== 'object' || entry === null) continue
          const asset = entry as { file?: string; css?: string[]; assets?: string[] }

          if (asset.file) {
            urls.push(`/${asset.file}`)
          }
          if (Array.isArray(asset.css)) {
            for (const cssFile of asset.css) {
              urls.push(`/${cssFile}`)
            }
          }
          if (Array.isArray(asset.assets)) {
            for (const assetFile of asset.assets) {
              urls.push(`/${assetFile}`)
            }
          }
        }

        // Deduplicate and sort
        const uniqueUrls = [...new Set(urls)].sort()

        // Write to dist/ (served as public asset)
        const outputPath = path.join(outDir, 'precache-manifest.json')
        fs.writeFileSync(outputPath, JSON.stringify(uniqueUrls, null, 2), 'utf8')

        // Also copy to public/ for dev mode availability
        const devOutputPath = path.join(publicDir, 'precache-manifest.json')
        fs.writeFileSync(devOutputPath, JSON.stringify(uniqueUrls, null, 2), 'utf8')

        console.log(`[precache-manifest] Generated manifest with ${uniqueUrls.length} URLs`)
      } catch (error) {
        console.warn('[precache-manifest] Failed to generate manifest:', error)
      }
    },
  }
}

export default defineConfig({
  plugins: [externalizeNodePackages(), react(), tailwindcss(), precacheManifest()],
  resolve: {
    alias: [
      { find: '@/app', replacement: srcDir('app') },
      { find: '@/components', replacement: srcDir('components') },
      { find: '@/core', replacement: srcDir('core') },
      { find: '@/modules', replacement: srcDir('modules') },
      { find: '@/hooks', replacement: srcDir('hooks') },
      { find: '@/stores', replacement: srcDir('stores') },
      { find: '@/types', replacement: srcDir('types') },
      { find: '@/lib', replacement: srcDir('lib') },
      { find: '@', replacement: srcDir('') },
    ],
  },
  optimizeDeps: {
    exclude: ['realm'],
  },
  build: {
    manifest: true,
    rollupOptions: {
      external: ['realm', 'node:crypto'],
    },
  },
  server: {
    port: 5173,
    host: true,
  },
  preview: {
    port: 4173,
    host: true,
  },
})
