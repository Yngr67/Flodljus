'use strict';
// ===== Fristående app: installation och spel utan internet =====
// Spelet går att lägga på hemskärmen (mobil) eller installera som program (dator).
// En service worker (sw.js) sparar spelets filer i enheten, så att det startar även utan nät.
const App = {
  installEvt: null, offline: false,
  standalone: (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true,
  ios: /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1),
  framed: (() => { try { return window.top !== window.self; } catch (e) { return true; } })(),
  secure: location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1',
};
function appChanged() { if (typeof START !== 'undefined' && typeof C !== 'undefined' && !C && typeof renderStart === 'function') renderStart(START.saved); }
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); App.installEvt = e; appChanged(); });
window.addEventListener('appinstalled', () => { App.installEvt = null; App.standalone = true; appChanged(); });
try {
  if ('serviceWorker' in navigator && App.secure && !App.framed) {
    navigator.serviceWorker.register('sw.js').then(() => navigator.serviceWorker.ready).then(() => { App.offline = true; appChanged(); }).catch(() => {});
  }
  // Be webbläsaren att inte rensa sparningen när lagringen blir full
  if (navigator.storage && navigator.storage.persist && !App.framed) navigator.storage.persist().catch(() => {});
} catch (e) { /* inget offline-stöd här */ }
