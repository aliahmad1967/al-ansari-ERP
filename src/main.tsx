import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import '@/i18n/i18n'
import '@/styles/globals.css'

import App from '@/App'
import AppProviders from '@/app/AppProviders'

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Root element #root was not found in index.html')
}

createRoot(rootElement).render(
  <StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </StrictMode>,
)
