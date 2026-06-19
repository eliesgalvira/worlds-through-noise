import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'katex/dist/katex.min.css'
import './index.css'
import App from './App.tsx'
import { loadInitialFonts } from './lib/initial-fonts.ts'

const rootElement = document.getElementById('root')

if (rootElement === null) {
  throw new Error('Missing root element')
}

await loadInitialFonts()

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
