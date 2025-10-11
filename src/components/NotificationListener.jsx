'use client';

import { useEffect } from 'react';
import { onMessageListener } from '@/utils/fcm';

export default function NotificationListener() {
  useEffect(() => {
    onMessageListener((payload) => {
      // Show toast notification
      alert(`New notification: ${payload.notification.title}`);
      
      // Or use a toast library
      // toast.success(payload.notification.title);
    });
  }, []);

  return null;
}