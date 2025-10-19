// components/NotificationInitializer.js
'use client';

import { useEffect } from 'react';
import useNotifications from '@/hooks/useNotifications';
import { useSelector } from 'react-redux';

export default function NotificationInitializer() {
  const { fetchNotifications } = useNotifications();
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    if (user) {
      fetchNotifications(); 
    }
  }, [user]);

  return null;
}