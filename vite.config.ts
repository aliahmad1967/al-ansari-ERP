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

export default defineConfig({
  plugins: [externalizeNodePackages(), react(), tailwindcss()],
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
