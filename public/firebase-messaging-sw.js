// Tapping a notification opens its page (chat pushes carry ?openChat=<id>), reusing an open tab.
// Registered BEFORE Firebase on purpose: Firebase's own handler swallows the tap without opening our link.
self.addEventListener('notificationclick', (event) => {
  event.stopImmediatePropagation();
  const data = event.notification?.data || {};
  const link = data.link || (data.FCM_MSG && data.FCM_MSG.data && data.FCM_MSG.data.link) || '/';
  event.notification.close();
  event.waitUntil((async () => {
    const windows = await clients.matchAll({ type: 'window', includeUncontrolled: true });
    const sameSite = windows.find((w) => new URL(w.url).origin === self.location.origin);
    // stay in the language of the open tab
    const locale = sameSite && (new URL(sameSite.url).pathname.match(/^\/(tr|en)(?=\/|$)/) || [])[0];
    const path = locale && link.startsWith('/') && !/^\/(tr|en)(?=\/|\?|$)/.test(link) ? locale + link : link;
    const url = new URL(path, self.location.origin).href;
    if (!sameSite) return clients.openWindow(url);
    try {
      await sameSite.focus();
      return await sameSite.navigate(url);
    } catch {
      return clients.openWindow(url);
    }
  })());
});

// keep this version the same as the "firebase" package of the app
importScripts('https://www.gstatic.com/firebasejs/12.4.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/12.4.0/firebase-messaging-compat.js');

// a new version of this file takes over at once, without closing every tab first
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

firebase.initializeApp({
  apiKey: "AIzaSyAERS8YBxHBI94lLgJLZxFZTN0_MSQD-so",
  authDomain: "click-to-ite.firebaseapp.com",
  projectId: "click-to-ite",
  storageBucket: "click-to-ite.firebasestorage.app",
  messagingSenderId: "871535843727",
  appId: "1:871535843727:web:01f4994152dd1d1f7ad3fa"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('Background notification:', payload);
  // messages with a "notification" part are already shown by Firebase: showing them here doubles them
  if (payload.notification) return;
  
  const notificationTitle = payload.data?.title || 'New notification';
  const notificationOptions = {
    body: payload.data?.body || '',
    icon: '/icon.png',
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
