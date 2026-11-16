import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { getLang, loadLanguage } from './lib/i18n'

document.documentElement.lang = getLang()
import App from './App.tsx'

// Riders who chose Filipino get its text before the first screen (no flash of English).
loadLanguage()
  .catch(() => { /* offline and not cached yet: English */ })
  .finally(() => {
    createRoot(document.getElementById('root')!).render(
      <StrictMode>
        <App />
      </StrictMode>,
    )
  })
// Offline support (public/sw.js). Only in the built app: in `npm run dev` it would serve stale files.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => { /* the app still works online */ })
  })
}
