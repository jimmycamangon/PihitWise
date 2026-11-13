import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { getLang } from './lib/i18n'

document.documentElement.lang = getLang()
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
// Offline support (public/sw.js). Only in the built app: in `npm run dev` it would serve stale files.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => { /* the app still works online */ })
  })
}
