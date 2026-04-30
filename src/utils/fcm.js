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

export async function getFCMToken() {
  try {
    if (!messaging) {
      console.error(' Messaging not initialized (SSR issue)');
      return null;
    }

    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
    });
    
    console.log('✅ FCM Token generated:', token?.substring(0, 20) + '...');
    return token;
  } catch (error) {
    console.error(' Error getting FCM token:', error);
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