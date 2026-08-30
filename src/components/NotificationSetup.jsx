'use client';

import { useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import axiosInstance from '@/config/axiosInstance';

export default function NotificationSetup() {
  const { token } = useSelector((s) => s.auth);
  const isInitialized = useRef(false);

  useEffect(() => {
    // Only init when user is logged in and not already initialized
    if (token && !isInitialized.current) {
      isInitialized.current = true;
      initializeNotifications(token);
    }
    // Reset if user logs out
    if (!token) {
      isInitialized.current = false;
    }
  }, [token]);

  const initializeNotifications = async (authToken) => {
    if (typeof window === 'undefined') return;
    if (!('Notification' in window)) return;

    try {
      // Step 1: Register Service Worker
      if ('serviceWorker' in navigator) {
        await navigator.serviceWorker.register('/api/firebase-sw');
        await navigator.serviceWorker.ready;
        console.log('✅ Service Worker ready');
      }

      // Step 2: Import Firebase messaging
      const { messaging } = await import('../lib/firebase');
      if (!messaging) {
        console.warn('⚠️ Firebase messaging not available');
        return;
      }

      // Step 3: Request permission & get FCM token
      await requestPermissionAndSaveToken(messaging, authToken);

      // Step 4: Handle foreground messages (app is open)
      const { onMessage } = await import('firebase/messaging');
      onMessage(messaging, (payload) => {
        const title = payload.notification?.title || 'New Notification';
        const body = payload.notification?.body || '';
        toast.info(`🔔 ${title}: ${body}`, { autoClose: 6000 });
      });

    } catch (error) {
      console.error('❌ NotificationSetup error:', error);
    }
  };

  const requestPermissionAndSaveToken = async (messaging, authToken) => {
    try {
      if (Notification.permission === 'denied') {
        console.warn('🚫 Notification permission denied');
        return;
      }

      const permission = await Notification.requestPermission();
      if (permission !== 'granted') return;

      console.log('✅ Notification permission granted');

      const { getToken } = await import('firebase/messaging');
      const fcmToken = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      });

      if (!fcmToken) {
        console.warn('⚠️ FCM token not generated');
        return;
      }

      console.log('📱 FCM token generated, saving to backend...');

      // Save token to backend with Authorization header
      await axiosInstance.post(
        '/update-fcm-token',
        { fcmToken },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      console.log('🎉 FCM token saved successfully');
    } catch (err) {
      console.error('❌ FCM permission/token error:', err);
    }
  };

  return null;
}