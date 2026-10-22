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
  const lower = str.toLowerCase();
  return (
    lower.includes('a listener indicated an asynchronous response') ||
    lower.includes('message channel closed') ||
    lower.includes('runtime.lasterror') ||
    lower.includes('unsafe-eval') ||
    lower.includes('evaluating a string as javascript') ||
    lower.includes('violates the following content security policy directive') ||
    lower.includes('chrome-extension://') ||
    lower.includes('chrome-extension:') ||
    lower.includes('content.js') ||
    lower.includes('wasm-unsafe-eval') ||
    lower.includes('inline-speculation-rules') ||
    lower.includes('the action has been blocked') ||
    lower.includes('feature_collector') ||
    lower.includes('deprecated parameters') ||
    lower.includes('initialization function') ||
    lower.includes('pass a single object instead') ||
    lower.includes('wasm-bindgen') ||
    lower.includes('err_network_io_suspended') ||
    lower.includes('network_io_suspended') ||
    lower.includes('websocket')
  );
};

const filterConsole = (origFn) => {
  return function (...args) {
    try {
      const stack = ((new Error().stack || '') + '').toLowerCase();
      if (
        stack.includes('feature_collector') ||
        stack.includes('runtime.lasterror') ||
        stack.includes('chrome-extension://') ||
        stack.includes('content.js')
      ) {
        return;
      }
      const combined = args.map(a => {
        if (!a) return '';
        if (typeof a === 'string') return a;
        try { return JSON.stringify(a) || String(a); } catch { return String(a); }
      }).join(' ');
      if (isThirdPartyNoise(combined) || args.some(a => isThirdPartyNoise(a))) return;
    } catch (e) {}
    origFn.apply(console, args);
  };
};

console.error = filterConsole(console.error);
console.warn = filterConsole(console.warn);
console.info = filterConsole(console.info);
console.log = filterConsole(console.log);
console.debug = filterConsole(console.debug);

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
