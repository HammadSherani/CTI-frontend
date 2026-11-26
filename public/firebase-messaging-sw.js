importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

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
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icon.png',
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
// Tapping a notification opens its page (chat pushes carry ?openChat=<id>), reusing an open tab
self.addEventListener('notificationclick', (event) => {
  const data = event.notification?.data || {};
  const link = data.link || (data.FCM_MSG && data.FCM_MSG.data && data.FCM_MSG.data.link) || '/';
  event.notification.close();
  event.waitUntil((async () => {
    const url = new URL(link, self.location.origin).href;
    const windows = await clients.matchAll({ type: 'window', includeUncontrolled: true });
    const sameSite = windows.find((w) => new URL(w.url).origin === new URL(url).origin);
    if (sameSite) {
      await sameSite.focus();
      if ('navigate' in sameSite) return sameSite.navigate(url);
      return undefined;
    }
    return clients.openWindow(url);
  })());
});
