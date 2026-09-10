import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Clear legacy/mock local storage data on initialization to ensure fresh live backend data sync
try {
  if (typeof window !== 'undefined' && window.localStorage) {
    const keysToPurge = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (
        key.startsWith('connect_fallback_') ||
        key.startsWith('connect_vendor_') ||
        key.startsWith('connect_products_') ||
        key.startsWith('connect_deleted_')
      )) {
        keysToPurge.push(key);
      }
    }
    keysToPurge.forEach(k => localStorage.removeItem(k));
  }
} catch (err) {
  // Ignore storage access errors
}

// Automatically reload page on new deployment bundle update (fixes 404 old chunk errors)
window.addEventListener('vite:preloadError', () => {
  window.location.reload();
});

window.addEventListener('error', (e) => {
  if (e.target && (e.target.tagName === 'SCRIPT' || e.target.tagName === 'LINK')) {
    const src = e.target.src || e.target.href || '';
    if (src.includes('/assets/') || src.includes('.js')) {
      const key = 'connect_chunk_reload_time';
      const last = localStorage.getItem(key);
      const now = Date.now();
      if (!last || now - Number(last) > 10000) {
        localStorage.setItem(key, String(now));
        window.location.reload();
      }
    }
  }
}, true);

// Suppress third-party Chrome Extension and network suspension noise in console
window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason?.message || (typeof event.reason === 'string' ? event.reason : '');
  if (
    reason.includes('A listener indicated an asynchronous response') ||
    reason.includes('message channel closed') ||
    reason.includes('runtime.lastError') ||
    reason.includes('ERR_NETWORK_IO_SUSPENDED') ||
    reason.includes('NETWORK_IO_SUSPENDED')
  ) {
    event.preventDefault();
  }
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
