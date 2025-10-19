'use client';

import { useEffect } from 'react';
import { useDispatch } from 'react-redux'; // ⬅️ Add
import { onMessageListener } from '@/utils/fcm';
import { toast } from 'react-toastify';
import { addNotification } from '@/store/notifications'; // ⬅️ Add

export default function NotificationListener() {
  const dispatch = useDispatch(); // ⬅️ Add

  useEffect(() => {
    const unsubscribe = onMessageListener((payload) => {
      if (!payload?.notification) {
        console.error('⚠️ Invalid notification payload:', payload);
        return;
      }

      const { title, body } = payload.notification;

      console.log('📬 Foreground notification received:', payload);

      // ⬅️ Redux mein add karo
      dispatch(addNotification({
        _id: Date.now().toString(),
        title: title || 'New Notification',
        body: body || '',
        data: payload.data || {},
        isRead: false,
        createdAt: new Date().toISOString()
      }));

      // Toast notification
      toast.success(`${title || 'New Notification'}\n${body || ''}`, {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: 'light',
      });
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [dispatch]); // ⬅️ Add dependency

  return null;
}