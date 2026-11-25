"use client";

import React from "react";
import { Icon } from "@iconify/react";
import { Link } from "@/i18n/navigation";

/* Pages that create or change products, ads or the profile. The backend blocks these actions too. */
const BLOCKED_PAGES = [
  /^\/seller\/product\/(add|import-export)/,
  /^\/seller\/product\/[^/]+\/(edit|variants)/,
  /^\/seller\/refurbished\/products\/(create|edit)/,
  /^\/seller\/refurbished\/products\/[^/]+\/variants/,
  /^\/seller\/ads\/(create|payment)/,
  /^\/seller\/ads\/[^/]+\/edit/,
  /^\/seller\/profile\/edit-profile/,
];

export const isBlockedForDeactivatedSeller = (pathname = "") => BLOCKED_PAGES.some((page) => page.test(pathname));

export function DeactivatedBanner() {
  return (
    <div role="alert" className="bg-red-50 border-b border-red-200 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-start gap-3">
        <Icon icon="mdi:account-off-outline" className="w-6 h-6 text-red-600 flex-shrink-0" />
        <div className="text-sm text-red-700">
          <p className="font-bold">Your seller account has been deactivated by the admin.</p>
          <p className="mt-0.5">
            Your products are hidden and you will not receive new orders. You cannot add or change products, ads or your profile.
            You can still complete existing orders and returns, view your history and use your wallet.
          </p>
        </div>
      </div>
    </div>
  );
}

export function DeactivatedPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 max-w-md text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon icon="mdi:lock-outline" className="w-8 h-8 text-red-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Not available</h2>
        <p className="text-sm text-gray-600 mb-6">
          Adding or changing products, ads and your profile is turned off while your account is deactivated. Please contact support if you
          think this is a mistake.
        </p>
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <Link href="/seller/order" className="px-5 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700">
            View my orders
          </Link>
          <Link href="/seller/dashboard" className="px-5 py-2.5 rounded-xl bg-gray-100 text-gray-700 text-sm font-semibold hover:bg-gray-200">
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
