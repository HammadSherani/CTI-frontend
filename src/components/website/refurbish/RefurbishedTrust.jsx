'use client';

import { Icon } from '@iconify/react';

// Edit these values to match your real numbers/policies.
const TRUST_ITEMS = [
  { icon: 'mdi:clipboard-check-outline', value: '32 Points', label: 'Quality Checks' },
  { icon: 'mdi:calendar-check-outline', value: '14 Days', label: 'Free Returns*' },
  { icon: 'mdi:shield-check-outline', value: 'Up to 12 Months', label: 'Warranty*' },
  { icon: 'mdi:truck-fast-outline', value: '24-48 Hrs', label: 'Express Dispatch' },
  { icon: 'mdi:lock-check-outline', value: '100% Secure', label: 'Payments' },
  { icon: 'mdi:check-decagram-outline', value: 'CTI Certified', label: 'Every Device' },
];

export default function RefurbishedTrust() {
  return (
    <section className="w-full">
      <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-5">CTI Trust</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {TRUST_ITEMS.map(({ icon, value, label }) => (
          <div
            key={label}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow px-3 py-6 flex flex-col items-center text-center"
          >
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-neutral-900 flex items-center justify-center mb-4">
              <Icon icon={icon} className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
            </div>
            <p className="text-sm sm:text-base font-extrabold text-gray-900 leading-tight">{value}</p>
            <p className="text-xs text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
