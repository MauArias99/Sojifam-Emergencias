// ══════════════════════════════════════════
// SERVICE WORKER - SOJIFAM Emergencias
// Maneja notificaciones push en segundo plano
// y permite instalar como app (PWA)
// ══════════════════════════════════════════

importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyAP2NizrWa7kwhW1ys3poMEQoEmNDd7dmw",
  authDomain: "sojifam-emergencias.firebaseapp.com",
  projectId: "sojifam-emergencias",
  storageBucket: "sojifam-emergencias.firebasestorage.app",
  messagingSenderId: "1058585278400",
  appId: "1:1058585278400:web:46f28b76094fc7ad713a25"
});

const messaging = firebase.messaging();

// Notificación recibida con la app cerrada o en segundo plano
messaging.onBackgroundMessage(payload => {
  const titulo = payload.notification?.title || '🚨 Nueva Emergencia - SOJIFAM';
  const cuerpo = payload.notification?.body || 'Tenés un caso nuevo asignado';

  self.registration.showNotification(titulo, {
    body: cuerpo,
    icon: 'icon-192.png',
    badge: 'icon-192.png',
    vibrate: [200, 100, 200],
    tag: 'sojifam-emergencia',
    requireInteraction: true
  });
});

// Al hacer clic en la notificación, abrir/enfocar el dashboard
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if (client.url.includes('sojifam') && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('./');
      }
    })
  );
});

// Cache básico para que la app cargue offline (PWA)
const CACHE_NAME = 'sojifam-v3';
const URLS_TO_CACHE = ['./', './sojifam-megasuper.html'];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(URLS_TO_CACHE)).catch(()=>{})
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
  // Solo interceptamos peticiones GET de nuestro propio origen (los
  // archivos de la app: HTML, JS, íconos, etc). Cualquier otra cosa
  // (llamadas a Cloud Functions, Firestore, FCM, APIs externas, o
  // métodos POST/PUT) se deja pasar sin tocar. Si no hacemos esto,
  // el Service Worker puede romper las respuestas "opaque" de esas
  // peticiones (error: "Failed to convert value to 'Response'") y
  // las llamadas nunca llegan a destino.
  if (event.request.method !== 'GET') return;
  if (new URL(event.request.url).origin !== self.location.origin) return;

  // Network-first: siempre intenta traer la versión más reciente
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
