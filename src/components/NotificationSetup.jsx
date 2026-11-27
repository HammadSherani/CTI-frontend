'use client';

// Browser push notifications: saves this browser's token for the logged-in account, and shows
// pushes that arrive while the site is open (Firebase only shows them by itself when it is not).
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { onMessage } from 'firebase/messaging';
import { messaging } from '@/lib/firebase';
import { updateFCMToken, getPushRegistration } from '@/utils/fcm';

/** Why this browser cannot receive push notifications, in words the user can act on. */
function pushOffMessage() {
  if (Notification.permission !== 'granted') return 'Notifications are not allowed for this site. Allow them from the icon next to the address, then reload.';
  if (navigator.brave) return 'Brave is blocking push notifications. Open brave://settings/privacy, switch on "Use Google services for push messaging" and restart Brave.';
  return 'Push notifications could not be switched on in this browser.';
}

export default function NotificationSetup() {
  const { token } = useSelector((s) => s.auth);

  useEffect(() => {
    if (!token || !messaging || !('Notification' in window) || !('serviceWorker' in navigator)) return undefined;
    updateFCMToken(token).then((saved) => {
      // said once per browser tab, so it does not nag
      if (saved || sessionStorage.getItem('push-off-told')) return;
      sessionStorage.setItem('push-off-told', '1');
      toast.warn(pushOffMessage(), { toastId: 'push-off', autoClose: 15000 });
    });

    return onMessage(messaging, async (payload) => {
      console.info('[Push] received:', payload.notification?.title);
      if (payload.data?.type === 'chat_message') return; // the open chat has its own sound and badge
      try {
        const registration = await getPushRegistration();
        await registration.showNotification(payload.notification?.title || 'New notification', {
          body: payload.notification?.body || '',
          icon: '/icon.png',
          tag: payload.data?.notificationId,
          data: payload.data,
        });
      } catch (error) {
        console.warn('Could not show the notification:', error.message);
      }
    });
  }, [token]);

  return null;
}
