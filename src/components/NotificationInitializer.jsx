// components/NotificationInitializer.js
'use client';

import { useEffect } from 'react';
import useNotifications from '@/hooks/useNotifications';
import { useSelector } from 'react-redux';

export default function NotificationInitializer() {
  const { fetchNotifications } = useNotifications();
  
  const { user, token } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user && token) {
      fetchNotifications(); 
    }
  }, [user, token, fetchNotifications]); 

  return null;
}