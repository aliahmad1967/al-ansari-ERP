import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'

const srcDir = (segment: string): string =>
  fileURLToPath(new URL(`./src/${segment}`, import.meta.url))

export default defineConfig({
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
  test: {
    environment: 'node',
    globals: true,
    include: ['src/**/*.test.ts'],
    testTimeout: 10000,
  },
})
