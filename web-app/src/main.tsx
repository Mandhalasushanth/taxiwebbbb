import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { App } from './app/App'
import { purgeStaleStorage } from './core/storage/storageCleanup'
import './styles/global.css'

const container = document.getElementById('root')
if (!container) throw new Error('Root element #root was not found in index.html')

// Drop data left in the browser by older versions before anything reads it
purgeStaleStorage()

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
