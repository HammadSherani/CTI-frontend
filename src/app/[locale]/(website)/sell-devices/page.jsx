"use client";

import { useRouter } from '@/i18n/navigation';
import { useEffect } from 'react';

// Default sell-devices page redirects to mobile-phone category
export default function SellDevicesIndex() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/sell-devices/phone');
  }, [router]);

  return (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
    </div>
  );
}
