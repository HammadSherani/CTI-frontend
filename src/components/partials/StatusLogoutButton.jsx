'use client';

import { Icon } from '@iconify/react';
import { Link } from '@/i18n/navigation';

/**
 * "Log out" for the account status screens (profile incomplete / under review / rejected ...),
 * where the normal header with the account menu is not shown.
 * floating: fixed in the top-right corner (for full-page screens without a card).
 */
export default function StatusLogoutButton({ floating = false }) {
  return (
    <Link
      href="/auth/logout"
      className={
        floating
          ? 'fixed top-4 right-4 z-50 inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-red-600 transition-colors'
          : 'mt-6 inline-flex items-center justify-center gap-2 text-sm font-medium text-gray-500 hover:text-red-600 transition-colors'
      }
    >
      <Icon icon="heroicons:arrow-right-on-rectangle" className="w-5 h-5" />
      Log out
    </Link>
  );
}
