'use client';

// Browser push notifications: saves this browser's token for the logged-in account, tells the user
// when this browser cannot receive them (and how to switch them on), and shows pushes that arrive
// while the site is open (Firebase only shows them by itself when it is not).
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { onMessage } from 'firebase/messaging';
import { messaging } from '@/lib/firebase';
import { updateFCMToken, getFCMToken, getPushRegistration } from '@/utils/fcm';

const TOAST_ID = 'push-off';

const supported = () => 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;

const UNAVAILABLE = {
  title: 'Notifications are not available here',
  text: 'This browser cannot receive them. Open the site in Chrome, Edge or Firefox (not in a private window or inside another app).',
};

/** The user, or the browser, has refused notifications for this site. */
function blockedHelp() {
  const agent = navigator.userAgent;
  let text = 'Click the icon on the left of the address bar, set Notifications to "Allow", then reload the page.';
  if (/firefox/i.test(agent)) text = 'Click the lock icon in the address bar, remove "Blocked" next to notifications, then reload the page.';
  else if (/safari/i.test(agent) && !/chrome|chromium|crios|edg|android/i.test(agent)) text = 'Open Safari Settings > Websites > Notifications, allow this site, then reload the page.';
  return { title: 'Notifications are blocked', text };
}

/** Permission was given, but the browser still does not hand out a push address. */
function browserHelp() {
  if (navigator.brave) {
    return {
      title: 'Brave is blocking notifications',
      text: 'Open brave://settings/privacy, switch on "Use Google services for push messaging", then restart Brave.',
    };
  }
  return {
    title: 'Notifications could not be switched on',
    text: 'Check that your computer or phone allows notifications for this browser and that this is not a private window, then reload the page.',
  };
}

function PushHelp({ title, text, action, onAction }) {
  return (
    <div>
      <p className="text-sm font-bold">{title}</p>
      <p className="mt-1 text-xs break-words">{text}</p>
      {action && (
        <button type="button" onClick={onAction} className="mt-2 cursor-pointer rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-primary-700">
          {action}
        </button>
      )}
    </div>
  );
}

/** Shown once per browser tab so it does not nag; `again` replaces it after the user acted. */
function tell(help, again = false) {
  if (toast.isActive(TOAST_ID)) {
    toast.update(TOAST_ID, { render: <PushHelp {...help} />, autoClose: false });
    return;
  }
  if (!again && sessionStorage.getItem('push-off-told')) return;
  sessionStorage.setItem('push-off-told', '1');
  toast.warn(<PushHelp {...help} />, { toastId: TOAST_ID, autoClose: false, closeOnClick: false });
}

export default function NotificationSetup() {
  const { token } = useSelector((s) => s.auth);

  useEffect(() => {
    if (!token) return undefined;
    if (!supported() || !messaging) {
      tell(UNAVAILABLE);
      return undefined;
    }
    let stopped = false;

    const register = async () => {
      if (await updateFCMToken(token)) {
        toast.dismiss(TOAST_ID);
        return true;
      }
      // saving can also fail because the server is unreachable: only a browser problem is reported
      if (!stopped && !(await getFCMToken())) tell(browserHelp(), true);
      return false;
    };

    // the browser's question is asked from a click: some browsers ignore it otherwise
    const turnOn = async () => {
      if ((await Notification.requestPermission()) !== 'granted') return tell(blockedHelp(), true);
      if (await register()) toast.success('Notifications are on');
      return undefined;
    };

    if (Notification.permission === 'granted') register();
    else if (Notification.permission === 'denied') tell(blockedHelp());
    else {
      tell({
        title: 'Turn on notifications',
        text: 'Get your order and message updates, even when this site is closed.',
        action: 'Turn on',
        onAction: turnOn,
      });
    }

    // switched on from the browser's own menu
    let permission = null;
    navigator.permissions?.query({ name: 'notifications' })
      .then((status) => {
        if (stopped) return;
        permission = status;
        permission.onchange = () => { if (Notification.permission === 'granted') register(); };
      })
      .catch(() => { });

    const stopMessages = onMessage(messaging, async (payload) => {
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

    return () => {
      stopped = true;
      if (permission) permission.onchange = null;
      stopMessages();
    };
  }, [token]);

  return null;
}
