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
const isThirdPartyNoise = (val) => {
  if (!val) return false;
  let str = '';
  try { str += ' ' + String(val); } catch (e) {}
  if (typeof val === 'object') {
    try {
      if (val.message) str += ' ' + String(val.message);
      if (val.name) str += ' ' + String(val.name);
      if (val.stack) str += ' ' + String(val.stack);
      if (val.reason) str += ' ' + isThirdPartyNoise(val.reason);
      if (val.filename) str += ' ' + String(val.filename);
    } catch (e) {}
  }
  return (
    str.includes('A listener indicated an asynchronous response') ||
    str.includes('message channel closed') ||
    str.includes('runtime.lastError') ||
    str.includes('unsafe-eval') ||
    str.includes('Evaluating a string as JavaScript') ||
    str.includes('violates the following Content Security Policy directive') ||
    str.includes('chrome-extension://') ||
    str.includes('chrome-extension:') ||
    str.includes('content.js') ||
    str.includes('wasm-unsafe-eval') ||
    str.includes('inline-speculation-rules') ||
    str.includes('The action has been blocked') ||
    str.includes('feature_collector') ||
    str.includes('using deprecated parameters') ||
    str.includes('initialization function') ||
    str.includes('pass a single object instead') ||
    str.includes('ERR_NETWORK_IO_SUSPENDED') ||
    str.includes('NETWORK_IO_SUSPENDED') ||
    str.includes('WebSocket')
  );
};

window.addEventListener('unhandledrejection', (event) => {
  if (isThirdPartyNoise(event) || isThirdPartyNoise(event.reason)) {
    event.preventDefault();
    if (event.stopImmediatePropagation) event.stopImmediatePropagation();
  }
}, true);

window.addEventListener('error', (event) => {
  if (isThirdPartyNoise(event) || isThirdPartyNoise(event.error) || (event.filename && (event.filename.includes('chrome-extension://') || event.filename.includes('content.js')))) {
    event.preventDefault();
    if (event.stopImmediatePropagation) event.stopImmediatePropagation();
  }
}, true);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
