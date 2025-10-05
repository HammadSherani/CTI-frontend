'use client';

import { useEffect } from 'react';
import { toast } from 'react-toastify';
import axiosInstance from '@/config/axiosInstance';

export default function NotificationSetup() {
  useEffect(() => {
    initializeNotifications();
  }, []);

  const initializeNotifications = async () => {
    if (typeof window === 'undefined') return;

    try {
      // Step 1: Service Worker register karo
      if ('serviceWorker' in navigator) {
        await navigator.serviceWorker.register('/api/firebase-sw');
        console.log('✅ Custom SW registered');
        
        // Wait for service worker to be ready
        await navigator.serviceWorker.ready;
        console.log('✅ SW is ready');
      }

      // Step 2: Firebase dynamically import karo
      const { messaging } = await import('../lib/firebase');
      console.log('✅ Firebase messaging imported');

      // Step 3: Permission request
      await requestPermission(messaging);

      // Step 4: Foreground messages
      const { onMessage } = await import('firebase/messaging');
      onMessage(messaging, (payload) => {
        console.log('📩 Foreground message received:', payload);
        toast.success(`${payload.notification.title}: ${payload.notification.body}`);
      });

    } catch (error) {
      console.error('❌ Initialization error:', error);
    }
  };

  const requestPermission = async (messaging) => {
    try {
      console.log('🔔 Current permission:', Notification.permission);
      
      // Manual API test first
      console.log('🧪 Testing API connection...');
      try {
        const testResponse = await axiosInstance.get('/api/test'); // Create this endpoint
        console.log('✅ API connection working:', testResponse.status);
      } catch (apiError) {
        console.error('❌ API connection failed:', apiError);
      }

      // Force permission reset (for testing)
      if (Notification.permission === 'denied') {
        console.log('🚫 Permission denied. Please:');
        console.log('1. Click lock icon in address bar');
        console.log('2. Set Notifications to Allow');
        console.log('3. Refresh the page');
        toast.error('Please enable notifications in browser settings and refresh');
        return;
      }
      
      console.log('🔔 Requesting notification permission...');
      const permission = await Notification.requestPermission();
      console.log('🔔 Permission result:', permission);
      
      if (permission === 'granted') {
        console.log('🎯 Generating FCM token...');
        
        const { getToken } = await import('firebase/messaging');
        const token = await getToken(messaging, {
          vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
        });
        
        console.log('📱 FCM Token generated:', token ? 'SUCCESS' : 'FAILED');
        console.log('📱 Token preview:', token ? token.substring(0, 30) + '...' : 'NO TOKEN');
        
        if (token) {
          console.log('🚀 Sending token to backend...');
          try {
            const response = await axiosInstance.put('/api/fcm-token', { token });
            console.log('✅ Backend response:', response.data);
            console.log('🎉 FCM setup complete!');
          } catch (apiError) {
            console.error('❌ API call failed:', apiError.response?.data || apiError.message);
          }
        }
      } else {
        console.log('❌ Notification permission denied');
      }
    } catch (error) {
      console.error('❌ Permission/Token error:', error);
    }
  };

  return (
    <div style={{ position: 'fixed', top: '10px', right: '10px', zIndex: 9999 }}>
      {/* <button 
        onClick={() => initializeNotifications()}
        style={{ padding: '10px', background: 'primary', color: 'white', border: 'none', cursor: 'pointer' }}
      >
        Test Notifications
      </button> */}
    </div>
  );
}