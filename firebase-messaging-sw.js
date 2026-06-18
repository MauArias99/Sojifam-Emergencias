// ══════════════════════════════════════════
// FIREBASE MESSAGING SERVICE WORKER
// Firebase Messaging busca este archivo con este
// nombre exacto en la raíz del sitio por defecto.
// Si no existe, el SDK falla con error 404 al
// intentar registrar el service worker de
// mensajería — y eso interrumpe TODAS las llamadas
// que usan el SDK de Firebase (incluyendo
// httpsCallable de Cloud Functions), no solo las
// notificaciones push.
//
// El contenido es el mismo que sw.js, así que las
// notificaciones en segundo plano funcionan igual
// sin importar cuál de los dos quede registrado.
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
