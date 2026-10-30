import React from 'react';
import { Icon } from '@iconify/react';

export const metadata = {
  title: 'Cookie Policy | CTI',
  description: 'Learn how CTI uses cookies and tracking technologies to enhance your browsing and shopping experience.',
};

export default function CookiePolicyPage() {
  return (
    <div className="bg-white p-6 sm:p-10 rounded-2xl shadow-sm border border-gray-150">
      <div className="max-w-none space-y-8 text-gray-700">
        <div className="border-b border-gray-100 pb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider border border-blue-200/60 mb-3">
            <Icon icon="solar:shield-warning-linear" className="text-sm" />
            <span>Transparency & Privacy</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Cookie Policy
          </h1>
          <p className="text-gray-500 text-sm mt-2">
            This Cookie Policy explains how CTI uses cookies, local storage, and similar technologies.
          </p>
        </div>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-900">1. What Are Cookies?</h2>
          <p className="leading-relaxed text-sm sm:text-base">
            Cookies are small text files stored on your browser or device when you visit websites. They help us remember your preferences, keep your session authenticated, store items in your cart/wishlist, and understand how you interact with our platform.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-900">2. Types of Cookies We Use</h2>
          <div className="space-y-3 pt-1">
            <div className="p-4 rounded-xl border border-gray-200 bg-gray-50">
              <h3 className="font-bold text-gray-900 text-sm sm:text-base">A. Essential / Strictly Necessary Cookies</h3>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">Required for core functionalities such as secure login, language switching, cart management, and checkout processing.</p>
            </div>
            <div className="p-4 rounded-xl border border-gray-200 bg-gray-50">
              <h3 className="font-bold text-gray-900 text-sm sm:text-base">B. Preference & Localization Cookies</h3>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">Used to store your selected currency, default language (e.g. Turkish or English), and chosen delivery city.</p>
            </div>
            <div className="p-4 rounded-xl border border-gray-200 bg-gray-50">
              <h3 className="font-bold text-gray-900 text-sm sm:text-base">C. Analytics & Performance Cookies</h3>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">Help us track aggregated page views, detect technical errors, and optimize loading speeds for all users.</p>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-900">3. Managing and Disabling Cookies</h2>
          <p className="leading-relaxed text-sm sm:text-base">
            You can control or delete cookies through your browser settings at any time. However, disabling essential cookies may impact your ability to place orders, maintain your wishlist, or log into your CTI account.
          </p>
        </section>
      </div>
    </div>
  );
}

