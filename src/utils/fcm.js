import { getToken, onMessage } from 'firebase/messaging';
import { messaging } from '@/lib/firebase';
import axiosInstance from '@/config/axiosInstance';

export async function requestNotificationPermission() {
  try {
    if (!('Notification' in window)) {
      console.log(' Browser does not support notifications');
      return false;
    }

    const permission = await Notification.requestPermission();

    if (permission === 'granted') {
      console.log('✅ Notification permission granted');
      return true;
    } else {
      console.log(' Notification permission denied');
      return false;
    }
  } catch (error) {
    console.error('Error requesting permission:', error);
    return false;
  }
}

/**
 * The service worker that receives pushes. It is registered for the whole site: waiting for
 * "ready" never finishes with a worker that does not cover the current page.
 */
export async function getPushRegistration() {
  await navigator.serviceWorker.register('/firebase-messaging-sw.js');
  return Promise.race([
    navigator.serviceWorker.ready,
    // login waits for this, so it must never hang
    new Promise((_, reject) => setTimeout(() => reject(new Error('Service worker did not start')), 10000)),
  ]);
}

export async function getFCMToken() {
  try {
    if (!messaging) {
      console.error(' Messaging not initialized (SSR issue)');
      return null;
    }

    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: await getPushRegistration(),
    });

    console.log('✅ FCM Token generated:', token?.substring(0, 20) + '...');
    return token;
  } catch (error) {
    // Brave blocks this until "Use Google services for push messaging" is switched on
    console.warn('Push notifications are not available in this browser:', error.message);
    return null;
  }
}

export async function updateFCMToken(authToken) {
  try {
    // Check if running in browser
    if (typeof window === 'undefined') {
      console.log('⚠️ Cannot run on server side');
      return false;
    }

    console.log('🔄 Starting FCM token update...');

    const hasPermission = await requestNotificationPermission();

    if (!hasPermission) {
      console.log('⚠️ No notification permission');
      return false;
    }

    const fcmToken = await getFCMToken();

    if (!fcmToken) {
      console.log('⚠️ Could not get FCM token');
      return false;
    }

    console.log('📤 Sending FCM token to backend...');

    const response = await axiosInstance.post(
      '/update-fcm-token',
      { fcmToken },
      {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      }
    );

    console.log('📥 Backend response:', response.data);

    if (response.data.success) {
      console.log('✅ FCM token updated on server');
      return true;
    } else {
      console.error(' Failed to update FCM token:', response.data);
      return false;
    }

  } catch (error) {
    console.error(' Error updating FCM token:', error.response?.data || error.message);
    return false;
  }
}

/** On sign-out: this browser stops receiving that account's pushes. */
export async function removeFCMToken(authToken) {
  if (!authToken || !('Notification' in window) || Notification.permission !== 'granted') return;
  const fcmToken = await getFCMToken();
  if (!fcmToken) return;
  await axiosInstance
    .post('/remove-fcm-token', { fcmToken }, { headers: { Authorization: `Bearer ${authToken}` } })
    .catch((error) => console.warn('Could not remove this browser from push:', error.message));
}

// Listen to foreground notifications
export function onMessageListener(callback) {
  if (!messaging) {
    console.error(' Messaging not initialized');
    return;
  }

  onMessage(messaging, (payload) => {
    console.log('📬 Foreground notification received:', payload);
    callback(payload);
  });
}