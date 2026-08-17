import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

const reactRefreshPlugin = {
  meta: {
    name: 'eslint-plugin-react-refresh',
    version: '0.5.4',
  },
  rules: reactRefresh.rules,
}

export default tseslint.config(
  { ignores: ['dist', 'node_modules', 'backups', 'coverage'] },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefreshPlugin,
    },
    rules: {
      ...reactHooks.configs['recommended-latest'].rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },
  {
    files: ['vite.config.ts', 'scripts/**/*.{ts,js}'],
    languageOptions: {
      globals: globals.node,
    },
  },
)
